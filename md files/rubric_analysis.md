# SentinelAQ — FYP Marking Rubric Analysis

## Overall Weighting Breakdown

| Component | Weight | Your Current Status |
|-----------|--------|---------------------|
| **Proposal** | 5% of final | ✅ Submitted |
| **Mid-Point Review (MPR)** | 15% of final | ✅ Submitted |
| **Final Report** | 60% of final | 🔴 Primary focus |
| **Final Presentation** | 20% of final | 🟡 Upcoming |
| **TOTAL** | 100% | |

> [!IMPORTANT]
> The **Final Report (60%)** and **Presentation (20%)** together are **80% of your grade**. Everything below should be read with this in mind.

---

## 1. Proposal — 5% of Final Grade

| # | Criteria | Weight |
|---|----------|--------|
| 1 | Problem Background, Motivation & Research Gap | 15% |
| 2 | Scoping Literature Review | 20% |
| 3 | Methodology | 15% |
| 4 | Research Aim, Questions & Objectives | 15% |
| 5 | Proposed Architecture / Conceptual Design | 15% |
| 6 | Report Presentation Quality (Structure, Formatting & Referencing) | 10% |
| 7 | Proposal Viva | 10% |

> [!NOTE]
> Already submitted. If you can reference it from the final report (e.g., "As outlined in the proposal, the research gap was…"), that continuity helps.

---

## 2. Mid-Point Review (MPR) — 15% of Final Grade

| # | Criteria | Weight |
|---|----------|--------|
| 1 | Introduction & Updated Problem Definition | 10% |
| 2 | Expanded Literature Review (Complete Chapter 2) | 25% |
| 3 | Methodology (Complete Chapter 3) | 25% |
| 4 | Legal, Ethical, Social & Professional (LESP) | 10% |
| 5 | Proof of Concept / Prototype Evidence | 15% |
| 6 | Report Formatting & Presentation Quality | 10% |
| 7 | Interim Presentation (Viva Progress Review) | 5% |

> [!NOTE]
> Already submitted. The MPR Literature Review and Methodology chapters should be significantly expanded for the final report.

---

## 3. Final Report — 60% of Final Grade ⚡ PRIORITY

| # | Chapter | Weight | SentinelAQ Coverage | Priority |
|---|---------|--------|---------------------|----------|
| 1 | Introduction (Chapter 1) | **10%** | Gap → AQI forecasting in Sri Lanka | 🟡 Medium |
| 2 | Literature Review (Chapter 2) | **15%** | XGBoost, SHAP, LSTM, SARIMAX comparison | 🔴 High |
| 3 | Methodology (Chapter 3) | **10%** | Data pipeline, feature engineering, model selection | 🟡 Medium |
| 4 | Implementation / Experimental Setup (Chapter 5) | **15%** | PurpleAir ingestion, venv, XGBoost training, Firebase | 🔴 High |
| 5 | Results and Evaluation (Chapter 6) | **20%** | RMSE, AQI accuracy, SHAP plots, comparison tables | 🔴 **Highest** |
| 6 | Conclusion and Future Work (Chapter 7) | **10%** | Deployment plans, limitations, extensions | 🟡 Medium |
| 7 | Formatting and Referencing Quality | **10%** | IEEE/APA, figures numbered, consistent headings | 🟡 Medium |
| 8 | Overall Originality and Academic Integrity | **10%** | Genuine ML work, original analysis | 🟡 Medium |

### Chapter-by-Chapter Strategy

#### Chapter 1 — Introduction (10%)
- State the problem clearly: **Sri Lanka lacks reliable hyperlocal AQI forecasting**
- Quantify the gap: how many monitoring stations, current coverage limitations
- State your research questions & objectives explicitly (numbered list)
- Include a brief system overview figure (use your existing architecture diagram)

#### Chapter 2 — Literature Review (15%)
- Compare at minimum: **XGBoost vs LSTM vs SARIMAX vs ARIMA** — you have all this data
- Cover: PM2.5 → AQI conversion, explainability (SHAP, LIME), mobile health apps
- Include a **comparison table** of related work (Author, Year, Method, Dataset, RMSE/Accuracy)
- End with a clear paragraph on what YOUR work adds beyond existing literature

#### Chapter 3 — Methodology (10%)
- Research design diagram (flowchart from raw data → model → app)
- Data sources: PurpleAir (PM2.5) + Open-Meteo (weather) — describe collection process
- Feature engineering: lags, rolling stats, cyclical time encoding — detail each
- Train/test split strategy, cross-validation approach
- Justify XGBoost as primary model (cite literature)

#### Chapter 5 — Implementation (15%)
- System architecture diagram ✅ (already done)
- Code structure: data ingestion → preprocessing → training → inference → Firebase → app
- Describe the **48-feature vector** construction explicitly (table format works well)
- Firebase schema and Firestore collections
- React Native app architecture

#### Chapter 6 — Results & Evaluation (20%) ← **Most valuable chapter**
This is worth 12% of your total final grade (20% of 60%). Focus here:

