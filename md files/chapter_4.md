# CHAPTER 4: SYSTEM DESIGN AND REQUIREMENTS

## 4.1 Chapter Overview
This chapter transitions from the methodological framework to the explicit technical requirements and architectural design of the SentinelAQ system. In accordance with the professor's feedback to explicitly define the primary research inputs, Section 4.2 details the datasets and data libraries utilized. Section 4.3 outlines the Functional Requirements (FR) necessary for the system to achieve its predictive and alerting goals. Section 4.4 defines the Non-Functional Requirements (NFR) ensuring performance, scalability, and usability. Finally, Section 4.5 presents a high-level overview of the decoupled system architecture.

## 4.2 Primary Research Components: Datasets and Libraries
As established in the methodology, this study relies on empirical primary research rather than qualitative interviews. The foundation of the system is built upon two programmatic data streams and a specialized stack of Python libraries.

### 4.2.1 Datasets
To construct a robust multi-modal dataset spanning from January 2022 to December 2025, two distinct Application Programming Interfaces (APIs) were integrated:
*   **PurpleAir REST API:** Provided the primary dependent variable (ground truth PM2.5) as well as localized ambient temperature and humidity. Data was extracted from two strategically chosen nodes: Colombo (Coastal, ID: 29677) and Kandy (Valley, ID: 12451).
*   **Open-Meteo API:** Served as the critical meteorological proxy. To mitigate the severe cloud occlusion risks associated with satellite data (detailed in Section 1.6), Open-Meteo provided highly reliable, hourly wind speed, wind direction, and precipitation data, forming the backbone of the spatial analysis.

### 4.2.2 Data Libraries
The backend infrastructure and predictive modeling were developed using a specialized Python 3.11+ stack:
*   **Data Engineering:** `pandas` and `numpy` were utilized for complex matrix manipulations, handling missing values, and executing cyclical trigonometric time encodings (sine/cosine transformations for hours and months).
*   **Machine Learning:** `xgboost` (for tree-based ensemble modeling), `tensorflow` and `keras` (for building the deep learning LSTM architecture), and `statsmodels` (for the SARIMAX statistical baseline).
*   **Explainable AI:** The `shap` library was integrated specifically to compute Shapley values, mathematically isolating the exact contribution of features like wind speed or historical lag on individual predictions.
*   **Cloud Integration:** `firebase-admin` facilitated secure backend communication with Google Cloud, handling both Firestore database writes and Cloud Messaging (FCM) notifications.

## 4.3 Functional Requirements (FR)
Functional requirements define the specific, testable behaviors the SentinelAQ system must execute to deliver end-to-end value.
*   **FR1 (Automated Data Ingestion):** The backend Python pipeline shall automatically fetch the latest hourly PM2.5 and meteorological readings from the PurpleAir and Open-Meteo APIs without manual intervention.
*   **FR2 (Dynamic Feature Engineering):** The system shall dynamically construct the 48-dimensional feature vector in real-time, calculating 3-hour, 6-hour, and 24-hour rolling statistical means from the newly ingested data.
*   **FR3 (Multi-Horizon Inference):** The system shall execute the pre-trained XGBoost model to generate distinct PM2.5 concentration forecasts for 1, 6, 12, 24, and 48-hour future horizons.
*   **FR4 (Real-Time Explainability):** The system shall compute SHAP `TreeExplainer` values for every forecast, explicitly isolating the top three atmospheric drivers (e.g., "Driven by: 24h Accumulation & Low Wind Speed").
*   **FR5 (Database Synchronization):** The backend shall structure the predictions and SHAP interpretations into JSON payloads and execute synchronous write operations to the Firebase Firestore cloud database.
*   **FR6 (Mobile Visualization):** The React Native frontend shall fetch the latest Firestore document and render the current AQI via a dynamic color-coded dial, alongside a responsive 48-hour trend chart.
*   **FR7 (Threshold Alerting):** The system shall allow users to configure personalized AQI thresholds (e.g., "Alert me if PM2.5 > 50"). The backend shall trigger Firebase Cloud Messaging (FCM) push notifications when forecasted levels breach these user-defined thresholds.

## 4.4 Non-Functional Requirements (NFR)
Non-functional requirements specify the critical quality attributes and constraints under which the system must operate.
*   **NFR1 (Implementation Speed & Performance):** The automated backend inference pipeline must complete the entire cycle—data extraction, vector engineering, SHAP calculation, and database synchronization—in under 60 seconds to ensure the mobile client receives truly real-time updates.
*   **NFR2 (High Availability):** Leveraging Google Firebase's serverless infrastructure, the system database and messaging services must maintain 99.9% uptime, ensuring users have uninterrupted access to health advisories during severe pollution events.
*   **NFR3 (Architectural Scalability):** The Firestore NoSQL database must be structurally optimized (document-collection architecture) to easily accommodate the addition of new geographical nodes (e.g., expanding to Jaffna or Galle) without requiring a complete schema redesign or causing data retrieval bottlenecks.
*   **NFR4 (Usability & Cognitive Load):** The mobile application must instantly translate complex microgram (µg/m³) predictions into intuitive, universally understood visual indicators (US EPA AQI standard colors: Green, Yellow, Orange, Red) to minimize cognitive load for non-technical users.

## 4.5 System Architecture Overview
To satisfy the aforementioned requirements, SentinelAQ was designed utilizing a decoupled, four-lane enterprise architecture:
1.  **User Lane:** Represents the physical actor configuring alert thresholds and consuming visualizations.
2.  **Mobile Client (Frontend):** A React Native application responsible for handling local UI states, rendering the AQI dial, and displaying push notifications.
3.  **API Backend (Middleware):** The Python-driven core where the XGBoost inference and SHAP explainability matrices are processed.
4.  **External Providers (Cloud/Data):** The integration layer bridging third-party sensor networks (PurpleAir), weather APIs (Open-Meteo), and cloud hosting (Firebase).

This decoupled design ensures that the heavy computational load of machine learning inference is entirely abstracted away from the user's mobile device, allowing the app to remain lightweight and highly responsive. The following chapter (Chapter 5) details the iterative journey of developing this architecture, documenting the failures and successes encountered across three distinct versions (v1 to v3).
