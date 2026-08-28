# 🌿 SentinelAQ — Intelligent Environmental Intelligence & Air Quality Forecasting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react)](https://react.dev)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18+-FF6F00.svg?logo=tensorflow)](https://tensorflow.org)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.0+-119EFF.svg?logo=capacitor)](https://capacitorjs.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash-4285F4.svg?logo=google)](https://ai.google.dev/)

> **SentinelAQ** is an end-to-end environmental intelligence and predictive air quality mobile platform engineered for Sri Lanka's contrasting microclimatic regimes (**Colombo Coastal Metropolis** vs. **Kandy Highland Valley Basin**). 

---

## 📌 Architecture Overview

SentinelAQ bridges physical atmospheric telemetry and citizen health action by fusing:
1. **IoT Sensor & Meteorological Stream Ingestion**: Live $\text{PM}_{2.5}$, $\text{NO}_2$, $\text{O}_3$, $\text{CO}$, temperature, relative humidity, wind velocity, and wind direction via Open-Meteo and physical ground telemetry.
2. **Deep Learning Sequence Modeling**: Multi-horizon **Bidirectional LSTM with Self-Attention (BiLSTM-Attention)** forecasting next 24 hours of AQI variations with high physical confidence.
3. **Explainable AI (TreeSHAP)**: Real-time feature attribution decomposing pollution drivers into physical atmospheric factors (Oceanic Sea Breeze Dispersal vs. Nocturnal Basin Trapping & High Humidity).
4. **Conversational AI (SentinelAI)**: Grounded RAG assistant powered by **Google Gemini 3.6 Flash** providing localized health guidance and world environmental science explanations.
5. **Cross-Platform Mobile Application**: Built with **React 18 + Tailwind CSS + Capacitor Android**, featuring interactive timeline scrubbing, native pull-to-refresh gestures, trilingual localization (**English, Sinhala, Tamil**), and offline resilience.

---

## ✨ Core Features

- **Dynamic Glassmorphic Dashboard**: Real-time AQI ring with threshold-driven accents, live rotating wind compass, and chemical breakdown cards.
- **Optimal Outdoor Activity Planner ("Best Time to Go Outside")**: Computes the dynamic 24-hour cleanest window and peak pollution hour for outdoor workouts and commuting.
- **50+ AQI Inter-District Travel Health Advisory**: Automatically triggers proactive alerts when transit corridor AQI exceeds safe thresholds, protecting asthmatics, children, and sensitive individuals.
- **Interactive 24-Hour Forecast Timeline**: Scrub along the future curve with crosshair tooltips and 90% confidence uncertainty corridor bands.
- **Explainable AI (TreeSHAP) Factor Breakdown**: Enlarged visual attribution bars showing whether humidity, wind velocity, temperature, or terrain elevation are trapping or clearing smog.
- **SentinelAI Floating Assistant**: Elevated squircle AI assistant supporting comparative queries between Colombo and Kandy, outdoor fitness planning, and health precautions.
- **Joint Regional Comparative 48h PDF Report**: Generates downloadable vector PDF reports containing full 48h telemetry logs, multi-horizon forecasts, and a Western vs. Central province comparative microclimate matrix.
- **Trilingual Accessibility**: Full parity across English, Sinhala (සිංහල), and Tamil (தமிழ்).

---

## 🛠️ Project Structure

```text
├── aqi-mock-app/             # Mobile Frontend (React + Vite + Tailwind + Capacitor)
│   ├── android/              # Native Android Studio project container
│   ├── src/
│   │   ├── components/       # UI Screens, Explainer Modals & Chatbot Sheet
│   │   ├── context/          # Trilingual LanguageContext provider
│   │   ├── i18n/             # EN, SI, TA localization dictionaries
│   │   └── utils/            # Dynamic vector PDF generator & storage helpers
│   └── vite.config.js        # Optimized code-splitting configuration
│
├── backend/                  # Production Backend Service (FastAPI)
│   ├── main.py               # API endpoints (/api/forecast, /api/chat, /api/explain)
│   ├── models/               # Serialized BiLSTM (.keras) & XGBoost models (.json)
│   └── services/
│       ├── chat_service.py   # Gemini 3.6 Flash RAG & rule-based fallback engine
│       ├── model_service.py  # Model inference & TreeSHAP explainer service
│       └── weather.py        # Real-time meteorological ingestion pipeline
│
├── ml/                       # Machine Learning Engineering & Training Pipelines
│   ├── data/                 # Raw, processed, and feature-engineered datasets
│   ├── notebooks/            # Google Colab / Jupyter training notebooks
│   └── src/                  # Continuous trainer, feature builder, and scalers
│
└── uml/                      # UML diagrams (Use Case, Activity, Class, Sequence)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0+` & `npm`
- **Python**: `3.10+` or `3.12+`
- **Android Studio** *(for Android native APK builds)*

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r ../ml/requirements.txt
pip install fastapi uvicorn pydantic requests

# Set Gemini API Key (Optional, for SentinelAI Chatbot)
export GEMINI_API_KEY="your_api_key_here"   # Linux/macOS
$env:GEMINI_API_KEY="your_api_key_here"     # Windows PowerShell

# Run backend development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Mobile Frontend Setup (React + Capacitor)

```bash
# Navigate to frontend directory
cd aqi-mock-app

# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build production bundle and sync to Android
npm run build
```

---

### 4. Running on Android Device / Emulator

```bash
cd aqi-mock-app

# Open native project in Android Studio
npx cap open android
```
*In Android Studio, click **Run** to launch SentinelAQ directly on your physical Android device or emulator.*

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/forecast?city={kandy\|colombo}` | Real-time sensor readings, BiLSTM 24h forecast, and TreeSHAP attributions. |
| `POST` | `/api/chat` | Conversational RAG assistant powered by Gemini 3.6 Flash / SentinelAI fallback. |
| `GET` | `/api/explain?city={kandy\|colombo}` | In-depth TreeSHAP meteorological attribution values. |
| `GET` | `/health` | System health check and model loading status. |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
