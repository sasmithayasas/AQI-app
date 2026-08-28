# SentinelAQ Machine Learning Pipeline

A modular, reproducible machine learning and deep learning forecasting architecture for multi-horizon Air Quality ($\text{PM}_{2.5}$ / AQI) prediction and Explainable AI (SHAP) across Colombo and Kandy, Sri Lanka.

---

## Directory Overview

```
ml/
├── data/
│   ├── raw/                   # Original telemetry, weather CSVs & Excel datasets
│   │   ├── colombo/
│   │   └── kandy/
│   ├── processed/             # Cleaned, timestamp-aligned datasets
│   │   ├── colombo_dataset.csv
│   │   └── kandy_dataset.csv
│   └── features/              # Feature vectors (lags, rolling stats, cyclical encoding)
│       ├── colombo_features.csv
│       └── kandy_features.csv
├── models/
│   ├── saved/                 # Serialized production models (.keras, .json, .pkl)
│   │   ├── colombo/
│   │   └── kandy/
│   └── scalers/               # Normalization scalers & feature mapping schemas
│       ├── colombo_scaler.pkl
│       ├── kandy_scaler.pkl
│       ├── colombo_feature_cols.json
│       └── kandy_feature_cols.json
├── src/
│   ├── data_pipeline/         # Data ingestion, synchronization & imputation
│   │   ├── data_loader.py
│   │   └── preprocessor.py
│   ├── feature_engineering/   # Time-lagged variables, rolling windows, cyclical encodings
│   │   └── build_features.py
│   ├── models/                # Model architectures (XGBoost, LSTM, LightGBM, SARIMAX)
│   │   ├── train_xgboost.py
│   │   ├── train_lstm.py
│   │   └── train_sarimax.py
│   ├── evaluation/            # Benchmarking metrics (RMSE, MAE, MAPE, R², AQI Accuracy)
│   │   ├── metrics.py
│   │   └── evaluate_models.py
│   └── explainability/        # SHAP attribution, feature importance, waterfall/beeswarm plots
│       └── shap_explainer.py
├── outputs/
│   ├── metrics/               # Evaluation tables & validation metrics
│   ├── plots/                 # Model comparison plots & error curves
│   └── shap/                  # Global and local SHAP summary visualizations
├── notebooks/                 # Exploratory data analysis & prototyping notebooks
└── requirements.txt           # Core ML dependencies
```

---

## Google Colab Execution

We have provided a comprehensive Google Colab notebook in:
`ml/notebooks/SentinelAQ_Advanced_Continuous_Forecasting_Colab.ipynb`

### Included in Colab:
- **Advanced Deep Learning**: Bidirectional LSTM with Multi-Head Self-Attention (`BiLSTM-Attention`).
- **Gradient Boosting Ensemble**: Direct multi-horizon `XGBoost` + `LightGBM` + `CatBoost` with Optuna tuning.
- **Continuous Learning & Daily Retraining**: Automated live telemetry ingestion with warm-start fine-tuning (`xgb_model` / low-rate neural fine-tuning).
- **Multi-Horizon Evaluation**: RMSE, MAE, R², and AQI Categorical Accuracy across $h \in \{1, 6, 12, 24, 48\}\text{ hours}$.
- **Explainable AI (SHAP)**: Global beeswarm, feature importance bars, and local spike waterfall plots.

---

## Quickstart

1. **Install ML Dependencies**:
   ```bash
   pip install -r ml/requirements.txt
   ```

2. **Feature Engineering**:
   ```bash
   python ml/src/feature_engineering/build_features.py --city kandy
   python ml/src/feature_engineering/build_features.py --city colombo
   ```

3. **Daily Continuous Update / Retraining**:
   ```bash
   python -m ml.src.models.continuous_trainer --city colombo
   python -m ml.src.models.continuous_trainer --city kandy
   ```

