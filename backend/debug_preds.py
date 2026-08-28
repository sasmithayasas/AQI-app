import os
import pandas as pd
import numpy as np
from services.weather import fetch_and_prepare_data
from services.model_service import (
    load_all_models,
    FEATURE_COLS,
    LOADED_SCALER_X,
    LOADED_BILSTM,
    LOADED_SCALER_Y,
    LOADED_XGB,
    pm25_to_aqi
)

load_all_models()
for city in ['colombo', 'kandy']:
    print(f"\n=== DEBUGGING {city.upper()} ===")
    current_row, past_df, current_pm25, full_df = fetch_and_prepare_data(city)
    print("current observation pm25:", current_pm25, "AQI:", pm25_to_aqi(current_pm25))
    
    feats = FEATURE_COLS[city]
    
    # 1. Check BiLSTM on past_df
    X_window = past_df[feats].tail(48).values
    X_scaled = LOADED_SCALER_X[city].transform(X_window)
    pred_lstm = LOADED_BILSTM[city].predict(np.expand_dims(X_scaled, 0), verbose=0)
    pred_lstm_raw = LOADED_SCALER_Y[city].inverse_transform(pred_lstm.reshape(-1, 1)).flatten()
    print("BiLSTM 24h predictions (PM2.5):", [round(float(x), 1) for x in pred_lstm_raw])
    print("BiLSTM 24h AQI:", [pm25_to_aqi(x) for x in pred_lstm_raw])
    
    # 2. Check XGBoost on latest observation
    xgb_preds = {h: round(float(m.predict(past_df[feats].tail(1))[0]), 1) for h, m in LOADED_XGB[city].items()}
    print("XGBoost multi-horizon PM2.5:", xgb_preds)
    print("XGBoost multi-horizon AQI:", {h: pm25_to_aqi(v) for h, v in xgb_preds.items()})
