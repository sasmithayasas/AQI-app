# SentinelAQ - UI Design Generation Script

**Instructions:** Copy and paste the entire text below into the Google Stitch prompt box or save it as a `DESIGN.md` file and upload it to Stitch. This script is engineered to generate all the necessary screens and components required for your final thesis implementation (incorporating the XGBoost predictions, SHAP explainability, and Sri Lankan topography).

***

### 🎯 Core Application Concept
**App Name:** SentinelAQ
**Domain:** Environmental AI / Public Health
**Vibe/Aesthetic:** A modern, enterprise-grade environmental dashboard. Use a clean "Frutiger Aero" inspired aesthetic with modern sensibilities (glassmorphism, vibrant organic gradients, smooth rounded corners, translucent panels, and high-quality nature/sky backgrounds). The UI must feel breathable, scientific, yet highly accessible to the general public.

### 🎨 Design System & Styling
- **Primary Color:** Deep Ocean Blue (`#00658d`)
- **Secondary Color (Good AQI):** Leaf Green (`#416900`)
- **Warning Color (Moderate AQI):** Amber/Orange (`#db951f`)
- **Danger Color (Hazardous AQI):** Crimson Red (`#ba1a1a`)
- **Backgrounds:** Use bright, airy atmospheric backgrounds (clear skies, soft clouds) with heavy use of `.backdrop-blur` and translucent glass panels (glassmorphism).
- **Typography:** `Plus Jakarta Sans` for large numerical displays and headers, `Fira Sans` for body text.

---

### 📱 Required Screens to Generate

Please generate the following 5 interconnected screens with full Tailwind CSS HTML:

#### 1. National Map & Overview Screen (Home)
**Purpose:** The landing screen where users select their district.
- **Components:**
  - A stylized, minimalist SVG map of Sri Lanka.
  - Interactive pulsing markers over **Colombo** (Coastal region) and **Kandy** (Central Highlands).
  - A glassmorphism bottom sheet showing the national average AQI.
  - A prominent "Live Weather & Wind" indicator to highlight topographical dispersion.

#### 2. District Dashboard (The XGBoost Output Screen)
**Purpose:** The main dashboard when a user clicks on Kandy or Colombo.
- **Components:**
  - **Massive AQI Gauge:** A glossy, circular glass gauge in the center displaying the real-time AQI number (e.g., 32).
  - **Micro-Climate Row:** Real-time data for Temperature, Humidity, and Wind Speed (vital for our model).
  - **Chemical Breakdown Bento Box:** A grid showing individual levels for PM2.5 (hero metric), NO2, O3, and CO with mini progress bars.
  - **AI Status Banner:** A banner stating "Forecast powered by XGBoost Engine".

#### 3. AI Insights & SHAP Explainability Screen
**Purpose:** To satisfy the thesis requirement of model explainability (unboxing the black box).
- **Components:**
  - **SHAP Summary Chart:** A visual horizontal bar chart showing which weather features (Humidity, Temperature, Wind) are driving the current pollution up or down.
  - **Topography Analysis Text Box:** A glass card explaining the current geographic effect (e.g., "Colombo: Coastal breezes are dispersing pollutants" or "Kandy: Valley thermal inversion is trapping PM2.5").

#### 4. Multi-Horizon Forecasting (Trends)
**Purpose:** To showcase the 1h to 48h predictive capabilities of the model.
- **Components:**
  - **48-Hour Area Chart:** A beautiful, glowing area chart showing the AQI trend. It should map the past 48 hours (solid line) and the predicted future 48 hours (dashed glowing line).
  - **Peak/Trough Indicators:** Callout cards showing the "Expected Peak" and "Expected Lowest" AQI for the next two days.

#### 5. Push Notification & Alert Settings Screen
**Purpose:** To demonstrate the Firebase Cloud Messaging (FCM) integration.
- **Components:**
  - **Toggle Switches:** "Enable Push Notifications", "Daily Morning Summary", "Severe Spike Alerts".
  - **Threshold Slider:** An interactive slider allowing the user to select at what AQI level they wish to be alerted (e.g., "Alert me when AQI > 100").
  - **Active Alerts Log:** A list of recent push notifications received (e.g., "⚠️ Warning: PM2.5 spike detected in Kandy valley").

---

### ⚙️ Component Requirements
- Ensure all screens have a persistent **Bottom Navigation Bar** linking to Home, Trends, AI Insights, and Settings.
- Use **Tailwind CSS** heavily.
- Include subtle CSS keyframe animations (like a slow `float` for background orbs and a `pulse` for map markers).
- Ensure the layout is responsive but optimized for mobile views (max-width: 414px constraint container).
