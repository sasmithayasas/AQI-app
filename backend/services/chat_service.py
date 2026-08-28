import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Optional

# Primary models in order of capability/version
GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash"
]


def build_system_prompt(telemetry: Dict, city: str, lang: str) -> str:
    """
    Constructs the system prompt injecting real-time IoT and AI forecast telemetry.
    """
    current_aqi = telemetry.get("aqi", 45)
    status = telemetry.get("status", "Good")
    temp = telemetry.get("temp", "28°C")
    humidity = telemetry.get("humidity", "75%")
    wind = telemetry.get("wind", "12")
    wind_dir = telemetry.get("windDir", 225)
    pm25 = telemetry.get("pm25", {}).get("value", 12.0)
    no2 = telemetry.get("no2", {}).get("value", 10.0)
    o3 = telemetry.get("o3", {}).get("value", 20.0)
    co = telemetry.get("co", {}).get("value", 300.0)
    shap = telemetry.get("shap", {})
    forecasts = telemetry.get("forecasts", [])

    # Best & Peak forecast windows
    future = [f for f in forecasts if f.get("horizon", 0) > 0]
    best_str = "Tomorrow morning"
    peak_str = "Evening rush hour"
    if future:
        min_f = min(future, key=lambda x: x.get("aqi", 999))
        max_f = max(future, key=lambda x: x.get("aqi", 0))
        best_str = f"+{min_f.get('horizon')}h window (Est. AQI {min_f.get('aqi')})"
        peak_str = f"+{max_f.get('horizon')}h window (Est. AQI {max_f.get('aqi')})"

    shap_str = f"Humidity: {shap.get('humidity', '0%')}, Wind: {shap.get('wind', '0%')}, Temp: {shap.get('temp', '0%')}, Topography: {shap.get('topo', '0%')}"

    lang_instructions = {
        "si": "Respond naturally and fluently in Sinhala (සිංහල). Use clear everyday language that ordinary Sri Lankan citizens understand.",
        "ta": "Respond naturally and fluently in Tamil (தமிழ்). Use clear everyday language that ordinary Sri Lankan citizens understand.",
        "en": "Respond in English. Use clear, engaging, non-technical language."
    }.get(lang, "Respond in the same language as the user's message.")

    prompt = f"""You are SentinelAI, an intelligent, empathetic environmental health, atmospheric science, and air quality assistant for the SentinelAQ platform.

CURRENT REAL-TIME TELEMETRY FOR {city.upper()} DISTRICT (SRI LANKA):
- Current AQI: {current_aqi} ({status})
- Dominant Pollutant (PM2.5): {pm25} µg/m³
- Other Gases: NO2: {no2} ppb, Ozone (O3): {o3} ppb, Carbon Monoxide: {co} ppb
- Microclimate: Temperature {temp}, Humidity {humidity}, Wind {wind} km/h (Bearing: {wind_dir}°)
- 24-Hour Predictive BiLSTM Forecast:
  * Cleanest Window: {best_str}
  * Expected Pollution Peak: {peak_str}
- Real-time TreeSHAP Drivers: {shap_str}

CORE INSTRUCTIONS:
1. When asked about Sri Lanka or the current district ({city.upper()}), ground your answers directly in the real-time sensor readings, TreeSHAP weather factors, and 24h BiLSTM forecast windows above.
2. COMPARISON & TRAVEL ADVISORY RULE:
   - Colombo vs Kandy Dynamics: Colombo is a coastal plain (~5m elevation) where daytime ocean sea breezes disperse smog, while Kandy is an inter-mountain basin (~500m elevation) prone to nocturnal thermal inversion and moisture trapping.
   - Inter-District Travel Health Advisory: If AQI in either district is 50+ (Moderate, Unhealthy for Sensitive Groups, or Hazardous), clearly advise sensitive travelers, asthmatics, respiratory patients, and children to limit non-essential travel into that district or wear a high-filtration protective mask during outdoor transit.
3. When asked about any global city (e.g. Los Angeles, London, Delhi, Tokyo, Beijing, New York, etc.), answer directly and knowledgeably! Explain its typical air quality, geographical factors, and standard EPA/WHO safety levels.
4. When asked general environmental science, chemistry, or health questions (e.g. "What is PM2.5?", "How do masks work?", "Why does rain clear smog?"), give clear, engaging, easy-to-understand explanations.
5. Keep answers concise, warm, and well-structured with short paragraphs and bullet points.
6. {lang_instructions}
"""
    return prompt


