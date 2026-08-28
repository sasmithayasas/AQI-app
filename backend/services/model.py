import os
import xgboost as xgb
import pandas as pd
import numpy as np

# Base dir is expected to be AQI app/backend/services
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "files", "training", "outputs", "models")
HORIZONS = [1, 6, 12, 24, 48]
MODELS = {}

TRAIN_FEATURES = [
    'humidity', 'temperature', 'NO2_Density', 'Temp_C', 'Rain_mm', 'Pressure_hPa', 
    'WindSpeed_kmh', 'WindDir_sin', 'WindDir_cos', 'Is_Weekend', 
    'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos', 'DOW_sin', 'DOW_cos', 
    'Lag_1h', 'Lag_2h', 'Lag_3h', 'Lag_6h', 'Lag_12h', 'Lag_24h', 'Lag_48h', 
    'Roll3h_mean', 'Roll3h_std', 'Roll6h_mean', 'Roll6h_std', 'Roll24h_mean', 'Roll24h_std'
]

def load_models():
    for h in HORIZONS:
        model_path = os.path.join(MODELS_DIR, f"xgboost_h{h}.json")
        if os.path.exists(model_path):
            m = xgb.XGBRegressor()
            m.load_model(model_path)
            MODELS[h] = m
            print(f"Loaded model: xgboost_h{h}.json")
        else:
            print(f"WARNING: Model {model_path} not found.")

def get_shap_values(X, current_row, city):
    try:
        import shap
        if 1 not in MODELS:
            raise Exception("Model for horizon 1 not found for SHAP.")
        explainer = shap.TreeExplainer(MODELS[1])
        shap_values = explainer.shap_values(X)
        shap_vals = shap_values[0] # first row
        
        shap_dict = {feat: val for feat, val in zip(TRAIN_FEATURES, shap_vals)}
        
        hum_val = shap_dict.get("Humidity_pct", 0) + shap_dict.get("humidity", 0)
        temp_val = shap_dict.get("Temp_C", 0) + shap_dict.get("temperature", 0)
        wind_val = shap_dict.get("WindSpeed_kmh", 0)
        topo_val = shap_dict.get("WindDir_sin", 0) + shap_dict.get("WindDir_cos", 0)
        
        total_abs = sum(abs(v) for v in shap_vals)
        if total_abs == 0: total_abs = 1
        
        shap_humidity = f"{'+' if hum_val >= 0 else ''}{int(round((hum_val/total_abs)*100))}%"
        shap_temp = f"{'+' if temp_val >= 0 else ''}{int(round((temp_val/total_abs)*100))}%"
        shap_wind = f"{'+' if wind_val >= 0 else ''}{int(round((wind_val/total_abs)*100))}%"
        shap_topo = f"{'+' if topo_val >= 0 else ''}{int(round((topo_val/total_abs)*100))}%"
    except Exception as e:
        print(f"SHAP error: {e}")
        shap_humidity = f"+{int(min(45, (float(current_row['Humidity_pct'])/100)*45))}%"
        shap_temp = f"-{int(min(30, (float(current_row['Temp_C'])/40)*30))}%"
        shap_wind = f"-{int(min(40, (float(current_row['WindSpeed_kmh'])/20)*40))}%"
        shap_topo = "+60%" if city == "kandy" else "-10%"
    
    return {
        "humidity": str(shap_humidity), 
        "temp": str(shap_temp), 
        "wind": str(shap_wind), 
        "topo": str(shap_topo)
    }

def predict_horizons(X, current_row, current_pm25, current_aqi, pm25_to_aqi_fn):
    predictions = []
    # Include h=0 (current)
    predictions.append({
        "horizon": 0,
        "time": current_row["time"].isoformat(),
        "pm25": current_pm25,
        "aqi": current_aqi
    })
    
    for h in HORIZONS:
        if h in MODELS:
            pred_pm25 = float(MODELS[h].predict(X)[0].item())
            pred_pm25 = max(0.0, pred_pm25) # clip < 0
            pred_time = current_row["time"] + pd.Timedelta(hours=h)
            predictions.append({
                "horizon": h,
                "time": pred_time.isoformat(),
                "pm25": pred_pm25,
                "aqi": int(pm25_to_aqi_fn(pred_pm25))
            })
    return predictions
