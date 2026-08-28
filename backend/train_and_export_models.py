"""
Production Model Compiler for SentinelAQ
Trains and exports:
1. BiLSTM with Multi-Head Self-Attention (.keras)
2. Multi-Horizon XGBoost Regressors across h in [1, 6, 12, 24, 48] (.json)
3. Scalers & Feature Schemas (.pkl, .json)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.preprocessing import MinMaxScaler
import xgboost as xgb

try:
    import tensorflow as tf
    from tensorflow.keras.models import Model
    from tensorflow.keras.layers import Input, Dense, LSTM, Bidirectional, Dropout, MultiHeadAttention, LayerNormalization, Add
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    HAS_TF = True
except Exception as e:
    print(f"TensorFlow not available: {e}")
    HAS_TF = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "..", "ml", "data", "processed")

LOOKBACK = 48
HORIZON = 24
HORIZONS = [1, 6, 12, 24, 48]
CITIES = ["colombo", "kandy"]


def engineer_features(df, target_col="pm2.5_corrected", time_col="datetime"):
    data = df.copy()
    if time_col in data.columns:
        data[time_col] = pd.to_datetime(data[time_col])
        data = data.sort_values(time_col).reset_index(drop=True)
        hour = data[time_col].dt.hour
        month = data[time_col].dt.month
        dow = data[time_col].dt.dayofweek
        
        data["Hour_sin"] = np.sin(2 * np.pi * hour / 24)
        data["Hour_cos"] = np.cos(2 * np.pi * hour / 24)
        data["Month_sin"] = np.sin(2 * np.pi * month / 12)
        data["Month_cos"] = np.cos(2 * np.pi * month / 12)
        data["DOW_sin"] = np.sin(2 * np.pi * dow / 7)
        data["DOW_cos"] = np.cos(2 * np.pi * dow / 7)
        data["Is_Weekend"] = (dow >= 5).astype(int)

    if "wind_direction_deg" in data.columns:
        rad = np.radians(data["wind_direction_deg"])
        data["WindDir_sin"] = np.sin(rad)
        data["WindDir_cos"] = np.cos(rad)
        if "wind_speed_kmh" in data.columns:
            data["Wind_U"] = -data["wind_speed_kmh"] * np.sin(rad)
            data["Wind_V"] = -data["wind_speed_kmh"] * np.cos(rad)
    elif "WindDir_sin" in data.columns and "WindDir_cos" in data.columns:
        if "wind_speed_kmh" in data.columns:
            data["Wind_U"] = -data["wind_speed_kmh"] * data["WindDir_sin"]
            data["Wind_V"] = -data["wind_speed_kmh"] * data["WindDir_cos"]
    else:
        data["WindDir_sin"] = 0.0
        data["WindDir_cos"] = 1.0
        data["Wind_U"] = 0.0
        data["Wind_V"] = 0.0

    if "temperature_c" in data.columns and "humidity_percent" in data.columns:
        a, b = 17.27, 237.7
        alpha = ((a * data["temperature_c"]) / (b + data["temperature_c"])) + np.log(data["humidity_percent"].clip(1, 100) / 100.0)
        data["DewPoint_C"] = (b * alpha) / (a - alpha)
        data["DewPoint_Depression"] = data["temperature_c"] - data["DewPoint_C"]
        data["Temp_Humidity_Index"] = data["temperature_c"] * (data["humidity_percent"] / 100.0)

    if target_col in data.columns:
        for lag in [1, 2, 3, 6, 12, 24, 48]:
            data[f"Lag_{lag}h"] = data[target_col].shift(lag)
        for w in [3, 6, 12, 24]:
            data[f"Roll_{w}h_mean"] = data[target_col].shift(1).rolling(w, min_periods=1).mean()
            data[f"Roll_{w}h_std"]  = data[target_col].shift(1).rolling(w, min_periods=1).std().fillna(0)
            data[f"Roll_{w}h_max"]  = data[target_col].shift(1).rolling(w, min_periods=1).max()
            data[f"Roll_{w}h_min"]  = data[target_col].shift(1).rolling(w, min_periods=1).min()

    data = data.dropna().reset_index(drop=True)
    return data


def create_sequences(X_data, y_data, lookback=48, horizon=24):
    X_seq, y_seq = [], []
    if len(X_data) < lookback + horizon:
        return np.empty((0, lookback, X_data.shape[1])), np.empty((0, horizon))
    for i in range(len(X_data) - lookback - horizon + 1):
        X_seq.append(X_data[i : i + lookback])
        y_seq.append(y_data[i + lookback : i + lookback + horizon])
    return np.array(X_seq), np.array(y_seq)


def build_bilstm_attention_model(input_shape, horizon=24):
    inputs = Input(shape=input_shape)
    x = Bidirectional(LSTM(64, return_sequences=True))(inputs)
    x = LayerNormalization()(x)
    x = Dropout(0.2)(x)
    
    attn_out = MultiHeadAttention(num_heads=4, key_dim=32)(x, x)
    x = Add()([x, attn_out])
    x = LayerNormalization()(x)
    
    x = Bidirectional(LSTM(32, return_sequences=False))(x)
    x = Dropout(0.2)(x)
    
    x = Dense(64, activation="relu")(x)
    outputs = Dense(horizon)(x)
    
    model = Model(inputs=inputs, outputs=outputs, name="BiLSTM_Attention")
    model.compile(optimizer=Adam(learning_rate=1e-3), loss="huber", metrics=["mae"])
    return model


def train_city_models(city):
    print(f"\n=======================================================")
    print(f"🛠️ Training Production Models for {city.upper()}...")
    print(f"=======================================================")
    
    csv_file = os.path.join(DATA_DIR, f"{city}_dataset.csv")
    if not os.path.exists(csv_file):
        # Check files/ folder
        csv_file = os.path.join(BASE_DIR, "..", "files", f"{city}_dataset.csv")
    
    if not os.path.exists(csv_file):
        print(f"Dataset not found for {city}: {csv_file}")
        return

    df_raw = pd.read_csv(csv_file)
    df_feat = engineer_features(df_raw, target_col="pm2.5_corrected", time_col="datetime")
    
    TARGET = "pm2.5_corrected"
    EXCLUDE = ["time_stamp", "sensor_index", "datetime", "DateTime_UTC", "Split", TARGET, "aqi", "pm2.5_atm"]
    FEATURE_COLS = [c for c in df_feat.columns if c not in EXCLUDE]
    
    n = len(df_feat)
    train_df = df_feat.iloc[:int(n * 0.8)]
    val_df   = df_feat.iloc[int(n * 0.8):int(n * 0.9)]
    test_df  = df_feat.iloc[int(n * 0.9):]

    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # 1. Save feature schema
    with open(os.path.join(MODELS_DIR, f"{city}_feature_cols.json"), "w") as f:
        json.dump(FEATURE_COLS, f)
    print(f"✅ Saved feature schema ({len(FEATURE_COLS)} features)")

    # 2. Train and Save Scalers
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    
    X_train_scaled = scaler_X.fit_transform(train_df[FEATURE_COLS])
    y_train_scaled = scaler_y.fit_transform(train_df[[TARGET]])
    
    X_val_scaled = scaler_X.transform(val_df[FEATURE_COLS])
    y_val_scaled = scaler_y.transform(val_df[[TARGET]])

    joblib.dump(scaler_X, os.path.join(MODELS_DIR, f"{city}_scaler_X.pkl"))
    joblib.dump(scaler_y, os.path.join(MODELS_DIR, f"{city}_scaler_y.pkl"))
    print("✅ Scalers fitted and saved")

    # 3. Train Multi-Horizon XGBoost Models
    for h in HORIZONS:
        y_tr_h = train_df[TARGET].shift(-h).dropna()
        X_tr_h = train_df[FEATURE_COLS].iloc[:len(y_tr_h)]
        
        y_va_h = val_df[TARGET].shift(-h).dropna()
        X_va_h = val_df[FEATURE_COLS].iloc[:len(y_va_h)]

        xgb_model = xgb.XGBRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        xgb_model.fit(X_tr_h, y_tr_h, eval_set=[(X_va_h, y_va_h)], verbose=False)
        
        save_path = os.path.join(MODELS_DIR, f"{city}_xgb_h{h}.json")
        xgb_model.save_model(save_path)
        print(f"✅ Saved XGBoost horizon h={h} to {save_path}")

    # 4. Train BiLSTM-Attention Model
    if HAS_TF:
        X_tr_seq, y_tr_seq = create_sequences(X_train_scaled, y_train_scaled.flatten(), LOOKBACK, HORIZON)
        X_va_seq, y_va_seq = create_sequences(X_val_scaled, y_val_scaled.flatten(), LOOKBACK, HORIZON)

        if len(X_tr_seq) > 0 and len(X_va_seq) > 0:
            bilstm_model = build_bilstm_attention_model((LOOKBACK, len(FEATURE_COLS)), horizon=HORIZON)
            
            callbacks = [
                EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True),
                ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5)
            ]
            
            bilstm_model.fit(
                X_tr_seq, y_tr_seq,
                validation_data=(X_va_seq, y_va_seq),
                epochs=15,
                batch_size=64,
                callbacks=callbacks,
                verbose=1
            )
            
            keras_path = os.path.join(MODELS_DIR, f"{city}_bilstm_attention.keras")
            bilstm_model.save(keras_path)
            print(f"✅ Saved BiLSTM-Attention network to {keras_path}")


if __name__ == "__main__":
    for c in CITIES:
        train_city_models(c)
    print("\n🎉 All production models and scalers compiled successfully!")
