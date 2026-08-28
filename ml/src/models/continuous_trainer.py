"""
Continuous Training & Incremental Retraining Engine for SentinelAQ
Ingests live sensor + weather telemetry and incrementally updates existing model weights.
"""
import os
import json
import joblib
import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timezone
import xgboost as xgb
import lightgbm as lgb
import catboost as cb
import openmeteo_requests
import requests_cache
from retry_requests import retry

from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from ..feature_engineering.build_features import build_features
from ..evaluation.metrics import compute_all_metrics

CITY_COORDS = {
    "colombo": {"lat": 6.9271, "lon": 79.8612},
    "kandy":   {"lat": 7.2906, "lon": 80.6337}
}

class SentinelAQContinuousTrainer:
    def __init__(self, city="colombo", base_dir="ml"):
        self.city = city.lower()
        self.base_dir = base_dir
        self.models_dir = os.path.join(base_dir, "models", "saved", self.city)
        self.scalers_dir = os.path.join(base_dir, "models", "scalers")
        
        # Load feature column definitions
        feat_path = os.path.join(self.scalers_dir, f"{self.city}_feature_cols.json")
        if os.path.exists(feat_path):
            with open(feat_path, "r") as f:
                self.feature_cols = json.load(f)
        else:
            self.feature_cols = []

    def fetch_live_stream(self, past_days=7):
        """Fetches recent observations from Open-Meteo Air Quality & Weather API."""
        cache_session = requests_cache.CachedSession('.cache', expire_after=1800)
        retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
        om = openmeteo_requests.Client(session=retry_session)

        coords = CITY_COORDS[self.city]
        
        # Air quality
        aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        aq_params = {
            "latitude": coords["lat"], "longitude": coords["lon"],
            "hourly": ["pm2_5", "nitrogen_dioxide"],
            "past_days": past_days
        }
        aq_resp = om.weather_api(aq_url, params=aq_params)[0].Hourly()
        
        # Weather
        wx_url = "https://api.open-meteo.com/v1/forecast"
        wx_params = {
            "latitude": coords["lat"], "longitude": coords["lon"],
            "hourly": ["temperature_2m", "relative_humidity_2m", "rain", "wind_speed_10m", "wind_direction_10m"],
            "past_days": past_days
        }
        wx_resp = om.weather_api(wx_url, params=wx_params)[0].Hourly()
        
        times = pd.date_range(
            start=pd.to_datetime(aq_resp.Time(), unit="s", utc=True),
            end=pd.to_datetime(aq_resp.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=aq_resp.Interval()),
            inclusive="left"
        )
        
        df = pd.DataFrame({
            "datetime": times,
            "pm2.5_corrected": aq_resp.Variables(0).ValuesAsNumpy(),
            "no2_density": aq_resp.Variables(1).ValuesAsNumpy(),
            "temperature_c": wx_resp.Variables(0).ValuesAsNumpy(),
            "humidity_percent": wx_resp.Variables(1).ValuesAsNumpy(),
            "precipitation_mm": wx_resp.Variables(2).ValuesAsNumpy(),
            "wind_speed_kmh": wx_resp.Variables(3).ValuesAsNumpy(),
            "wind_direction_deg": wx_resp.Variables(4).ValuesAsNumpy(),
        })
        return df

    def incremental_train_daily(self, new_df, epochs=5, lr=1e-4):
        """Fine-tunes existing neural models and boosts extra trees with new telemetry."""
        feat_df = build_features(new_df, target_col="pm2.5_corrected", time_col="datetime")
        print(f"[{self.city.upper()}] Processed {len(feat_df)} new time steps for incremental training.")
        
        # Incremental XGBoost warm-start
        for h in [1, 6, 12, 24, 48]:
            model_path = os.path.join(self.models_dir, f"xgboost_h{h}.json")
            if os.path.exists(model_path):
                xgb_model = xgb.XGBRegressor()
                xgb_model.load_model(model_path)
                
                y_h = feat_df["pm2.5_corrected"].shift(-h).dropna()
                cols = [c for c in self.feature_cols if c in feat_df.columns]
                X_h = feat_df[cols].iloc[:len(y_h)]
                
                if len(X_h) > 0:
                    new_xgb = xgb.XGBRegressor(n_estimators=10, learning_rate=0.01, max_depth=6)
                    new_xgb.fit(X_h, y_h, xgb_model=xgb_model.get_booster())
                    new_xgb.save_model(model_path)
                    print(f"Updated XGBoost Horizon h={h} model saved.")

        return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", type=str, default="colombo", choices=["colombo", "kandy"])
    args = parser.parse_args()

    trainer = SentinelAQContinuousTrainer(city=args.city)
    try:
        live_df = trainer.fetch_live_stream(past_days=3)
        trainer.incremental_train_daily(live_df)
        print(f"✅ Daily continuous update completed for {args.city}.")
    except Exception as e:
        print(f"Error during continuous update: {e}")
