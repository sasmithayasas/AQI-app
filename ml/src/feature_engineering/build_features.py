"""
Feature Engineering Pipeline
Generates lag variables, rolling statistics, cyclical time encodings, and wind vector components.
"""
import os
import argparse
import pandas as pd
import numpy as np

def build_features(df, target_col="PM2.5_ATM_ug/m3", time_col="DateTime_UTC"):
    """
    Transforms raw cleaned time-series data into a high-dimensional feature set.
    """
    df = df.copy()
    if time_col in df.columns:
        df[time_col] = pd.to_datetime(df[time_col])
        df = df.sort_values(time_col).reset_index(drop=True)
    
    # 1. Cyclical Time Encodings
    if time_col in df.columns:
        hour = df[time_col].dt.hour
        month = df[time_col].dt.month
        dow = df[time_col].dt.dayofweek

        df["Hour_sin"] = np.sin(2 * np.pi * hour / 24)
        df["Hour_cos"] = np.cos(2 * np.pi * hour / 24)
        df["Month_sin"] = np.sin(2 * np.pi * month / 12)
        df["Month_cos"] = np.cos(2 * np.pi * month / 12)
        df["DOW_sin"] = np.sin(2 * np.pi * dow / 7)
        df["DOW_cos"] = np.cos(2 * np.pi * dow / 7)
        df["Is_Weekend"] = (dow >= 5).astype(int)

    # 2. Wind Direction Trigonometric Transformation
    if "WindDir_deg" in df.columns:
        df["WindDir_sin"] = np.sin(np.radians(df["WindDir_deg"]))
        df["WindDir_cos"] = np.cos(np.radians(df["WindDir_deg"]))
        df = df.drop(columns=["WindDir_deg"])

    # 3. Lags
    if target_col in df.columns:
        for lag in [1, 2, 3, 6, 12, 24, 48]:
            df[f"Lag_{lag}h"] = df[target_col].shift(lag)

        # 4. Rolling Statistics
        for window in [3, 6, 24]:
            # Shift by 1 to prevent data leakage (use only past values)
            df[f"Roll{window}h_mean"] = df[target_col].shift(1).rolling(window, min_periods=1).mean()
            df[f"Roll{window}h_std"] = df[target_col].shift(1).rolling(window, min_periods=1).std().fillna(0)

    # Drop leading NaN rows caused by longest lag (48h)
    df = df.dropna().reset_index(drop=True)
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", type=str, default="kandy", choices=["kandy", "colombo"])
    args = parser.parse_args()

    input_path = f"ml/data/processed/{args.city}_dataset.csv"
    output_path = f"ml/data/features/{args.city}_features.csv"

    if os.path.exists(input_path):
        print(f"Loading {input_path}...")
        raw_df = pd.read_csv(input_path)
        feat_df = build_features(raw_df)
        os.makedirs("ml/data/features", exist_ok=True)
        feat_df.to_csv(output_path, index=False)
        print(f"Successfully generated {feat_df.shape[1]} features ({len(feat_df)} rows) -> {output_path}")
    else:
        print(f"Input file not found: {input_path}")
