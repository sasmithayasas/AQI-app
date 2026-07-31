# CHAPTER 5: SYSTEM IMPLEMENTATION

## 5.1 Chapter Overview
This chapter details the technical implementation of the SentinelAQ system. To authentically demonstrate the engineering lifecycle and analytical problem-solving required for this study, the implementation is presented as an iterative evolution through three distinct versions. Section 5.2 documents Version 1 (v1), which attempted cutting-edge satellite fusion but encountered catastrophic environmental constraints. Section 5.3 describes Version 2 (v2), a pivot to resolve data continuity that highlighted the limitations of spatially blind modeling. Section 5.4 details Version 3 (v3), the final, robust architecture integrating mathematical feature engineering, Explainable AI (SHAP), and reliable meteorological proxies. Finally, Section 5.5 outlines the integration of the backend pipeline with the React Native mobile application.

## 5.2 Version 1 (v1): Satellite Fusion and the Cloud Occlusion Problem
### 5.2.1 Initial Concept
The initial technical hypothesis (v1) aimed to construct a highly sophisticated multi-modal architecture. The objective was to fuse high-frequency ground telemetry (PurpleAir PM2.5) with daily chemical vectors (Tropospheric NO2) extracted from the Sentinel-5P TROPOMI satellite. The theoretical logic was sound: use NO2 as a spatial proxy to detect incoming traffic pollution before it reached the ground sensors in Colombo and Kandy.

### 5.2.2 Implementation and Failure
A data extraction script was deployed within the Google Earth Engine (GEE) cloud architecture, executing spatial reduction functions over the exact coordinates of the target cities. However, during the Python preprocessing phase, massive anomalies emerged. Sri Lanka’s tropical monsoons, combined with Kandy’s deep valley topography, resulted in persistent, dense cloud cover. Because optical satellite sensors cannot penetrate clouds, the dataset suffered from severe data loss—exceeding 40% of the total observational days. 

When standard statistical imputation techniques (such as K-Nearest Neighbors) were applied to fill these massive gaps, they introduced synthetic noise that destroyed the underlying temporal signal. Consequently, the initial XGBoost and LSTM training runs failed catastrophically, yielding excessively high Root Mean Squared Errors (RMSE) during short-term forecasting.

### 5.2.3 Critical Analysis and Pivot
The v1 failure yielded a crucial insight: while multi-modal satellite fusion is highly effective in temperate, cloud-free environments (as seen in European literature), it is fundamentally unviable for high-frequency, real-time public health alerting in tropical microclimates. A structural pivot was required to ensure system reliability.

## 5.3 Version 2 (v2): Ground-Only Sensing and Feature Scarcity
### 5.3.1 The Pivot for Data Continuity
To resolve the catastrophic data gaps of v1, the architecture was pivoted in Version 2 (v2) to rely exclusively on ground-based sensing. A Python script utilizing the `requests` library was engineered to execute HTTP GET operations against the PurpleAir REST API, fetching hourly PM2.5 averages for Colombo (ID: 29677) and Kandy (ID: 12451). This pivot successfully reduced missing data from >40% to <2%, which was easily managed via linear interpolation using the `pandas` library.

### 5.3.2 Implementation and Limitations
With a continuous dataset secured, an initial baseline XGBoost model was trained. The feature vector was intentionally simplistic, relying solely on historical PM2.5 lags (e.g., pollution levels at t-1, t-2, and t-24 hours). 

While this solved the data continuity crisis, the resulting model was functionally "spatially blind." Evaluation metrics revealed that the model could predict the immediate t+1 hour trend reasonably well due to simple autoregression (momentum). However, performance degraded exponentially at the 24-hour and 48-hour horizons. Without meteorological context (wind, temperature), the algorithm could not mathematically anticipate when a locally trapped pollution cloud in Kandy would disperse, or when transboundary smog from the ocean would strike Colombo.

### 5.3.4 Critical Analysis
The v2 iteration proved that while high-frequency data continuity is a prerequisite for machine learning, it is insufficient on its own. To achieve accuracy across extended 48-hour horizons, the architecture required contextual environmental variables that did not suffer from the occlusion problems of satellite imagery.

## 5.4 Version 3 (v3): The Final Robust Architecture
### 5.4.1 Integrating Reliable Meteorological Proxies
Version 3 (v3) represents the finalized SentinelAQ architecture. To provide the necessary spatial and environmental context without the fragility of satellite data, the Open-Meteo API was integrated. Python extraction scripts were updated to concurrently fetch hourly Wind Speed, Wind Direction, Precipitation, Temperature, and Humidity. 

### 5.4.2 Advanced Feature Engineering (The 48-Feature Vector)
A sophisticated data engineering pipeline was developed using `pandas` and `numpy`. Recognizing the failures of v2, the simple lag vector was expanded into a highly complex 48-dimensional matrix. Crucial engineered variables included:
*   **Rolling Statistical Means:** Moving averages calculated over 3h, 6h, 12h, and 24h windows. This explicitly programmed the concept of "pollution accumulation" into the tabular data, drastically improving the model's ability to predict smog events in the Kandy valley.
*   **Cyclical Time Encoding:** Machine learning algorithms inherently treat time as linear (e.g., Hour 23 is mathematically "far" from Hour 0, despite them being contiguous). To resolve this, trigonometric sine and cosine transformations were applied to the 'Hour of Day' and 'Month of Year' variables, explicitly mapping the cyclical nature of daily traffic rushes and seasonal monsoons into a format the algorithms could natively understand.

### 5.4.3 Multi-Horizon Training Pipeline
The enriched v3 dataset was partitioned via a strict chronological split (2022–2024 for training, 2025 for testing) to prevent look-ahead bias. Three distinct architectures were trained across five horizons (1h, 6h, 12h, 24h, 48h):
1.  **XGBoost:** Hyperparameter tuned using `GridSearchCV` to optimize tree depth (`max_depth=6`) and learning rate, effectively modeling the non-linear feature interactions.
2.  **LSTM Encoder-Decoder:** Constructed via `tensorflow/keras`, utilizing a 24-hour sequential lookback window with dropout layers to prevent the overfitting observed in early tests.
3.  **SARIMAX:** Implemented via the `statsmodels` library to serve as the rigorous statistical baseline.

### 5.4.4 Explainable AI (SHAP) Integration
To completely deconstruct the "black box" nature of the v3 ML models, the `shap` Python library was integrated. The `shap.TreeExplainer` was applied directly to the optimal XGBoost model. This algorithm mathematically calculates Shapley values for every single hourly forecast, isolating the precise marginal contribution of features (e.g., proving that high wind speed negatively impacted the PM2.5 prediction, while a high 24-hour rolling mean positively impacted it).

## 5.5 Mobile Application and Cloud Integration
The final phase of implementation bridged the Python machine learning backend with an intuitive user interface.
*   **Firebase Middleware:** The Python inference script was containerized and scheduled. Upon generating a multi-horizon forecast and its accompanying SHAP explanations, the backend structures a JSON payload and executes a write operation to a Google Firebase Firestore NoSQL database via the `firebase-admin` SDK.
*   **React Native Frontend:** A mobile application was developed to consume this data in real-time. Upon launch, the app fetches the latest Firestore document, rendering the current AQI via a dynamic color-coded dial (Green to Red based on US EPA standards) and plotting the 48-hour forecast on an interactive chart.
*   **Automated Alerting:** The system includes a Firebase Cloud Messaging (FCM) trigger. When the backend predicts an AQI spike that breaches a user-defined threshold within the next 48 hours, a targeted push notification is dispatched to the mobile device, fulfilling the system's mandate as a proactive public health tool.
