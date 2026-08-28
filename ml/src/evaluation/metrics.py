"""
Model Evaluation Metrics for PM2.5 and AQI Forecasting
"""
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

EPA_BREAKPOINTS = [
    (0.0,   12.0,   0,  50, "Good"),
    (12.1,  35.4,  51, 100, "Moderate"),
    (35.5,  55.4, 101, 150, "Unhealthy for Sensitive Groups"),
    (55.5, 150.4, 151, 200, "Unhealthy"),
    (150.5, 250.4, 201, 300, "Very Unhealthy"),
    (250.5, 350.4, 301, 400, "Hazardous"),
    (350.5, 500.4, 401, 500, "Hazardous"),
]

def pm25_to_aqi(pm):
    """Converts PM2.5 concentration (ug/m3) to standard EPA AQI."""
    if pd.isna(pm) or pm < 0:
        return np.nan
    for c_lo, c_hi, i_lo, i_hi, _ in EPA_BREAKPOINTS:
        if c_lo <= pm <= c_hi:
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm - c_lo) + i_lo)
    return 500

def get_aqi_category(aqi):
    """Returns EPA AQI categorical band."""
    if pd.isna(aqi):
        return "Unknown"
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"

def compute_all_metrics(y_true, y_pred):
    """
    Computes standard regression & categorical air quality metrics:
    - RMSE (Root Mean Squared Error)
    - MAE (Mean Absolute Error)
    - MAPE (Mean Absolute Percentage Error)
    - R2 Score
    - AQI Band Accuracy (Categorical agreement percentage)
    """
    mask = ~np.isnan(y_true) & ~np.isnan(y_pred)
    yt = np.array(y_true)[mask]
    yp = np.array(y_pred)[mask]

    if len(yt) == 0:
        return {}

    rmse = np.sqrt(mean_squared_error(yt, yp))
    mae = mean_absolute_error(yt, yp)
    
    # Safe MAPE avoiding divide by zero
    non_zero = yt > 0.1
    if np.any(non_zero):
        mape = np.mean(np.abs((yt[non_zero] - yp[non_zero]) / yt[non_zero])) * 100
    else:
        mape = np.nan

    r2 = r2_score(yt, yp)

    # Categorical AQI accuracy
    aqi_true = [get_aqi_category(pm25_to_aqi(v)) for v in yt]
    aqi_pred = [get_aqi_category(pm25_to_aqi(v)) for v in yp]
    cat_accuracy = np.mean([t == p for t, p in zip(aqi_true, aqi_pred)]) * 100

    return {
        "RMSE": round(float(rmse), 2),
        "MAE": round(float(mae), 2),
        "MAPE_pct": round(float(mape), 2),
        "R2": round(float(r2), 4),
        "AQI_Category_Accuracy_pct": round(float(cat_accuracy), 2),
    }
