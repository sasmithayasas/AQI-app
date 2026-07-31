"""
gen_sequence_diagram.py
Generates the SentinelAQ Sequence Diagram showing:
  - Scenario A: Scheduled Inference Cycle (backend pipeline)
  - Scenario B: Mobile App User reads forecast

Style matches existing aqi_use_case_diagram.png palette.

Run:
    python gen_sequence_diagram.py
Output:
    sequence_diagram.png
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patches as mpatches
import numpy as np

# ── Palette ──────────────────────────────────────────────────────────────────
TEAL       = "#1a8a7a"
TEAL_D     = "#146b5e"
NAVY       = "#2d3561"
NAVY_L     = "#3d4b8a"
WHITE      = "#ffffff"
GREY_BG    = "#f0f2f5"
GREY_MID   = "#c8d0da"
GREY_D     = "#5a6275"
RED        = "#c0392b"
PURPLE     = "#7b2a8e"
GREEN_D    = "#2d5a3d"
ORANGE     = "#c96a1a"
YELLOW_BG  = "#fffde7"
BLUE_BG    = "#e3f2fd"
PINK_BG    = "#fce4ec"

# ── Canvas ───────────────────────────────────────────────────────────────────
W, H = 26, 24
fig, ax = plt.subplots(figsize=(W, H))
ax.set_xlim(0, W)
ax.set_ylim(0, H)
ax.axis("off")
fig.patch.set_facecolor(WHITE)
ax.set_facecolor(GREY_BG)

# ════════════════════════════════════════════════════════════════════════════
#  Lifeline positions (x coordinates)
# ════════════════════════════════════════════════════════════════════════════
LX = {
    "Scheduler":     1.5,
    "Pipeline":      4.3,
    "PurpleAir":     7.0,
    "OpenMeteo":     9.6,
    "Preprocessor": 12.2,
    "XGBoost":      14.7,
    "SHAP":         17.1,
    "Firebase":     19.5,
    "MobileApp":    22.5,
}
LIFELINE_TOP    = 22.2
LIFELINE_BOTTOM =  0.6

# ── Colours per actor ────────────────────────────────────────────────────────
ACTOR_COLORS = {
    "Scheduler":    NAVY,
    "Pipeline":     PURPLE,
    "PurpleAir":    TEAL,
    "OpenMeteo":    TEAL,
    "Preprocessor": TEAL_D,
    "XGBoost":      TEAL_D,
    "SHAP":         TEAL_D,
    "Firebase":     NAVY_L,
    "MobileApp":    RED,
}
ACTOR_LABELS = {
    "Scheduler":    "Scheduler\nService",
    "Pipeline":     "Inference\nPipeline",
    "PurpleAir":    "PurpleAir\nClient",
    "OpenMeteo":    "OpenMeteo\nClient",
    "Preprocessor": "Data\nPreprocessor",
    "XGBoost":      "XGBoost\nPredictor",
    "SHAP":         "SHAP\nExplainer",
    "Firebase":     "Firebase\nStore",
    "MobileApp":    "SentinelAQ\nMobileApp",
}

# ════════════════════════════════════════════════════════════════════════════
#  TITLE
# ════════════════════════════════════════════════════════════════════════════
ax.text(W/2, 23.72, "SentinelAQ — Sequence Diagram",
        ha="center", fontsize=19, fontweight="bold", color=NAVY, zorder=10)
ax.text(W/2, 23.28, "Inference Cycle (Scenario A)  ·  Mobile App Read (Scenario B)",
        ha="center", fontsize=10, color=GREY_D, zorder=10)
ax.plot([0.3, W-0.3], [23.08, 23.08], color=GREY_MID, lw=1.2, zorder=5)

# ════════════════════════════════════════════════════════════════════════════
#  Helper functions
# ════════════════════════════════════════════════════════════════════════════

def actor_box(ax, key, y_top):
    """Draw actor box + lifeline."""
    x   = LX[key]
    col = ACTOR_COLORS[key]
    lbl = ACTOR_LABELS[key]
    bw, bh = 2.0, 1.0
    # shadow
    s = FancyBboxPatch((x-bw/2+0.05, y_top-bh-0.05), bw, bh,
        boxstyle="round,pad=0.05", lw=0, facecolor=GREY_MID, zorder=1)
    ax.add_patch(s)
    # box
    b = FancyBboxPatch((x-bw/2, y_top-bh), bw, bh,
        boxstyle="round,pad=0.05", lw=1.5,
        edgecolor=col, facecolor=col, zorder=2)
    ax.add_patch(b)
    ax.text(x, y_top-bh/2, lbl, ha="center", va="center",
            fontsize=8.5, fontweight="bold", color=WHITE,
            multialignment="center", zorder=3)
    # lifeline (dashed)
    ax.plot([x, x], [y_top-bh, LIFELINE_BOTTOM],
            color=col, lw=1.2, linestyle=(0,(5,4)), alpha=0.6, zorder=1)


def activation(ax, key, y_start, y_end, width=0.22):
    """Draw an activation box on a lifeline."""
    x = LX[key]
    col = ACTOR_COLORS[key]
    rect = FancyBboxPatch((x-width/2, y_end), width, y_start-y_end,
        boxstyle="square,pad=0", lw=1.2,
        edgecolor=col, facecolor=WHITE, zorder=4)
    ax.add_patch(rect)


def msg(ax, from_key, to_key, y, label, ret=False, color=None,
        label_offset=0.14):
    """Draw a message arrow between two lifelines."""
    x1 = LX[from_key]
    x2 = LX[to_key]
    col = color or (GREY_D if ret else NAVY)
    ls  = "--" if ret else "-"
    style = "-|>" if not ret else "->"

    # small gap around activation box
    gap = 0.12
    x1a = x1 + (gap if x2 > x1 else -gap)
    x2a = x2 - (gap if x2 > x1 else -gap)

    ax.annotate("", xy=(x2a, y), xytext=(x1a, y),
                arrowprops=dict(arrowstyle=style, color=col, lw=1.3,
                                linestyle=ls,
                                connectionstyle="arc3,rad=0.0"),
                zorder=6)
    # label above arrow
    mx = (x1+x2)/2
    ax.text(mx, y+label_offset, label, ha="center", va="bottom",
            fontsize=7.8, color=col,
            style="italic" if ret else "normal",
            bbox=dict(facecolor=WHITE, edgecolor="none", pad=1.0),
            zorder=7)


def self_msg(ax, key, y, label, dy=0.55):
    """Self-call message (loop back arrow)."""
    x = LX[key]
    dx = 0.65
    col = NAVY
    # draw the L-shaped self-call
    ax.annotate("", xy=(x+0.11, y-dy), xytext=(x+0.11, y),
                arrowprops=dict(arrowstyle="-|>", color=col, lw=1.2,
                                connectionstyle=f"arc3,rad=-0.5"),
                zorder=6)
    ax.text(x+dx+0.05, y-dy/2, label, ha="left", va="center",
            fontsize=7.5, color=col, zorder=7,
            bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))


def frame(ax, x1, x2, y_top, y_bot, title, subtitle="",
          color=NAVY, bg=BLUE_BG, lw=1.5):
    """Draw a UML combined fragment frame (loop/alt/ref)."""
    rect = FancyBboxPatch((x1, y_bot), x2-x1, y_top-y_bot,
        boxstyle="square,pad=0", lw=lw,
        edgecolor=color, facecolor=bg, alpha=0.35, zorder=0)
    ax.add_patch(rect)
    # tag box
    tag_w = max(len(title)*0.12, 0.8)
    tag = FancyBboxPatch((x1, y_top-0.42), tag_w+0.20, 0.42,
        boxstyle="square,pad=0", lw=0, facecolor=color, zorder=1)
    ax.add_patch(tag)
    ax.text(x1+0.12, y_top-0.21, title, ha="left", va="center",
            fontsize=8.5, fontweight="bold", color=WHITE, zorder=2)
    if subtitle:
        ax.text(x1 + tag_w + 0.35, y_top-0.21, subtitle,
                ha="left", va="center", fontsize=8, color=color,
                style="italic", zorder=2)


def note(ax, x, y, text, w=2.8, h=0.60, color=YELLOW_BG, border=ORANGE):
    """Sticky note annotation."""
    fold = 0.25
    # main body
    rect = FancyBboxPatch((x, y-h), w, h,
        boxstyle="square,pad=0", lw=1,
        edgecolor=border, facecolor=color, zorder=5)
    ax.add_patch(rect)
    # folded corner
    import matplotlib.patches as mp
    corner = mp.Polygon(
        [(x+w-fold, y), (x+w, y), (x+w, y-fold)],
        closed=True, facecolor=border, edgecolor=border, lw=0, zorder=6)
    ax.add_patch(corner)
    ax.text(x+0.12, y-h/2, text, ha="left", va="center",
            fontsize=7.5, color=GREY_D, zorder=7, linespacing=1.4)


def separator(ax, y, label):
    """Horizontal dashed separator with label."""
    ax.plot([0.3, W-0.3], [y, y], color=GREY_MID, lw=1.5,
            linestyle=(0,(6,3)), zorder=3)
    bg = FancyBboxPatch((W/2-2.8, y-0.22), 5.6, 0.44,
        boxstyle="round,pad=0.06", facecolor=GREY_D, edgecolor="none", zorder=4)
    ax.add_patch(bg)
    ax.text(W/2, y, label, ha="center", va="center",
            fontsize=9, fontweight="bold", color=WHITE, zorder=5)


# ════════════════════════════════════════════════════════════════════════════
#  ACTOR BOXES
# ════════════════════════════════════════════════════════════════════════════
for key in LX:
    actor_box(ax, key, LIFELINE_TOP)

# ════════════════════════════════════════════════════════════════════════════
#  SCENARIO A — Scheduled Inference Cycle
# ════════════════════════════════════════════════════════════════════════════
frame(ax, 0.3, W-0.3, 21.1, 11.8,
      "loop", "[every 3600 s — for each city: Colombo, Kandy]",
      color=NAVY, bg=BLUE_BG)

# activations
activation(ax, "Scheduler",    21.0, 12.0)
activation(ax, "Pipeline",     20.6, 12.2)
activation(ax, "PurpleAir",    20.2, 19.6)
activation(ax, "OpenMeteo",    19.2, 18.6)
activation(ax, "Preprocessor", 18.2, 17.6)
activation(ax, "XGBoost",      17.2, 16.6)
activation(ax, "SHAP",         16.2, 15.6)
activation(ax, "Firebase",     14.9, 14.3)

# 1 — Scheduler triggers pipeline
msg(ax, "Scheduler", "Pipeline", 20.7,
    "1.  run(city='Colombo')", color=NAVY)

# 2 — fetch PM2.5 history
msg(ax, "Pipeline", "PurpleAir", 20.1,
    "2.  fetch_history(hours=48)", color=TEAL)
msg(ax, "PurpleAir", "Pipeline", 19.6,
    "   pm25_series : DataFrame", ret=True, color=TEAL)

# 3 — fetch weather forecast
msg(ax, "Pipeline", "OpenMeteo", 19.0,
    "3.  fetch_forecast(hours=48)", color=TEAL)
msg(ax, "OpenMeteo", "Pipeline", 18.5,
    "   weather_dict : dict", ret=True, color=TEAL)

# 4 — build feature vector
msg(ax, "Pipeline", "Preprocessor", 18.1,
    "4.  build_feature_row(pm25, weather)", color=TEAL_D)
msg(ax, "Preprocessor", "Pipeline", 17.6,
    "   feature_vector : Series  (48 features)", ret=True, color=TEAL_D)

# 5 — predict all horizons
msg(ax, "Pipeline", "XGBoost", 17.1,
    "5.  predict_all(feature_vector)", color=TEAL_D)
msg(ax, "XGBoost", "Pipeline", 16.6,
    "   forecasts : dict  {1h, 6h, 12h, 24h, 48h}", ret=True, color=TEAL_D)

# 6 — SHAP explanation
msg(ax, "Pipeline", "SHAP", 16.1,
    "6.  explain(feature_vector)", color=TEAL_D)
msg(ax, "SHAP", "Pipeline", 15.6,
    "   shap_factors : list[dict]  (top-3 per horizon)", ret=True, color=TEAL_D)

# 7 — build result object (self-call note)
note(ax, LX["Pipeline"]-3.5, 15.2,
     "Assembles ForecastResult\n(pm25, aqi, forecasts, SHAP)",
     w=3.2, h=0.55, color=YELLOW_BG, border=ORANGE)
ax.plot([LX["Pipeline"]-0.3, LX["Pipeline"]-0.11],
        [14.95, 14.95], color=ORANGE, lw=1, linestyle="--", zorder=5)

# 8 — persist to Firebase
msg(ax, "Pipeline", "Firebase", 14.8,
    "7.  write_forecast(city, ForecastResult)", color=NAVY_L)
msg(ax, "Firebase", "Pipeline", 14.3,
    "   ack : 'ok'", ret=True, color=NAVY_L)

# 9 — scheduler ack
msg(ax, "Pipeline", "Scheduler", 13.8,
    "8.  done ✓", ret=True, color=GREY_D)

# loop end note
ax.text(0.55, 12.0, "end loop", ha="left", va="center",
        fontsize=8, color=NAVY, style="italic", zorder=5)

# ════════════════════════════════════════════════════════════════════════════
#  SEPARATOR
# ════════════════════════════════════════════════════════════════════════════
separator(ax, 11.65, "Scenario B — Mobile App User Reads Forecast")

# MobileApp activation
activation(ax, "Firebase",   11.3, 8.4)
activation(ax, "MobileApp",  11.3, 8.0)

frame(ax, 0.3, W-0.3, 11.4, 7.8,
      "ref", "[User opens app / switches city]",
      color=RED, bg=PINK_BG, lw=1.5)

# 10 — app fetches Colombo forecast
msg(ax, "MobileApp", "Firebase", 11.1,
    "9.  read_latest(city='Colombo')", color=RED)
msg(ax, "Firebase",  "MobileApp", 10.6,
    "   ForecastResult : dict", ret=True, color=NAVY_L)

note(ax, LX["MobileApp"]-3.5, 10.4,
     "Displays: Current AQI card\n+ 48h forecast chart\n+ SHAP insight card",
     w=3.2, h=0.72, color="#e8f5e9", border=GREEN_D)

# 11 — user switches city
msg(ax, "MobileApp", "Firebase", 9.4,
    "10.  read_latest(city='Kandy')", color=RED)
msg(ax, "Firebase",  "MobileApp", 8.9,
    "    ForecastResult : dict", ret=True, color=NAVY_L)

note(ax, LX["MobileApp"]-3.5, 8.7,
     "Switches to Kandy view\n+ updates all UI cards",
     w=3.2, h=0.52, color="#e8f5e9", border=GREEN_D)

# ════════════════════════════════════════════════════════════════════════════
#  LEGEND
# ════════════════════════════════════════════════════════════════════════════
lx, ly = 0.35, 7.5
ax.text(lx+0.2, ly+0.30, "Legend", fontsize=10, fontweight="bold",
        color=NAVY, zorder=10)

items = [
    (NAVY,    "-",  "Synchronous message (call)"),
    (GREY_D,  "--", "Return message"),
    (TEAL,    "-",  "External API call"),
    (TEAL_D,  "-",  "Internal ML / processing call"),
    (NAVY_L,  "-",  "Database read / write"),
    (RED,     "-",  "Mobile app user interaction"),
]
for i, (col, ls, lbl) in enumerate(items):
    ry = ly - i*0.50 - 0.15
    ax.annotate("", xy=(lx+1.05, ry), xytext=(lx+0.30, ry),
                arrowprops=dict(arrowstyle="-|>", color=col, lw=1.5,
                                linestyle="--" if ls=="--" else "-"),
                zorder=6)
    ax.text(lx+1.18, ry, lbl, fontsize=8, color=GREY_D, va="center", zorder=7)

# ════════════════════════════════════════════════════════════════════════════
#  SAVE
# ════════════════════════════════════════════════════════════════════════════
OUT = r"C:\Users\Yasas\Desktop\AQI app\mock uml diagrams\sequence_diagram.png"
plt.savefig(OUT, dpi=180, bbox_inches="tight", facecolor=WHITE)
plt.close()
print(f"✓ Saved -> {OUT}")
