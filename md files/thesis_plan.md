# SentinelAQ — Thesis Writing Plan

## Important Context: Proposal vs. Reality

> [!IMPORTANT]
> Your **proposal** described a Hybrid LSTM-Dense + Satellite (NO₂) fusion architecture. Your **actual implementation** used XGBoost + SARIMAX + LSTM with PurpleAir + Open-Meteo weather data (no satellite fusion). The thesis must reconcile this clearly — frame it as a **pivot decision justified by data quality constraints** (Sentinel-5P cloud occlusion in Kandy, daily-vs-hourly alignment problem). This is academically valid and honest. Do NOT pretend you did satellite fusion if you didn't.

---

## Real Results Summary (from your CSVs)

### Colombo — Model Comparison

| Model | Horizon | RMSE | MAE | R² | AQI Acc % |
|-------|---------|------|-----|----|-----------|
| **XGBoost** | 1h | **7.27** | 4.40 | **0.807** | **78.4%** |
| SARIMAX | 1h | 2.89 | 2.43 | 0.935 | 91.7% |
| LSTM | 1h | 10.09 | 7.42 | 0.615 | 57.1% |
| **XGBoost** | 6h | **9.59** | 6.42 | **0.664** | **67.3%** |
| SARIMAX | 6h | 7.85 | 6.20 | 0.551 | 66.7% |
| LSTM | 6h | 10.24 | 7.11 | 0.610 | 63.2% |
| **XGBoost** | 24h | **11.03** | 7.49 | **0.557** | **62.9%** |
| SARIMAX | 24h | 14.06 | 11.37 | -0.237 | 45.0% |
| **XGBoost** | 48h | **12.67** | 8.54 | **0.417** | **60.0%** |
| SARIMAX | 48h | 17.03 | 13.38 | -0.816 | 48.3% |

### Kandy — Model Comparison

| Model | Horizon | RMSE | MAE | R² | AQI Acc % |
|-------|---------|------|-----|----|-----------|
| **XGBoost** | 1h | **10.25** | 5.93 | **0.680** | **75.6%** |
| SARIMAX | 1h | 8.05 | 4.67 | 0.825 | 81.7% |
| LSTM | 1h | 14.07 | 9.62 | 0.402 | 56.7% |
| **XGBoost** | 6h | **13.35** | 8.84 | **0.457** | **63.3%** |
| **XGBoost** | 24h | **15.54** | 10.69 | **0.267** | **57.6%** |
| **XGBoost** | 48h | **17.39** | 12.31 | **0.086** | **52.2%** |

**Key finding**: SARIMAX wins at 1h (short-term pattern memory), XGBoost wins at 6h–48h (feature-rich forecasting beyond 1 step). LSTM underperforms in both cities.

### SHAP Top Features (Colombo)
| Horizon | #1 Feature | #2 Feature | #3 Feature |
|---------|-----------|-----------|-----------|
| 1h | PM2.5 (t-1h) | 24h Rolling Mean | Hour of Day (sin) |
| 6h | 24h Rolling Mean | 6h Rolling Mean | PM2.5 (t-1h) |
| 12h | 24h Rolling Mean | PM2.5 (t-12h) | Month (cos) |
| 24h | 24h Rolling Mean | PM2.5 (t-1h) | Month (cos) |
| 48h | Month (cos) | Month (sin) | 24h Rolling Mean |

### SHAP Top Features (Kandy)
| Horizon | #1 Feature | #2 Feature | #3 Feature |
|---------|-----------|-----------|-----------|
| 1h | PM2.5 (t-1h) | Hour of Day (cos) | 24h Rolling Mean |
| 6h | 24h Rolling Mean | 6h Rolling Mean | Sensor Temperature |
| 12h | PM2.5 (t-12h) | PM2.5 (t-1h) | 24h Rolling Mean |
| 24h | PM2.5 (t-1h) | 3h Rolling Mean | Month (sin) |
| 48h | 3h Rolling Mean | Month (sin) | PM2.5 (t-2h) |

---

## Chapter Structure & Writing Order

Write in this priority order (highest marks first):

### Priority 1 — Chapter 6: Results & Evaluation (20% of report = 12% of total grade)
### Priority 2 — Chapter 5: Implementation (15% of report = 9% of total grade)
### Priority 3 — Chapter 2: Literature Review (15% of report = 9% of total grade)
### Priority 4 — Chapter 1: Introduction (10%)
### Priority 5 — Chapter 3: Methodology (10%)
### Priority 6 — Chapter 7: Conclusion (10%)
### Priority 7 — Formatting & References (10%)

