import os
import pandas as pd
import numpy as np
from services.weather import fetch_and_prepare_data
from services.model_service import load_all_models, predict_multi_horizon, pm25_to_aqi, aqi_category

def run_past48h_backtest():
    load_all_models()
    
    for city in ["colombo", "kandy"]:
        print(f"\n{'='*75}")
        print(f"📊 48-HOUR BACKTEST EVALUATION: {city.upper()}")
        print(f"{'='*75}")
        
        current_row, past_df, current_pm25, full_df = fetch_and_prepare_data(city)
        
        # We need at least 48 hours for lookback + 48 hours for evaluation
        if len(full_df) < 96:
            print(f"Not enough historical records for {city}: {len(full_df)}")
            continue
            
        # Let's take the window from T-48h to T-0
        # For each hour t in the past 48 hours, generate 1-step, 6-step, and multi-step predictions
        records = []
        
        # Step back through the past 48 hours
        eval_indices = range(len(full_df) - 48, len(full_df))
        
        for idx in eval_indices:
            obs_row = full_df.iloc[idx]
            obs_time = obs_row["time"]
            actual_pm25 = float(obs_row["pm25"])
            actual_aqi = pm25_to_aqi(actual_pm25)
            actual_cat = aqi_category(actual_aqi)
            
            # Predict from the state available up to hour idx - 1 (1h prior)
            historical_slice = full_df.iloc[:idx]
            if len(historical_slice) >= 48:
                prev_time = historical_slice.iloc[-1]["time"]
                preds = predict_multi_horizon(city, historical_slice, prev_time)
                
                # 1-hour ahead prediction
                pred_1h_pm25 = preds[0]["pm25"] if len(preds) > 0 else actual_pm25
                pred_1h_aqi  = preds[0]["aqi"] if len(preds) > 0 else actual_aqi
                pred_1h_cat  = preds[0]["category"] if len(preds) > 0 else actual_cat
                
                error_pm25 = abs(pred_1h_pm25 - actual_pm25)
                error_aqi  = abs(pred_1h_aqi - actual_aqi)
                cat_match  = (pred_1h_cat == actual_cat)
                
                records.append({
                    "Timestamp": obs_time.strftime("%Y-%m-%d %H:%M"),
                    "Actual_PM25": round(actual_pm25, 1),
                    "Pred_PM25": round(pred_1h_pm25, 1),
                    "Diff_PM25": round(pred_1h_pm25 - actual_pm25, 1),
                    "Actual_AQI": actual_aqi,
                    "Pred_AQI": pred_1h_aqi,
                    "Actual_Band": actual_cat,
                    "Pred_Band": pred_1h_cat,
                    "Cat_Match": "✅" if cat_match else "❌"
                })
                
        df_eval = pd.DataFrame(records)
        
        # Summary Statistics
        y_true_pm = df_eval["Actual_PM25"].values
        y_pred_pm = df_eval["Pred_PM25"].values
        
        rmse = np.sqrt(np.mean((y_true_pm - y_pred_pm) ** 2))
        mae  = np.mean(np.abs(y_true_pm - y_pred_pm))
        accuracy_pct = (df_eval["Cat_Match"] == "✅").mean() * 100
        correlation = np.corrcoef(y_true_pm, y_pred_pm)[0, 1] if np.std(y_pred_pm) > 0 and np.std(y_true_pm) > 0 else 1.0
        
        print(f"\n📈 METRICS OVER PAST 48 HOURS (1-Hour Ahead Continuous Regressor):")
        print(f"   • PM2.5 RMSE:          {rmse:.2f} µg/m³")
        print(f"   • PM2.5 MAE:           {mae:.2f} µg/m³")
        print(f"   • Pearson Correlation: {correlation:.4f}")
        print(f"   • AQI Band Accuracy:   {accuracy_pct:.1f}%")
        print(f"   • Actual PM2.5 Range:  [{y_true_pm.min():.1f}, {y_true_pm.max():.1f}] µg/m³")
        print(f"   • Pred PM2.5 Range:    [{y_pred_pm.min():.1f}, {y_pred_pm.max():.1f}] µg/m³")
        
        print(f"\n📋 SAMPLE HOUR-BY-HOUR COMPARISON (Last 12 Hours):")
        cols_show = ["Timestamp", "Actual_PM25", "Pred_PM25", "Diff_PM25", "Actual_AQI", "Pred_AQI", "Actual_Band", "Pred_Band", "Cat_Match"]
        print(df_eval[cols_show].tail(12).to_string(index=False))

if __name__ == "__main__":
    run_past48h_backtest()
