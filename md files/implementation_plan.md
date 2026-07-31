# Thesis Restructuring Plan (Professor's Feedback)

This plan outlines exactly how we will adapt the remaining chapters and revise the existing ones to meet your professor's strict requirements.

## ⚠️ Open Questions for You
1. **Interviews/Primary Research:** The professor mentioned *"how the interviews were done etc"*. Did you actually conduct any interviews with domain experts or users for the mobile app requirements? If not, we will state that your primary research was empirical (sensor data collection) and skip the interview part to avoid making things up.
2. **Similar Works (W1, W2, W3):** I will select 3 specific papers from your literature (e.g., Kurukulasuriya, Fernando, Dhammapala) to act as W1, W2, and W3. We will compare their advantages/disadvantages in Chapter 2, and then in Chapter 6, we will mathematically compare your final model against them. Does that sound good?

## Proposed Changes to Thesis Structure

### [MODIFY] Chapter 2: Literature Review
I will append the following to the chapter we just wrote:
*   **History of the Domain:** A timeline of key milestones in air quality forecasting leading up to 2026.
*   **Technical Terminology & Frameworks:** A section explicitly defining XGBoost, LSTM, SARIMAX, and SHAP.
*   **Similar Works (W1, W2, W3):** Explicitly labeling 3 competing papers, detailing their **Advantages** and **Disadvantages**, establishing exactly why your work is needed.

### [NEW] Chapter 4: System Design & Requirements
Before jumping to Implementation, we need a chapter that includes:
*   **Functional & Non-Functional Requirements** for the predictive system and mobile app.
*   **Datasets & Libraries:** Explicit details on PurpleAir, Open-Meteo, and Python libraries used.

### [NEW] Chapter 5: Implementation (The Iterative Journey)
Instead of just describing the final code, this chapter will be structured as an evolutionary journey to "demo the thinking process":
*   **Version 1 (Initial Try):** Using Sentinel-5P Satellite data + PM2.5. We will document the *unsuccessful cases* here (massive data gaps due to cloud occlusion).
*   **Version 2 (The Fix):** Transitioning to ground sensors and filling data gaps, but missing key meteorological context.
*   **Version 3 (The Final Product):** Adding temperature, humidity, and engineered time-lags to create the robust 48-feature XGBoost architecture.

### [NEW] Chapter 6: Results & Evaluation
This chapter will be massive and highly detailed to secure marks:
*   **Algorithm Comparison:** XGBoost vs LSTM vs SARIMAX (already planned).
*   **Inter-Development Results:** How much better v3 was compared to v2 and v1.
*   **The Ultimate Benchmark:** SentinelAQ (Your v3) vs. W1, W2, and W3 from the literature. 
*   **Performance Metrics:** Explicitly stating why your system is better in terms of *implementation speed, productivity, and accuracy*.
*   **Case Studies:** Documenting a successful prediction (e.g., catching a coastal spike) and an unsuccessful one.

### [NEW] Chapter 7: Conclusion & Future Work
*   **Strategic Future Work:** As the professor warned, this cannot be something obvious that you "forgot" to do. I will frame the future work around two advanced, forward-looking ideas:
    1.  *Uncovered Elements:* Expanding the architecture to ingest secondary chemical pollutants (O3, SO2) to create a holistic AQI scale, rather than just PM2.5.
    2.  *Spatial Expansion:* Deploying the pre-trained transfer learning models to lesser-covered, newly industrializing districts (e.g., Hambantota, Jaffna) without needing historical data.

## Execution Strategy
Once you approve this plan (and answer the 2 open questions above), I will:
1.  Briefly update Chapters 2 and 3 with the missing pieces.
2.  Write Chapter 4 (Requirements).
3.  Write Chapter 5 (Iterative Implementation: v1 -> v2 -> v3).
4.  Write Chapter 6 (Massive results comparison).
5.  Write Chapter 7 (Conclusion).
*Note: All output will use academic language suitable for a LaTeX thesis template.*