---

## Chapter Outlines

### Chapter 1 — Introduction
1.1 Background and Motivation  
1.2 Problem Statement  
1.3 Research Gap  
1.4 Research Aim  
1.5 Research Questions  
1.6 Research Objectives  
1.7 Scope and Limitations  
1.8 Contributions  
1.9 Thesis Structure  

**Key points to make:**
- Sri Lanka lacks real-time hyperlocal AQI forecasting (cite WHO 2021, DoH Sri Lanka)
- Only 2 PurpleAir sensors operational in Colombo and Kandy
- Gap: no multi-horizon forecasting system with explainability for Sri Lanka
- Pivot from satellite fusion: justify as scope decision due to Sentinel-5P data quality issues

---

### Chapter 2 — Literature Review
2.1 Chapter Overview  
2.2 Air Quality Monitoring in South/Southeast Asia  
2.3 PM2.5 Forecasting Methods  
  2.3.1 Statistical Models (ARIMA/SARIMAX)  
  2.3.2 Machine Learning (XGBoost, Random Forest)  
  2.3.3 Deep Learning (LSTM, Transformer)  
2.4 Explainable AI in Environmental Modelling (SHAP)  
2.5 Air Quality in Sri Lanka — Existing Work  
2.6 Mobile Applications for AQI  
2.7 Summary and Research Positioning  

**Must include:**
- Related work comparison TABLE (Author | Year | Method | Location | RMSE | Gap)
- Cite: Kurukulasuriya et al. (2025), Fernando et al. (2022), Dhammapala et al. (2022)
- End with clear gap statement: "No existing study applies multi-horizon XGBoost with SHAP explainability for AQI forecasting in Sri Lanka"

---

### Chapter 3 — Methodology
3.1 Research Design  
3.2 Data Collection  
  3.2.1 PurpleAir Ground Sensors  
  3.2.2 Open-Meteo Weather API  
3.3 Data Preprocessing  
  3.3.1 Cleaning and Outlier Removal  
  3.3.2 Feature Engineering (48-feature vector)  
3.4 Model Development  
  3.4.1 SARIMAX Baseline  
  3.4.2 XGBoost Multi-Horizon  
  3.4.3 LSTM Encoder-Decoder  
3.5 Evaluation Framework  
  3.5.1 Metrics: RMSE, MAE, R², AQI Category Accuracy  
  3.5.2 Train/Test Split  
3.6 SHAP Explainability Framework  
3.7 System Architecture  

---

### Chapter 4 — System Design (optional — check if required)
- Architecture diagrams (use your existing UML diagrams)
- Firebase schema / ER diagram
- React Native app design

---

### Chapter 5 — Implementation
5.1 Development Environment  
5.2 Data Ingestion Pipeline  
5.3 Feature Engineering Implementation  
5.4 Model Training — XGBoost  
5.5 Model Training — SARIMAX  
5.6 Model Training — LSTM  
5.7 SHAP Implementation  
5.8 Firebase Integration  
5.9 Mobile Application  

---

### Chapter 6 — Results and Evaluation ⚡ Most important
6.1 Dataset Overview  
6.2 Model Performance — Colombo  
  6.2.1 XGBoost Results  
  6.2.2 SARIMAX Results  
  6.2.3 LSTM Results  
  6.2.4 Comparative Analysis  
6.3 Model Performance — Kandy  
  6.3.1 XGBoost Results  
  6.3.2 SARIMAX Results  
  6.3.3 LSTM Results  
  6.3.4 Comparative Analysis  
6.4 Cross-City Comparison (Colombo vs. Kandy)  
6.5 SHAP Explainability Analysis  
  6.5.1 Colombo Feature Attribution  
  6.5.2 Kandy Feature Attribution  
  6.5.3 Topographical Interpretation  
6.6 AQI Category Classification  
6.7 Discussion — Why XGBoost Outperformed  

---

### Chapter 7 — Conclusion
7.1 Summary of Achievements  
7.2 Research Questions — Answered  
7.3 Limitations  
7.4 Future Work  

---

## Writing Instructions for Each Chapter

Tell me which chapter to write first and I will produce the full academic text for it, incorporating:
- Your real metric numbers from the CSVs
- Citations from your proposal/midpoint bibliography
- Proper academic register
- Formatted for a Word/LaTeX thesis (IEEE or Harvard style)

**Suggested starting point**: Start with **Chapter 1** (shortest, sets the frame) then **Chapter 6** (highest marks).
