"""
gen_api_class_diagram.py  v2
Generates the SentinelAQ API / Inference Pipeline Class Diagram.
Style matches the existing aqi_use_case_diagram.png.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# ── Palette ──────────────────────────────────────────────────────────────────
TEAL        = "#1a8a7a"
TEAL_DARK   = "#146b5e"
NAVY        = "#2d3561"
NAVY_LIGHT  = "#3d4b8a"
WHITE       = "#ffffff"
GREY_LIGHT  = "#f4f6f8"
GREY_MID    = "#c8d0da"
GREY_DARK   = "#5a6275"
RED_ACTOR   = "#c0392b"
PURPLE      = "#7b2a8e"
GREEN_DARK  = "#2d5a3d"
ORANGE      = "#c96a1a"

# ── Canvas ───────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(22, 20))
ax.set_xlim(0, 22)
ax.set_ylim(0, 20)
ax.axis("off")
fig.patch.set_facecolor(WHITE)
ax.set_facecolor(GREY_LIGHT)

# ════════════════════════════════════════════════════════════════════════════
#  Helper: draw one UML class box
# ════════════════════════════════════════════════════════════════════════════
def class_box(ax, x, y, w, title, stereotype, attrs, methods,
              hdr_color=NAVY, body_color=WHITE):
    """
    Draws box top-left at (x, y).
    Returns dict of anchor points.
    """
    ROW = 0.33
    HDR = 0.62
    GAP = 0.08
    n_a = len(attrs)
    n_m = len(methods)
    h = HDR + GAP + n_a * ROW + GAP + n_m * ROW + 0.22

    # shadow
    shadow = FancyBboxPatch((x+0.06, y-h-0.06), w, h,
        boxstyle="round,pad=0.04", linewidth=0, facecolor=GREY_MID, zorder=1)
    ax.add_patch(shadow)
    # body
    body = FancyBboxPatch((x, y-h), w, h,
        boxstyle="round,pad=0.04", linewidth=1.4,
        edgecolor=GREY_MID, facecolor=body_color, zorder=2)
    ax.add_patch(body)
    # header
    hdr = FancyBboxPatch((x, y-HDR), w, HDR,
        boxstyle="round,pad=0.04", linewidth=0,
        facecolor=hdr_color, zorder=3)
    ax.add_patch(hdr)
    if stereotype:
        ax.text(x+w/2, y-0.20, f"«{stereotype}»",
                ha="center", va="center", fontsize=7.2, color="white",
                style="italic", zorder=4)
    ax.text(x+w/2, y-0.46, title,
            ha="center", va="center", fontsize=9, fontweight="bold",
            color="white", zorder=4)

    # divider 1
    d1 = y - HDR
    ax.plot([x+0.04, x+w-0.04], [d1, d1], color=GREY_MID, lw=0.8, zorder=3)

    cur = d1 - 0.14
    for a in attrs:
        ax.text(x+0.18, cur, a, ha="left", va="top",
                fontsize=7.2, color=GREY_DARK, fontfamily="monospace", zorder=4)
        cur -= ROW

    # divider 2
    d2 = cur + 0.06
    ax.plot([x+0.04, x+w-0.04], [d2, d2], color=GREY_MID, lw=0.8, zorder=3)
    cur = d2 - 0.14

    for m in methods:
        ax.text(x+0.18, cur, m, ha="left", va="top",
                fontsize=7.2, color=NAVY, fontfamily="monospace", zorder=4)
        cur -= ROW

    cy = y - h/2
    return dict(x=x, y=y, w=w, h=h,
                top=(x+w/2, y), bot=(x+w/2, y-h),
                left=(x, cy), right=(x+w, cy),
                tl=(x, y), tr=(x+w, y),
                bl=(x, y-h), br=(x+w, y-h))


def seg_arrow(ax, pts, label="", color=NAVY, dashed=False, lw=1.3, rad=0.0):
    """Polyline + arrowhead at the last segment."""
    ls = "--" if dashed else "-"
    for i in range(len(pts)-2):
        ax.plot([pts[i][0], pts[i+1][0]], [pts[i][1], pts[i+1][1]],
                color=color, lw=lw, linestyle=ls, zorder=5)
    ax.annotate("", xy=pts[-1], xytext=pts[-2],
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw,
                                linestyle=ls,
                                connectionstyle=f"arc3,rad={rad}"),
                zorder=5)
    if label:
        mx = (pts[-2][0]+pts[-1][0])/2
        my = (pts[-2][1]+pts[-1][1])/2 + 0.13
        ax.text(mx, my, label, ha="center", va="bottom",
                fontsize=7, color=color, style="italic", zorder=6)


def badge(ax, cx, cy, txt, fc="#ffe8d6", ec=ORANGE):
    w, h = 1.55, 0.34
    p = FancyBboxPatch((cx-w/2, cy-h/2), w, h,
        boxstyle="round,pad=0.05", facecolor=fc, edgecolor=ec, lw=1, zorder=6)
    ax.add_patch(p)
    ax.text(cx, cy, txt, ha="center", va="center",
            fontsize=7, color=ec, style="italic", zorder=7)


# ════════════════════════════════════════════════════════════════════════════
#  TITLE
# ════════════════════════════════════════════════════════════════════════════
ax.text(11, 19.75, "SentinelAQ — Inference Pipeline",
        ha="center", fontsize=18, fontweight="bold", color=NAVY, zorder=10)
ax.text(11, 19.35, "Class Diagram  ·  XGBoost Inference + Live API Data Ingestion + SHAP Explainability",
        ha="center", fontsize=10, color=GREY_DARK, zorder=10)

# thin rule
ax.plot([0.3, 21.7], [19.15, 19.15], color=GREY_MID, lw=1, zorder=5)

# ════════════════════════════════════════════════════════════════════════════
#  ROW 1 — External clients  (y=14.9)
# ════════════════════════════════════════════════════════════════════════════
Y1 = 19.0

pa = class_box(ax, 0.3, Y1, 3.8,
    "PurpleAirClient", "API Client",
    ["- api_key : str",
     "- sensor_index : int",
     "- base_url : str"],
    ["+ fetch_latest() : dict",
     "+ fetch_history(hours) : DataFrame",
     "+ get_pm25() : float"],
    hdr_color=NAVY)

om = class_box(ax, 4.4, Y1, 3.8,
    "OpenMeteoClient", "API Client",
    ["- lat : float",
     "- lon : float",
     "- timezone : str"],
    ["+ fetch_current() : dict",
     "+ fetch_forecast(hours) : DataFrame",
     "+ get_weather() : dict"],
    hdr_color=NAVY)

dp = class_box(ax, 8.5, Y1, 4.2,
    "DataPreprocessor", "Processor",
    ["- look_back : int = 48",
     "- train_median : dict"],
    ["+ build_feature_row(pm25, weather) : Series",
     "+ add_lags(df) : DataFrame",
     "+ add_rolling(df) : DataFrame",
     "+ encode_time(ts) : dict"],
    hdr_color=TEAL)

xg = class_box(ax, 13.0, Y1, 4.0,
    "XGBoostPredictor", "ML Model",
    ["- models : dict[int, Booster]",
     "- horizons : list[int]",
     "- train_median : Series"],
    ["+ load_models(path) : void",
     "+ predict(X, horizon) : float",
     "+ predict_all(X) : dict"],
    hdr_color=TEAL)

sh = class_box(ax, 17.3, Y1, 4.3,
    "SHAPExplainer", "Explainer",
    ["- explainer : TreeExplainer",
     "- feature_names : list[str]"],
    ["+ explain(X) : dict",
     "+ top_factors(n) : list[dict]",
     "+ get_waterfall() : dict"],
    hdr_color=TEAL_DARK)

# external API badges
badge(ax, pa["top"][0], pa["top"][1] + 0.22, "«external API»")
badge(ax, om["top"][0], om["top"][1] + 0.22, "«external API»")


# ════════════════════════════════════════════════════════════════════════════
#  ROW 2 — Orchestrator  (y=10.5)
# ════════════════════════════════════════════════════════════════════════════
Y2 = 14.8   # InferencePipeline top — tall box (~5.3 units), bottom lands near 9.5

ip = class_box(ax, 3.5, Y2, 15.0,
    "InferencePipeline", "Orchestrator",
    ["- pa_client : PurpleAirClient",
     "- om_client : OpenMeteoClient",
     "- preprocessor : DataPreprocessor",
     "- predictor : XGBoostPredictor",
     "- explainer : SHAPExplainer",
     "- cache : PredictionCache",
     "- schedule_interval : int = 3600  # seconds"],
    ["+ run() : void                                   # main scheduled entry point",
     "+ fetch_live_data() : tuple                    # pull PM2.5 + weather from APIs",
     "+ prepare_features() : Series               # build 48-feature vector",
     "+ generate_forecasts() : dict               # {1h, 6h, 12h, 24h, 48h} → PM2.5",
     "+ generate_explanations() : dict           # SHAP top-3 contributing factors",
     "+ save_to_store(result) : void              # write ForecastResult to Firebase"],
    hdr_color=PURPLE)

# ════════════════════════════════════════════════════════════════════════════
#  ROW 3 — Supporting classes  (y=5.9)
# ════════════════════════════════════════════════════════════════════════════
Y3 = 8.7    # Supporting classes top — clear of IP bottom (~9.5) by ~0.8 units

pc = class_box(ax, 0.3, Y3, 4.0,
    "PredictionCache", "Cache",
    ["- ttl : int = 3600",
     "- store : dict"],
    ["+ get(key) : dict",
     "+ set(key, val) : void",
     "+ is_fresh(key) : bool",
     "+ invalidate() : void"],
    hdr_color=GREY_DARK)

fb = class_box(ax, 4.6, Y3, 4.4,
    "FirebaseStore", "Database",
    ["- collection : str",
     "- db_url : str"],
    ["+ write_forecast(city, data) : void",
     "+ read_latest(city) : dict",
     "+ read_history(city, hours) : list"],
    hdr_color=NAVY_LIGHT)

fr = class_box(ax, 9.3, Y3, 4.5,
    "ForecastResult", "Value Object",
    ["+ city : str",
     "+ timestamp : datetime",
     "+ pm25_current : float",
     "+ aqi_current : int",
     "+ forecasts : dict[int, float]",
     "+ shap_factors : list[dict]"],
    ["+ to_json() : dict",
     "+ to_aqi_category() : str"],
    hdr_color=GREEN_DARK)

ss = class_box(ax, 14.1, Y3, 4.5,
    "SchedulerService", "Service",
    ["- pipeline : InferencePipeline",
     "- interval_sec : int",
     "- cities : list[str]"],
    ["+ start() : void",
     "+ stop() : void",
     "+ run_cycle() : void",
     "+ on_error(e) : void"],
    hdr_color=NAVY)

# ════════════════════════════════════════════════════════════════════════════
#  ROW 4 — Mobile app  (y=2.0)
# ════════════════════════════════════════════════════════════════════════════
Y4 = 3.2    # Mobile app — clear of row3 bottoms (~5.1) by ~1.9 units

mob = class_box(ax, 6.3, Y4, 5.0,
    "SentinelAQ MobileApp", "Frontend",
    ["- selected_city : str",
     "- refresh_interval : int"],
    ["+ fetch_forecast() : void",
     "+ display_current_aqi() : void",
     "+ show_forecast_chart() : void",
     "+ show_shap_insight_card() : void"],
    hdr_color=RED_ACTOR)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS  (Row1 → Row2)
# ════════════════════════════════════════════════════════════════════════════
RELAY = Y2 + 0.52   # horizontal relay y between row1 bot and row2 top

# PurpleAirClient → InferencePipeline
seg_arrow(ax, [pa["bot"], (pa["bot"][0], RELAY), (ip["top"][0]-5.0, RELAY), (ip["top"][0]-5.0, ip["top"][1])],
          "uses", NAVY)

# OpenMeteoClient → InferencePipeline
seg_arrow(ax, [om["bot"], (om["bot"][0], RELAY), (ip["top"][0]-3.5, RELAY), (ip["top"][0]-3.5, ip["top"][1])],
          "", NAVY)

# DataPreprocessor → InferencePipeline
seg_arrow(ax, [dp["bot"], (dp["bot"][0], RELAY), (ip["top"][0]-0.5, RELAY), (ip["top"][0]-0.5, ip["top"][1])],
          "uses", TEAL)

# XGBoostPredictor → InferencePipeline
seg_arrow(ax, [xg["bot"], (xg["bot"][0], RELAY), (ip["top"][0]+1.8, RELAY), (ip["top"][0]+1.8, ip["top"][1])],
          "", TEAL)

# SHAPExplainer → InferencePipeline
seg_arrow(ax, [sh["bot"], (sh["bot"][0], RELAY), (ip["top"][0]+4.5, RELAY), (ip["top"][0]+4.5, ip["top"][1])],
          "uses", TEAL_DARK)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS  (Row2 → Row3)
# ════════════════════════════════════════════════════════════════════════════
MID2 = Y3 + 0.50   # relay between row2 bot and row3 top

# InferencePipeline → PredictionCache
seg_arrow(ax, [(ip["bot"][0]-5.5, ip["bot"][1]), (ip["bot"][0]-5.5, MID2), (pc["top"][0], pc["top"][1])],
          "caches", GREY_DARK)

# InferencePipeline → FirebaseStore
seg_arrow(ax, [(ip["bot"][0]-2.5, ip["bot"][1]), (ip["bot"][0]-2.5, MID2), (fb["top"][0], fb["top"][1])],
          "persists", NAVY_LIGHT)

# InferencePipeline → ForecastResult  (dashed = produces)
seg_arrow(ax, [(ip["bot"][0]+0.5, ip["bot"][1]), (ip["bot"][0]+0.5, MID2), (fr["top"][0], fr["top"][1])],
          "produces", GREEN_DARK, dashed=True)

# SchedulerService → InferencePipeline
seg_arrow(ax, [ss["top"], (ss["top"][0], ip["bot"][1]+0.18), (ip["right"][0], ip["right"][1])],
          "orchestrates", NAVY, dashed=False)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS  (Row3 → Row4 / mobile app)
# ════════════════════════════════════════════════════════════════════════════
MID3 = Y4 + 0.20

# MobileApp reads FirebaseStore
seg_arrow(ax, [(mob["top"][0]-1.2, mob["top"][1]), (mob["top"][0]-1.2, fb["bot"][1]-0.12), (fb["bot"][0], fb["bot"][1])],
          "reads", NAVY_LIGHT, dashed=True)

# MobileApp displays ForecastResult
seg_arrow(ax, [(mob["top"][0]+0.8, mob["top"][1]), (mob["top"][0]+0.8, fr["bot"][1]-0.12), (fr["bot"][0], fr["bot"][1])],
          "displays", GREEN_DARK, dashed=True)

# ════════════════════════════════════════════════════════════════════════════
#  LEGEND
# ════════════════════════════════════════════════════════════════════════════
items = [
    (NAVY,       "«API Client»    External data sources (PurpleAir, Open-Meteo)"),
    (TEAL,       "«Processor / ML Model»  Data prep + XGBoost inference"),
    (TEAL_DARK,  "«Explainer»    SHAP XAI layer"),
    (PURPLE,     "«Orchestrator»  Central pipeline controller"),
    (GREEN_DARK, "«Value Object»  Forecast data transfer object"),
    (NAVY_LIGHT, "«Database»    Firebase cloud persistence"),
    (GREY_DARK,  "«Cache»    In-memory hourly cache"),
    (RED_ACTOR,  "«Frontend»    React Native mobile app"),
]

lx, ly = 18.8, 8.7
ax.text(lx + 0.7, ly + 0.35, "Legend",
        fontsize=9, fontweight="bold", color=NAVY, zorder=10)
for i, (col, txt) in enumerate(items):
    ry = ly - i * 0.52
    r = FancyBboxPatch((lx, ry - 0.15), 0.3, 0.3,
        boxstyle="round,pad=0.02", facecolor=col, edgecolor="none", zorder=6)
    ax.add_patch(r)
    ax.text(lx + 0.45, ry, txt, fontsize=6.8, color=GREY_DARK,
            va="center", zorder=6, wrap=True)

# ════════════════════════════════════════════════════════════════════════════
#  SAVE
# ════════════════════════════════════════════════════════════════════════════
OUT = r"C:\Users\Yasas\Desktop\AQI app\mock uml diagrams\api_class_diagram.png"
plt.savefig(OUT, dpi=180, bbox_inches="tight", facecolor=WHITE)
plt.close()
print(f"✓ Saved -> {OUT}")