def generate_gemini_response(api_key: str, system_prompt: str, user_message: str, history: Optional[List[Dict]] = None) -> str:
    """
    Calls Google Gemini REST API across available model versions.
    """
    contents = []
    
    # System instruction (or prime message)
    contents.append({
        "role": "user",
        "parts": [{"text": f"System Instructions:\n{system_prompt}\n\nPlease acknowledge and wait for my questions."}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood. I am SentinelAI, ready to assist with real-time air quality and health guidance grounded in live SentinelAQ telemetry."}]
    })

    # Append conversation history
    if history:
        for msg in history[-6:]:  # Keep last 3 turns
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

    # Current user message
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1500,
            "topP": 0.95
        }
    }

    last_error = None
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        except urllib.error.HTTPError as e:
            last_error = f"HTTP {e.code} on {model_name}: {e.read().decode('utf-8')}"
            continue
        except Exception as e:
            last_error = str(e)
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


def fallback_rule_based_response(user_message: str, telemetry: Dict, city: str, lang: str) -> str:
    """
    Intelligent fallback response generator when no Gemini API key is configured.
    """
    current_aqi = telemetry.get("aqi", 45)
    status = telemetry.get("status", "Good")
    temp = telemetry.get("temp", "28°C")
    humidity = telemetry.get("humidity", "75%")
    wind = telemetry.get("wind", "12")
    msg_lower = user_message.lower()

    # 1. Foreign / Non-Sri Lankan Cities check
    foreign_cities = [
        "los angeles", "la", "new york", "london", "delhi", "mumbai", "tokyo",
        "beijing", "paris", "sydney", "california", "america", "usa", "india",
        "china", "bangkok", "singapore", "dubai", "toronto"
    ]
    if any(fc in msg_lower for fc in foreign_cities):
        if lang == "si":
            return (
                "🌍 **භූගෝලීය ආවරණ සීමාව:**\n\n"
                "SentinelAQ වේදිකාවේ සජීවී IoT සංවේදක සහ පැය 24 පුරෝකථන BiLSTM මාදිලි දැනට ක්‍රියාත්මක වන්නේ **ශ්‍රී ලංකාව** (කොළඹ සහ මහනුවර දිස්ත්‍රික්ක) සඳහා පමණි.\n\n"
                "විදේශීය නගර සඳහා ජාත්‍යන්තර වායු තත්ත්ව ජාල (උදා. AirNow හෝ WHO) පරීක්ෂා කළ හැකි නමුත්, ශ්‍රී ලංකාවේ වායු තත්ත්වය හෝ සෞඛ්‍ය උපදෙස් පිළිබඳ ඕනෑම දෙයක් මාගෙන් විමසිය හැක!"
            )
        elif lang == "ta":
            return (
                "🌍 **புவியியல் கவரேஜ் வரம்பு:**\n\n"
                "SentinelAQ இன் நேரடி IoT உணரிகள் மற்றும் 24 மணி நேர BiLSTM கணிப்பு மாதிரிகள் தற்போது **இலங்கைக்கு** (கொழும்பு மற்றும் கண்டி மாவட்டங்கள்) மட்டுமே வடிவமைக்கப்பட்டுள்ளன.\n\n"
                "வெளிநாட்டு நகரங்களுக்கு சர்வதேச காற்று தர நெட்வொர்க்குகளை நீங்கள் பார்க்கலாம். இலங்கையின் காற்று தரம் பற்றி எதையும் என்னிடம் கேட்கலாம்!"
            )
        else:
            return (
                "🌍 **Geographic Coverage Scope:**\n\n"
                "SentinelAQ's live IoT sensor stations and 24-hour predictive BiLSTM deep learning models are currently deployed specifically for **Sri Lanka** (covering **Colombo** and **Kandy Districts**).\n\n"
                "• **Global Cities:** For cities like Los Angeles, London, or Delhi, you can reference regional networks such as **AirNow.gov** or the EPA.\n"
                "• **Sri Lanka Air Quality:** Feel free to ask me about real-time readings, jogging windows, or health precautions for Colombo and Kandy!"
            )

    # 1.5. Colombo vs Kandy Comparison & Inter-District Travel Advisory
    if any(term in msg_lower for term in ["compare", "colombo vs kandy", "kandy vs colombo", "travel", "ගමන්", "සසඳ", "ஒப்பீடு", "பயணம்"]):
        is_above_50 = int(current_aqi) > 50
        if lang == "si":
            if is_above_50:
                return (
                    f"⚠️ **දිස්ත්‍රික්ක අතර ගමන් සෞඛ්‍ය අනතුරු ඇඟවීම ({city.capitalize()}):**\n\n"
                    f"වත්මන් AQI අගය **{current_aqi} ({status})** මට්ටමේ පවතී (50 ට වැඩි).\n\n"
                    f"• **සංචාරක උපදෙස්:** ඇදුම රෝගීන්, ළමුන් සහ වැඩිහිටියන් {city.capitalize()} දිස්ත්‍රික්කය වෙත අනවශ්‍ය ගමන් සීමා කළ යුතු අතර, ගමන් කරන්නේ නම් N95 මුහුණු ආවරණයක් පැළඳීම අනිවාර්ය වේ.\n"
                    f"• **නගර සංසන්දනය:** කොළඹ මුහුදු සුළං මඟින් වාතය පිරිසිදු කරන අතර, මහනුවර කඳුකර නිම්න පිහිටීම නිසා රාත්‍රී කාලයේ වායු දූෂක කොටුවීමේ අවදානමක් පවතී."
                )
            else:
                return (
                    f"✅ **නගර සංසන්දනය සහ ගමන් උපදෙස් ({city.capitalize()}):**\n\n"
                    f"වත්මන් AQI අගය **{current_aqi} ({status})** වන අතර එය 50 සීමාවට වඩා අඩු පිරිසිදු මට්ටමක පවතී.\n\n"
                    f"• **ගමන් තත්ත්වය:** දිස්ත්‍රික්ක අතර ගමන් කිරීම සඳහා වායු තත්ත්වය සුදුසුයි.\n"
                    f"• **කාලගුණ සාධක:** කොළඹ දිවාකාලයේ මුහුදු සුළඟින් වායු පිරිසිදු වන අතර, මහනුවර සවස් භාගයේ අධික ආර්ද්‍රතාවය හේතුවෙන් සුළු ඝනත්වයක් ඇති විය හැක."
                )
        elif lang == "ta":
            if is_above_50:
                return (
                    f"⚠️ **மாவட்டங்களுக்கு இடையேயான பயண சுகாதார எச்சரிக்கை ({city.capitalize()}):**\n\n"
                    f"தற்போதைய AQI **{current_aqi} ({status})** (50 க்கும் மேல்).\n\n"
                    f"• **பயண ஆலோசனை:** ஆஸ்துமா உள்ளவர்கள் மற்றும் குழந்தைகள் {city.capitalize()} மாவட்டத்திற்கு தேவையற்ற பயணங்களைத் தவிர்க்கவும் அல்லது முகக்கவசம் அணியவும்.\n"
                    f"• **ஒப்பீடு:** கொழும்பு கடல் காற்றினால் காற்றை சுத்தப்படுத்துகிறது, கண்டி மலைப்பள்ளத்தாக்கு இரவில் புகையை சிக்க வைக்கிறது."
                )
            else:
                return (
                    f"✅ **நகர ஒப்பீடு மற்றும் பயண வழிகாட்டி ({city.capitalize()}):**\n\n"
                    f"தற்போதைய AQI **{current_aqi} ({status})** (50 க்கும் குறைவான சுத்தமான காற்று).\n\n"
                    f"• **பயண நிலை:** மாவட்டங்களுக்கு இடையே பயணம் செய்ய பாதுகாப்பானது."
                )
        else:
            if is_above_50:
                return (
                    f"⚠️ **Inter-District Travel Health Advisory ({city.capitalize()}):**\n\n"
                    f"Current AQI in {city.capitalize()} is **{current_aqi} ({status})** — exceeding the 50 AQI threshold.\n\n"
                    f"• **Travel Guidance:** Asthmatics, respiratory patients, elderly, and children are advised to limit non-essential travel to this district or wear a protective N95 mask during transit.\n"
                    f"• **Microclimate Comparison:** Colombo benefits from oceanic sea breeze dispersion, whereas Kandy's inter-mountain bowl geography traps particulate matter during nocturnal temperature inversions."
                )
            else:
                return (
                    f"✅ **Colombo vs Kandy Comparison & Travel Guidance:**\n\n"
                    f"Current AQI in {city.capitalize()} is **{current_aqi} ({status})** — safely below the 50 AQI advisory limit.\n\n"
                    f"• **Travel Guidance:** Inter-district transit between Western and Central Provinces is currently favorable and safe for all groups.\n"
                    f"• **Microclimate Comparison:**\n"
                    f"  * **Colombo:** Coastal plain (~5m) with active onshore marine breezes cleansing daytime vehicle emissions.\n"
                    f"  * **Kandy:** Inter-mountain valley basin (~500m) with high humidity and nocturnal valley drafts."
                )

    # 2. General Concept Definitions (What is AQI, PM2.5, NO2, etc.)
    if any(term in msg_lower for term in ["what is aqi", "aqi meaning", "explain aqi", "aqi යනු"]):
        return (
            "📊 **What is the Air Quality Index (AQI)?**\n\n"
            "The **AQI** is a standardized scale from 0 to 500 that translates complex chemical concentrations into clear health stages:\n\n"
            "• **0 – 50 (Good):** Air is clean and safe for all.\n"
            "• **51 – 100 (Moderate):** Acceptable quality; very sensitive individuals may experience mild irritation.\n"
            "• **101 – 150 (Unhealthy for Sensitive Groups):** Asthmatics, children, and elderly should reduce heavy outdoor exertion.\n"
            "• **151 – 200 (Unhealthy):** Everyone should consider wearing a mask outdoors."
        )

    if any(term in msg_lower for term in ["pm2.5", "pm25", "particulate"]):
        return (
            "🔬 **What is PM2.5?**\n\n"
            "**PM2.5** refers to microscopic airborne particles smaller than 2.5 micrometers (about 30 times finer than a human hair).\n\n"
            "• **Why it matters:** Because they are so tiny, they penetrate deep into the lungs and bloodstream.\n"
            f"• **Current Reading ({city.capitalize()}):** {telemetry.get('pm25', {}).get('value', 12)} µg/m³."
        )

    # 3. Outdoor Activities / Jogging
    if any(w in msg_lower for w in ["jog", "run", "walk", "outside", "exercise", "sport", "workout", "පිටත", "ඇවිද", "ක්‍රීඩා", "வெளியே", "ஓட"]):
        if lang == "si":
            return (
                f"🏃 **එළිමහන් ක්‍රියාකාරකම් උපදෙස් ({city.capitalize()}):**\n\n"
                f"වත්මන් AQI අගය **{current_aqi} ({status})** වේ. "
                f"දැනට වාතය සාමාන්‍ය මට්ටමක පවතින බැවින් සාමාන්‍ය එළිමහන් කටයුතු ආරක්ෂිතයි.\n\n"
                f"💡 **හොඳම කාලය:** හෙට උදෑසන 6:00 – 8:30 අතර කාලය පිරිසිදු වාතය සඳහා වඩාත් සුදුසු වේ."
            )
        elif lang == "ta":
            return (
                f"🏃 **வெளிப்புற நடவடிக்கை வழிகாட்டி ({city.capitalize()}):**\n\n"
                f"தற்போதைய AQI **{current_aqi} ({status})** ஆகும். "
                f"பொதுவான வெளிப்புற நடவடிக்கைகளுக்கு பாதுகாப்பானது.\n\n"
                f"💡 **சிறந்த நேரம்:** நாளை காலை 6:00 – 8:30 வரை சுத்தமான காற்று இருக்கும்."
            )
        else:
            return (
                f"🏃 **Outdoor Activity Guidance for {city.capitalize()}:**\n\n"
                f"Current AQI is **{current_aqi} ({status})** with PM2.5 at **{telemetry.get('pm25', {}).get('value', 12)} µg/m³**.\n\n"
                f"• **Best Window:** Morning hours (6:00 AM – 9:00 AM) offer the cleanest air window.\n"
                f"• **Caution Window:** Limit strenuous cardio during evening rush hour (6:00 PM – 9:00 PM) when humidity traps traffic emissions."
            )

    # 4. Weather / SHAP Drivers
    if any(w in msg_lower for w in ["why", "cause", "factor", "reason", "humidity", "wind", "spike", "ඇයි", "හේතුව", "காரணம்"]):
        if lang == "si":
            return (
                f"🔍 **වායු තත්ත්ව සාධක විශ්ලේෂණය ({city.capitalize()}):**\n\n"
                f"වත්මන් ආර්ද්‍රතාවය **{humidity}** වන අතර සුළඟ පැයට කි.මී. **{wind}** කි. "
                f"ආර්ද්‍රතාවය ඉහළ යාම නිසා සියුම් දූවිලි අංශු පහළ මට්ටමේ රැඳී පවතී."
            )
        elif lang == "ta":
            return (
                f"🔍 **காற்று காரணிகள் அறிக்கை ({city.capitalize()}):**\n\n"
                f"ஈரப்பதம் **{humidity}**, காற்று வேகம் **{wind} km/h**.\n\n"
                f"அதிக ஈரப்பதம் நுண்ணிய துகள்களை தரையிலேயே தக்கவைக்கிறது."
            )
        else:
            return (
                f"🔍 **Environmental Factor Breakdown for {city.capitalize()}:**\n\n"
                f"Current conditions: Humidity at **{humidity}**, Wind at **{wind} km/h**.\n\n"
                f"• **Humidity & Moisture:** High humidity causes microscopic PM2.5 particles to swell with moisture, keeping them suspended near ground level.\n"
                f"• **Ventilation:** Active breezes help flush out pollution, while stagnant periods let vehicle exhaust accumulate."
            )

    # 5. Sensitive Groups / Health
    if any(w in msg_lower for w in ["child", "asthma", "elderly", "mask", "safe", "health", "sensitive", "ළමුන්", "ඇදුම", "குழந்தை", "ஆஸ்துமா"]):
        if lang == "si":
            return (
                f"🫁 **සෞඛ්‍ය හා සංවේදී කණ්ඩායම් උපදෙස් ({city.capitalize()}):**\n\n"
                f"වත්මන් AQI අගය **{current_aqi} ({status})** වේ.\n\n"
                f"• **සාමාන්‍ය ජනතාව:** එදිනෙදා කටයුතු සඳහා ආරක්ෂිතයි.\n"
                f"• **ඇදුම රෝගීන් සහ ළමුන්:** සවස් කාලයේ වායු ඝනත්වය වැඩි වුවහොත් මුහුණු ආවරණ පළඳින්න."
            )
        else:
            return (
                f"🫁 **Health & Sensitive Groups Advisory for {city.capitalize()}:**\n\n"
                f"Current AQI is **{current_aqi} ({status})**.\n\n"
                f"• **General Public:** Safe for regular everyday activities.\n"
                f"• **Asthmatics & Children:** If AQI rises above 100 during evening inversion, wear a standard protective mask outdoors and keep inhalers accessible."
            )

    # 6. Default City Telemetry Summary
    if lang == "si":
        return (
            f"🌿 **SentinelAI සජීවී වායු වාර්තාව ({city.capitalize()}):**\n\n"
            f"• වත්මන් AQI: **{current_aqi} ({status})**\n"
            f"• උෂ්ණත්වය: **{temp}** | ආර්ද්‍රතාව: **{humidity}** | සුළඟ: **{wind} km/h**\n\n"
            f"ඔබට එළිමහන් කටයුතු, මුහුණු ආවරණ හෝ අනාවැකි පිළිබඳ ඕනෑම ප්‍රශ්නයක් විමසිය හැක."
        )
    elif lang == "ta":
        return (
            f"🌿 **SentinelAI நேரடி காற்று அறிக்கை ({city.capitalize()}):**\n\n"
            f"• தற்போதைய AQI: **{current_aqi} ({status})**\n"
            f"• வெப்பநிலை: **{temp}** | ஈரப்பதம்: **{humidity}** | காற்று: **{wind} km/h**\n\n"
            f"வெளிப்புற பயிற்சிகள், ஜன்னல் பாதுகாப்பு அல்லது முன்னறிவிப்பு பற்றி நீங்கள் கேட்கலாம்."
        )
    else:
        return (
            f"🌿 **SentinelAI Live Air Quality Summary for {city.capitalize()}:**\n\n"
            f"• **Current AQI:** {current_aqi} ({status})\n"
            f"• **PM2.5:** {telemetry.get('pm25', {}).get('value', 12)} µg/m³ | **NO2:** {telemetry.get('no2', {}).get('value', 10)} ppb\n"
            f"• **Weather:** {temp}, {humidity} humidity, {wind} km/h wind.\n\n"
            f"Feel free to ask about outdoor exercise timings, health precautions, or 24-hour forecast trends!"
        )


def answer_user_query(user_message: str, telemetry: Dict, city: str = "kandy", lang: str = "en", history: Optional[List[Dict]] = None) -> Dict:
    """
    Main entry point for conversational air quality queries.
    Tries Google Gemini LLM first; gracefully falls back to intelligent rule-based engine.
    """
    # Read API Key from environment variable
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if api_key and len(api_key.strip()) > 10:
        try:
            system_prompt = build_system_prompt(telemetry, city, lang)
            reply_text = generate_gemini_response(api_key.strip(), system_prompt, user_message, history)
            return {
                "source": "gemini_llm",
                "city": city,
                "lang": lang,
                "reply": reply_text
            }
        except Exception as e:
            print(f"[SentinelAI] Gemini API error: {e}. Falling back to rule-based engine.")

    # Rule-based fallback
    reply_text = fallback_rule_based_response(user_message, telemetry, city, lang)
    return {
        "source": "sentinel_ai_engine",
        "city": city,
        "lang": lang,
        "reply": reply_text
    }
