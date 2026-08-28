"""
LSTM Model Service
Handles loading Keras LSTM models and running 24-hour AQI predictions.
"""
import os
import json
import joblib
import numpy as np

# ── Constants ────────────────────────────────────────────────────────────────
NEW_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "files", "newModels")
SEQUENCE_LENGTH = 72   # 72 hours of past data fed to the LSTM
TARGET_HORIZON = 24    # Predicts 24 hours into the future

# City → model/scaler/feature file mapping
CITY_MODEL_MAP = {
    "kandy": {
        "model_file":   "lstm_kandy_model.keras",
        "scaler_file":  "lstm_kandy_scaler.pkl",
        "feature_file": "kandy_feature_cols.json",
    },
    "colombo": {
        "model_file":   "lstm_aqi_model.keras",
        "scaler_file":  "lstm_aqi_scaler.pkl",
        "feature_file": "colombo_feature_cols.json",
    },
}

# Loaded artifacts – populated at startup
LSTM_MODELS    = {}
LSTM_SCALERS   = {}
FEATURE_COLS   = {}

# Features to build from Open-Meteo (mapped to training feature names)
# 'pm2.5_corrected' → use Open-Meteo pm2_5
# 'sensor_index'    → constant 0 (was only a PurpleAir identifier)
OPEN_METEO_FEATURE_MAP = {
    "humidity":          "humidity_percent",   # Open-Meteo: relative_humidity_2m
    "temperature":       "temperature",        # Open-Meteo: temperature_2m (°C)
    "pm2.5_atm":         "pm25",               # Open-Meteo: pm2_5
    "pm2.5_corrected":   "pm25",               # substitute – same source
    "aqi":               "aqi_live",           # computed on-the-fly from pm25
    "temperature_c":     "temperature",        # duplicate alias in training data
    "humidity_percent":  "humidity_percent",
    "precipitation_mm":  "Rain_mm",
    "wind_speed_kmh":    "WindSpeed_kmh",
    "wind_direction_deg":"WindDir_deg",
    "no2_density":       "no2",
}


def load_lstm_models():
    """Called once at FastAPI startup."""
    from tensorflow.keras.models import load_model  # lazy import to keep startup fast
    for city, cfg in CITY_MODEL_MAP.items():
        model_path   = os.path.join(NEW_MODELS_DIR, cfg["model_file"])
        scaler_path  = os.path.join(NEW_MODELS_DIR, cfg["scaler_file"])
        feature_path = os.path.join(NEW_MODELS_DIR, cfg["feature_file"])

        if not os.path.exists(model_path):
            print(f"WARNING: LSTM model not found for {city}: {model_path}")
            continue

        LSTM_MODELS[city]  = load_model(model_path)
        LSTM_SCALERS[city] = joblib.load(scaler_path)

        with open(feature_path) as f:
            FEATURE_COLS[city] = json.load(f)

        print(f"Loaded LSTM model + scaler for {city}")


def _pm25_to_aqi_simple(pm):
    """Inline AQI helper to avoid circular imports."""
    BP = [
        (0.0,12.0,0,50),(12.1,35.4,51,100),(35.5,55.4,101,150),
        (55.5,150.4,151,200),(150.5,250.4,201,300),
        (250.5,350.4,301,400),(350.5,500.4,401,500),
    ]
    if pm is None or np.isnan(pm) or pm < 0:
        return np.nan
    for c_lo, c_hi, i_lo, i_hi in BP:
        if c_lo <= pm <= c_hi:
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm - c_lo) + i_lo)
    return 500


def predict_lstm_24h(city: str, df, current_time):
    """
    Generate 24 authentic LSTM predictions by sliding the 72-hour window backwards.
    """
    if city not in LSTM_MODELS:
        print(f"No LSTM model loaded for {city}")
        return []

    model  = LSTM_MODELS[city]
    scaler = LSTM_SCALERS[city]
    feat_cols = FEATURE_COLS[city]

    live = df.copy()
    live["humidity_percent"] = live["Humidity_pct"]
    live["temperature"]      = live["Temp_C"] * 1.8 + 32
    live["pm25_val"]         = live["pm25"]
    live["aqi_live"]         = live["pm25"].apply(_pm25_to_aqi_simple)

    col_map = {
        "time_stamp":       live["time"],
        "sensor_index":     0,
        "humidity":         live["Humidity_pct"],
        "temperature":      live["Temp_C"] * 1.8 + 32,
        "pm2.5_atm":        live["pm25"] * 2.0,
        "pm2.5_corrected":  live["pm25"],
        "aqi":              live["aqi_live"],
        "temperature_c":    live["Temp_C"],
        "humidity_percent": live["Humidity_pct"],
        "precipitation_mm": live["Rain_mm"],
        "wind_speed_kmh":   live["WindSpeed_kmh"],
        "wind_direction_deg": live["WindDir_deg"],
        "no2_density":      live["no2"],
    }

    import pandas as pd
    feature_df = pd.DataFrame({c: col_map[c] for c in feat_cols if c in col_map})

    if "time_stamp" in feature_df.columns:
        feature_df["time_stamp"] = feature_df["time_stamp"].astype('int64') // 10**9

    for c in feat_cols:
        if c == "sensor_index":
            feature_df[c] = 0
        if c not in feature_df.columns:
            feature_df[c] = 0

    feature_df = feature_df[feat_cols].ffill().bfill()
    feature_df = feature_df.astype(float)
    feature_df.index = live["time"] # Keep time index for slicing

    predictions = []
    aqi_col_idx = feat_cols.index("aqi") if "aqi" in feat_cols else 6

    # Generate prediction for horizon h (1 to 24)
    for h in range(1, 25):
        # To predict (now + h) using a T+24 model, the input window must end at (now + h - 24)
        target_end_time = current_time + pd.Timedelta(hours=h-24)
        
        # Get exactly the 72 hours ending at target_end_time
        # Since df is hourly, we can just slice up to target_end_time and take the last 72
        window_df = feature_df[feature_df.index <= target_end_time]
        
        if len(window_df) < SEQUENCE_LENGTH:
            # We don't have enough history to go this far back (unlikely since we have 5 days)
            continue
            
        seq = window_df.iloc[-SEQUENCE_LENGTH:].values

        scaled_seq = scaler.transform(seq)
        scaled_seq = np.clip(scaled_seq, 0.0, 1.0)
        X = scaled_seq.reshape(1, SEQUENCE_LENGTH, len(feat_cols))

        scaled_pred = model.predict(X, verbose=0)

        dummy = np.zeros((1, len(feat_cols)))
        dummy[0, aqi_col_idx] = scaled_pred[0, 0]
        unscaled = scaler.inverse_transform(dummy)
        pred_aqi = max(0, round(float(unscaled[0, aqi_col_idx])))
        
        pred_time = current_time + pd.Timedelta(hours=h)

        predictions.append({
            "horizon": h,
            "time":    pred_time.isoformat(),
            "aqi":     int(pred_aqi),
            "pm25":    None
        })

    return predictions