- **Model comparison table**: XGBoost vs LSTM vs SARIMAX for Colombo + Kandy
  - Metrics: RMSE, MAE, R², AQI category accuracy
  - For each horizon: 1h, 6h, 12h, 24h, 48h
- **SHAP visualisations**: summary plot, bar plot, dependence plots — explain what they mean
- **Forecast visualisation**: predicted vs actual PM2.5 time series plots
- **AQI category classification accuracy** (Good/Moderate/Unhealthy etc.)
- Discuss **why** XGBoost outperformed (tree-based handling of tabular lag features, no vanishing gradient)
- Address limitations honestly: data sparsity, single sensor per city, Sri Lanka weather seasonality

#### Chapter 6 — Key Results to Highlight
Based on your actual training outputs, present:
```
Colombo XGBoost — Best horizon:   [your best RMSE horizon]
Kandy   XGBoost — Best horizon:   [your best RMSE horizon]
SHAP Top factors: [PM2.5 lag, humidity, temperature, wind speed, hour_sin/cos]
```

#### Chapter 7 — Conclusion (10%)
- Restate what you achieved (bullet points matching your objectives from Ch1)
- Limitations: single city sensor, no NO2/O3, static model (no online learning)
- Future work: multi-pollutant model, automated retraining pipeline, Docker deployment

#### Formatting (10%)
- IEEE referencing throughout (Mendeley/Zotero recommended)
- All figures must have captions: "Figure 3.2: XGBoost Training Pipeline"
- All tables must have captions above: "Table 6.1: Model Comparison — Colombo"
- Page numbers, consistent font (Times New Roman 12pt or Arial 11pt typically)
- Abstract ≤ 300 words, keywords listed

#### Originality (10%)
- Your SHAP explainability work + Sri Lanka–specific dataset = original contribution
- Explicitly state: "To the best of the author's knowledge, this is the first study applying XGBoost with SHAP explainability to PM2.5 forecasting in Sri Lanka"
- Avoid paraphrasing without citation — run through Turnitin before submission

---

## 4. Final Presentation — 20% of Final Grade

| # | Criteria | Weight | Strategy |
|---|----------|--------|----------|
| 1 | Content Coverage | **20%** | Hit all major chapters in slides |
| 2 | Clarity and Structure of Slides | **15%** | 1 idea per slide, minimal text |
| 3 | Technical Depth and Understanding | **25%** | Explain XGBoost, SHAP, feature engineering |
| 4 | Critical Thinking and Reflection | **15%** | Discuss limitations & why XGBoost won |
| 5 | Presentation Skills and Professionalism | **15%** | Eye contact, pace, no reading slides |
| 6 | Q&A Handling | **10%** | Deep, honest answers; cite your results |

### Presentation Structure (15–20 min)
1. **Problem** (2 min): Why AQI forecasting in Sri Lanka matters
2. **Literature** (2 min): What others did, what's missing
3. **Methodology** (3 min): Data → features → models → evaluation
4. **Results** (5 min): Model comparison, SHAP plots, forecasts — the meat
5. **App Demo** (2 min): Show the mobile UI / mockup
6. **Conclusion** (1 min): What you achieved + future work

### Technical Depth — Q&A Prep
Expect questions on:
- *"Why XGBoost over LSTM?"* → Tabular lag features, no vanishing gradient, faster inference
- *"What do the SHAP values tell you?"* → Which features most influence predictions, directionally
- *"How reliable is PurpleAir data?"* → Consumer-grade sensors, correction factor applied
- *"What is your train/test split?"* → State exact dates/proportions
- *"How would you deploy this at scale?"* → Docker + cron job + Cloud Run or Firebase Functions

---

## Score Maximisation Checklist

### Final Report (60%)
- [ ] Chapter 1 has explicit, numbered research objectives
- [ ] Chapter 2 has a related work comparison **table**
- [ ] Chapter 3 has a methodology **flowchart diagram**
- [ ] Chapter 5 has the 48-feature vector listed in a **table**
- [ ] Chapter 6 has model comparison **tables** (Colombo + Kandy, all horizons)
- [ ] Chapter 6 has SHAP summary plots with **written interpretation**
- [ ] Chapter 6 explicitly states which model won and **why**
- [ ] Chapter 7 has numbered limitations and future work
- [ ] All figures captioned, numbered, referenced in text
- [ ] IEEE references, no orphaned citations
- [ ] Turnitin similarity < 20%

### Presentation (20%)
- [ ] Slides are visual-first (diagrams, charts, not paragraphs)
- [ ] Results slide shows **your** actual numbers
- [ ] SHAP plot slide explains what it means in plain English
- [ ] Practice timing: 15 min talk, 5 min Q&A buffer
- [ ] Prepare answers for 10 likely examiner questions

---

> [!TIP]
> **Highest leverage action**: Spend the most time on Chapter 6 (Results). It's 20% of the report sheet = **12% of your total final grade**. A detailed, well-interpreted results chapter with clear tables, plots, and written analysis is the single biggest score driver.
