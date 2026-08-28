import os
import pandas as pd
import numpy as np
from services.weather import fetch_and_prepare_data
from services.model_service import load_all_models, predict_multi_horizon, pm25_to_aqi, aqi_category

def run_full_day_comparison():
    load_all_models()
    
    for city in ["colombo", "kandy"]:
        print(f"\n{'='*80}")
        print(f"📅 FULL 24-HOUR CONTINUOUS HOUR-BY-HOUR COMPARISON: {city.upper()}")
        print(f"{'='*80}")
        
        current_row, past_df, current_pm25, full_df = fetch_and_prepare_data(city)
        
        # Take the full 24-hour cycle (last 24 hours up to the most recent observation)
        eval_indices = range(len(full_df) - 24, len(full_df))
        records = []
        
        for idx in eval_indices:
            obs_row = full_df.iloc[idx]
            obs_time = obs_row["time"]
            actual_pm25 = float(obs_row["pm25"])
            actual_aqi = pm25_to_aqi(actual_pm25)
            actual_cat = aqi_category(actual_aqi)
            
            historical_slice = full_df.iloc[:idx]
            prev_time = historical_slice.iloc[-1]["time"]
            preds = predict_multi_horizon(city, historical_slice, prev_time)
            
            pred_pm25 = preds[0]["pm25"] if preds else actual_pm25
            pred_aqi = preds[0]["aqi"] if preds else actual_aqi
            pred_cat = preds[0]["category"] if preds else actual_cat
            
            diff = pred_pm25 - actual_pm25
            
            records.append({
                "Hour": obs_time.strftime("%H:%M"),
                "Date": obs_time.strftime("%Y-%m-%d"),
                "Actual_PM25": round(actual_pm25, 1),
                "Pred_PM25": round(pred_pm25, 1),
                "Diff": f"{diff:+.1f}",
                "Actual_AQI": actual_aqi,
                "Pred_AQI": pred_aqi,
                "Actual_Band": actual_cat,
                "Pred_Band": pred_cat,
                "Match": "✅" if actual_cat == pred_cat else "❌"
            })
            
        df_24h = pd.DataFrame(records)
        print(df_24h.to_string(index=False))
        
        y_true = df_24h["Actual_PM25"].values
        y_pred = df_24h["Pred_PM25"].values
        rmse = np.sqrt(np.mean((y_true - y_pred)**2))
        mae = np.mean(np.abs(y_true - y_pred))
        corr = np.corrcoef(y_true, y_pred)[0, 1] if np.std(y_pred) > 0 else 1.0
        acc = (df_24h["Match"] == "✅").mean() * 100
        
        print(f"\n📊 24-Hour Summary Metrics ({city.capitalize()}):")
        print(f"   • 24-Hour Average Error (MAE):  {mae:.2f} µg/m³")
        print(f"   • 24-Hour Root Mean Sq (RMSE):  {rmse:.2f} µg/m³")
        print(f"   • Diurnal Pearson Correlation:  {corr:.4f}")
        print(f"   • AQI Band Match Rate:          {acc:.1f}%")

if __name__ == "__main__":
    run_full_day_comparison()
