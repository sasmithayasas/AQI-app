"""
gen_activity_diagram.py  — SentinelAQ Activity Diagram (3 swim lanes)
Lanes: Scheduler Service | Inference Pipeline | Mobile App
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, FancyArrowPatch
import numpy as np

# ── Palette ──────────────────────────────────────────────────────────────────
NAVY   = "#2d3561"; NAVY_L = "#3d4b8a"; TEAL  = "#1a8a7a"; TEAL_D = "#146b5e"
WHITE  = "#ffffff"; GREY_B = "#eef0f4"; GREY_M = "#c8d0da"; GREY_D = "#5a6275"
RED    = "#c0392b"; PURPLE = "#7b2a8e"; GREEN  = "#2d5a3d"; ORANGE = "#c96a1a"

# ── Canvas ───────────────────────────────────────────────────────────────────
W, H = 26, 36
fig, ax = plt.subplots(figsize=(W, H))
ax.set_xlim(0, W); ax.set_ylim(0, H)
ax.axis("off")
fig.patch.set_facecolor(WHITE); ax.set_facecolor(GREY_B)

# ── Lane geometry ─────────────────────────────────────────────────────────────
LANE_BOUNDS = [(0.3, 8.6), (8.6, 17.8), (17.8, 25.7)]  # (x_left, x_right)
LANE_CX     = [4.45, 13.2, 21.75]
LANE_COLORS = [NAVY, PURPLE, RED]
LANE_LABELS = ["Scheduler Service", "Inference Pipeline", "Mobile App"]
HEADER_Y    = (34.3, 35.7)   # (bottom, top) of header strip
LANE_TOP    = 34.3; LANE_BOT = 0.5

# Draw lane backgrounds + headers
for i, (x0, x1) in enumerate(LANE_BOUNDS):
    bg_color = [f"#eaf0fb", f"#f3edf9", f"#fdecea"][i]
    ax.add_patch(FancyBboxPatch((x0, LANE_BOT), x1-x0, LANE_TOP-LANE_BOT,
        boxstyle="square,pad=0", lw=0, facecolor=bg_color, zorder=0))
    ax.add_patch(FancyBboxPatch((x0, HEADER_Y[0]), x1-x0, HEADER_Y[1]-HEADER_Y[0],
        boxstyle="square,pad=0", lw=0, facecolor=LANE_COLORS[i], zorder=2))
    ax.text(LANE_CX[i], (HEADER_Y[0]+HEADER_Y[1])/2, LANE_LABELS[i],
            ha="center", va="center", fontsize=13, fontweight="bold",
            color=WHITE, zorder=3)

# Vertical lane dividers
for x0, x1 in LANE_BOUNDS:
    ax.plot([x0, x0], [LANE_BOT, LANE_TOP], color=GREY_M, lw=1.5, zorder=1)
ax.plot([LANE_BOUNDS[-1][1]]*2, [LANE_BOT, LANE_TOP], color=GREY_M, lw=1.5, zorder=1)

# Title
ax.text(W/2, 35.3, "SentinelAQ — Activity Diagram",
        ha="center", fontsize=18, fontweight="bold", color=WHITE, zorder=4)

# ── Helper functions ──────────────────────────────────────────────────────────
AW, AH = 3.8, 0.75   # activity width / height

def act(cx, cy, text, color=NAVY, w=AW, h=AH):
    s = FancyBboxPatch((cx-w/2+0.05, cy-h/2-0.05), w, h,
        boxstyle="round,pad=0.06", lw=0, facecolor=GREY_M, zorder=3)
    ax.add_patch(s)
    b = FancyBboxPatch((cx-w/2, cy-h/2), w, h,
        boxstyle="round,pad=0.06", lw=1.5, edgecolor=color, facecolor=WHITE, zorder=4)
    ax.add_patch(b)
    ax.add_patch(FancyBboxPatch((cx-w/2, cy+h/2-0.12), w, 0.12,
        boxstyle="square,pad=0", lw=0, facecolor=color, zorder=5))
    ax.text(cx, cy, text, ha="center", va="center", fontsize=8.2,
            color=GREY_D, multialignment="center", zorder=6, linespacing=1.35)
    return {"top":(cx,cy+h/2), "bot":(cx,cy-h/2),
            "left":(cx-w/2,cy), "right":(cx+w/2,cy)}

def dec(cx, cy, text, size=0.72):
    pts = [(cx,cy+size),(cx+size*1.6,cy),(cx,cy-size),(cx-size*1.6,cy)]
    d = Polygon(pts, closed=True, facecolor=WHITE, edgecolor=ORANGE, lw=1.5, zorder=4)
    ax.add_patch(d)
    ax.text(cx, cy, text, ha="center", va="center", fontsize=7.5,
            color=NAVY, fontweight="bold", multialignment="center", zorder=5)
    return {"top":(cx,cy+size), "bot":(cx,cy-size),
            "left":(cx-size*1.6,cy), "right":(cx+size*1.6,cy)}

def initial(cx, cy, r=0.22):
    ax.add_patch(Circle((cx,cy), r, facecolor=NAVY, zorder=5))

def final(cx, cy, r=0.24):
    ax.add_patch(Circle((cx,cy), r+0.12, facecolor=WHITE, edgecolor=NAVY, lw=2, zorder=5))
    ax.add_patch(Circle((cx,cy), r, facecolor=NAVY, zorder=6))

def arr(x1, y1, x2, y2, label="", color=NAVY, dashed=False):
    ls = "--" if dashed else "-"
    ax.annotate("", xy=(x2,y2), xytext=(x1,y1),
        arrowprops=dict(arrowstyle="-|>", color=color, lw=1.3, linestyle=ls,
                        connectionstyle="arc3,rad=0"), zorder=7)
    if label:
        mx,my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx+0.08, my+0.12, label, ha="center", fontsize=7.5,
                color=color, style="italic", zorder=8,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))

def segarr(pts, label="", color=NAVY, dashed=False):
    ls = "--" if dashed else "-"
    for i in range(len(pts)-2):
        ax.plot([pts[i][0],pts[i+1][0]], [pts[i][1],pts[i+1][1]],
                color=color, lw=1.3, linestyle=ls, zorder=7)
    ax.annotate("", xy=pts[-1], xytext=pts[-2],
        arrowprops=dict(arrowstyle="-|>", color=color, lw=1.3, linestyle=ls,
                        connectionstyle="arc3,rad=0"), zorder=7)
    if label and len(pts)>=2:
        mx = (pts[-2][0]+pts[-1][0])/2
        my = (pts[-2][1]+pts[-1][1])/2
        ax.text(mx+0.08, my+0.12, label, ha="center", fontsize=7.5,
                color=color, style="italic", zorder=8,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))

def note_box(cx, cy, text, color="#fffde7", border=ORANGE, w=3.2, h=0.6):
    ax.add_patch(FancyBboxPatch((cx-w/2, cy-h/2), w, h,
        boxstyle="round,pad=0.05", lw=1, facecolor=color, edgecolor=border, zorder=6))
    ax.text(cx, cy, text, ha="center", va="center", fontsize=7.5,
            color=GREY_D, multialignment="center", zorder=7)

def fork(x1, x2, y, label=""):
    ax.add_patch(FancyBboxPatch((x1, y-0.08), x2-x1, 0.16,
        boxstyle="square,pad=0", lw=0, facecolor=NAVY, zorder=6))
    if label:
        ax.text((x1+x2)/2, y+0.22, label, ha="center", fontsize=7.5,
                color=NAVY, style="italic", zorder=7)

# ════════════════════════════════════════════════════════════════════════════
#  ACTIVITIES
# ════════════════════════════════════════════════════════════════════════════
L1, L2, L3 = LANE_CX   # 4.45, 13.2, 21.75

# ── Initial node (Lane 2) ────────────────────────────────────────────────────
initial(L2, 33.5)
arr(L2, 33.5-0.22, L2, 33.0)

# ── LANE 1: Scheduler ────────────────────────────────────────────────────────
a_timer   = act(L1, 32.5,  "Timer fires\n(every 3600 s)", NAVY)
a_trigger = act(L1, 31.0,  "Trigger InferencePipeline\n.run(city)", NAVY)
d_cities  = dec(L1, 13.5,  "More cities\nto process?")
a_idle_s  = act(L1, 12.0,  "Idle until next\ntimer cycle", NAVY)

# ── LANE 2: Inference Pipeline ───────────────────────────────────────────────
a_recv    = act(L2, 33.0,  "Receive trigger\nfrom Scheduler", PURPLE)
a_fetch_p = act(L2, 31.5,  "Fetch PM2.5 history\nfrom PurpleAir API (48h)", PURPLE)
d_api     = dec(L2, 30.1,  "API\nresponse\nvalid?")
a_fetch_w2= act(L2, 28.6,  "Fetch weather forecast\nfrom Open-Meteo (48h)", PURPLE)
d_data    = dec(L2, 27.2,  ">= 48 data\nrows available?")
a_abort   = act(L2+2.5, 27.2, "Log warning &\nabort cycle", PURPLE, w=2.8)
a_build   = act(L2, 25.8,  "Build 48-feature vector\n(lags, rolling, time encoding)", PURPLE)
a_xgb     = act(L2, 24.3,  "Run XGBoost models\n(h = 1, 6, 12, 24, 48 h)", PURPLE)
a_shap    = act(L2, 22.8,  "Compute SHAP explanations\n(top-3 factors per horizon)", PURPLE)
a_assem   = act(L2, 21.3,  "Assemble ForecastResult\nobject (PM2.5, AQI, SHAP)", PURPLE)
a_write   = act(L2, 19.8,  "Write ForecastResult\nto Firebase Store", PURPLE)
d_write   = dec(L2, 18.5,  "Write\nsuccessful?")
a_done    = act(L2, 17.0,  "Notify Scheduler:\ndone", PURPLE)

# ── LANE 3: Mobile App ───────────────────────────────────────────────────────
a_poll    = act(L3, 17.0,  "App polls Firebase\nfor latest forecast", RED)
d_fresh   = dec(L3, 15.6,  "Forecast\n< 1h old?")
a_banner  = act(L3+2.2, 15.6, "Show 'Updating...'\nbanner", RED, w=3.0)
a_aqi     = act(L3, 14.2,  "Display current\nAQI card", RED)
a_chart   = act(L3, 12.7,  "Render 48h\nforecast chart", RED)
a_insight = act(L3, 11.2,  "Show SHAP\ninsight cards", RED)
d_city    = dec(L3,  9.8,  "User switches\ncity?")
a_switch  = act(L3+2.2, 9.8, "Update selected\ncity", RED, w=2.6)
d_alert   = dec(L3,  8.2,  "AQI >\nalert threshold?")
a_notify  = act(L3,  6.8,  "Send push\nnotification", RED, w=2.8)
a_idle_m  = act(L3,  5.4,  "Idle / await\nnext refresh", RED)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS — Lane 1 (Scheduler)
# ════════════════════════════════════════════════════════════════════════════
arr(*a_timer["bot"],   *a_trigger["top"])

# Scheduler → Pipeline trigger
segarr([a_trigger["right"], (L2-AW/2, 31.0), (L2-AW/2, a_recv["top"][1])],
       "trigger", NAVY)

# Scheduler loop decision back up (comes from Pipeline done)
segarr([a_done["left"], (L1+AW/2, 17.0), (L1+AW/2, 13.5+0.72)], "done", NAVY, dashed=True)
# 'Yes' → re-trigger
segarr([(L1, d_cities["top"][1]), (L1, 32.0), (a_trigger["top"][0], 32.0),
        (a_trigger["top"][0], a_trigger["top"][1])],
       "Yes", NAVY)
arr(*d_cities["bot"], *a_idle_s["top"], "No", NAVY)
final(L1, 11.0)
arr(*a_idle_s["bot"], L1, 11.0+0.36)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS — Lane 2 (Pipeline)
# ════════════════════════════════════════════════════════════════════════════
arr(*a_recv["bot"],    *a_fetch_p["top"])
arr(*a_fetch_p["bot"], *d_api["top"])

# API invalid → use cached (side box) → rejoin at fetch_weather
segarr([d_api["right"], (L2+2.6, 30.1), (L2+2.6, 28.6), (L2+AW/2, 28.6)],
       "No", ORANGE)
arr(*d_api["bot"], L2, 30.1-0.72, "Yes", TEAL_D)
arr(L2, 30.1-0.72, *a_fetch_w2["top"])
arr(*a_fetch_w2["bot"], *d_data["top"])

# Enough data?
# No → abort (side)
segarr([d_data["right"], (L2+2.8, 27.2)], "No", ORANGE)
final(L2+2.8, 26.5)
arr(L2+2.8, 27.2-0.72, L2+2.8, 26.5+0.36)

arr(*d_data["bot"], *a_build["top"], "Yes", TEAL_D)
arr(*a_build["bot"], *a_xgb["top"])
arr(*a_xgb["bot"],   *a_shap["top"])
arr(*a_shap["bot"],  *a_assem["top"])
arr(*a_assem["bot"], *a_write["top"])
arr(*a_write["bot"], *d_write["top"])

# Write failed → retry → back to write
segarr([d_write["right"], (L2+2.6, 18.5), (L2+2.6, 19.8), (L2+AW/2, 19.8)],
       "No / Retry", ORANGE)

arr(*d_write["bot"], *a_done["top"], "Yes", TEAL_D)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS — Cross-lane: Pipeline → MobileApp (Firebase update signal)
# ════════════════════════════════════════════════════════════════════════════
segarr([(L2+AW/2, 19.8), (17.3, 19.8), (17.3, 17.0), (L3-AW/2, 17.0)],
       "Firebase updated", NAVY_L, dashed=True)

# ════════════════════════════════════════════════════════════════════════════
#  ARROWS — Lane 3 (Mobile App)
# ════════════════════════════════════════════════════════════════════════════
arr(*a_poll["bot"],    *d_fresh["top"])

# Not fresh → banner (side) → rejoin at aqi
segarr([d_fresh["right"], (L3+2.5, 15.6), (L3+2.5, 14.2), (L3+AW/2, 14.2)],
       "No", ORANGE)

arr(*d_fresh["bot"],   *a_aqi["top"],  "Yes", TEAL_D)
arr(*a_aqi["bot"],     *a_chart["top"])
arr(*a_chart["bot"],   *a_insight["top"])
arr(*a_insight["bot"], *d_city["top"])

# City switch → poll again
segarr([d_city["right"], (L3+2.8, 9.8), (L3+2.8, 18.0), (L3+AW/2-0.1, 18.0),
        (L3+AW/2-0.1, 17.0+AH/2)], "Yes", ORANGE)

arr(*d_city["bot"],    *d_alert["top"], "No")
arr(*d_alert["bot"],   *a_notify["top"], "Yes", ORANGE)
segarr([a_notify["bot"], (L3, 5.4+AH/2)], "", ORANGE)
segarr([d_alert["right"], (L3+2.5, 8.2), (L3+2.5, 5.4), (L3+AW/2, 5.4)],
       "No", TEAL_D)
arr(*a_idle_m["bot"], L3, 4.2)
final(L3, 4.0)

# ════════════════════════════════════════════════════════════════════════════
#  NOTES / ANNOTATIONS
# ════════════════════════════════════════════════════════════════════════════
note_box(L1, 29.6, "Runs for Colombo\nthen Kandy", "#e3f2fd", NAVY)
note_box(L2, 23.9, "5 horizon predictions\n(1, 6, 12, 24, 48 h)", "#f3e5f5", PURPLE)
note_box(L3, 11.0, "Reads from Firebase\n(no direct ML calls)", "#e8f5e9", GREEN)

# ════════════════════════════════════════════════════════════════════════════
#  LEGEND
# ════════════════════════════════════════════════════════════════════════════
lx, ly = 0.4, 8.5
ax.text(lx+0.1, ly+0.35, "Legend", fontsize=10, fontweight="bold",
        color=NAVY, zorder=10)
items = [
    (WHITE, NAVY,   "Activity (action)"),
    (WHITE, ORANGE, "Decision (diamond)"),
    (NAVY,  NAVY,   "Initial / final node"),
    (None,  ORANGE, "«No» branch"),
    (None,  TEAL_D, "«Yes» branch"),
    (None,  NAVY_L, "Cross-lane data flow"),
]
for i, (fc, ec, lbl) in enumerate(items):
    ry = ly - i*0.50
    if fc is None:
        ax.annotate("", xy=(lx+0.80, ry), xytext=(lx+0.10, ry),
                    arrowprops=dict(arrowstyle="-|>", color=ec, lw=1.4,
                                    linestyle="--" if ec==NAVY_L else "-"), zorder=6)
    else:
        b = FancyBboxPatch((lx+0.08, ry-0.16), 0.62, 0.34,
            boxstyle="round,pad=0.03", facecolor=fc, edgecolor=ec, lw=1.3, zorder=6)
        ax.add_patch(b)
        if fc == NAVY:
            ax.add_patch(Circle((lx+0.39, ry), 0.13, facecolor=NAVY, zorder=7))
    ax.text(lx+1.0, ry, lbl, fontsize=8, color=GREY_D, va="center", zorder=7)

# ════════════════════════════════════════════════════════════════════════════
OUT = r"C:\Users\Yasas\Desktop\AQI app\mock uml diagrams\activity_diagram.png"
plt.savefig(OUT, dpi=180, bbox_inches="tight", facecolor=WHITE)
plt.close()
print(f"✓ Saved -> {OUT}")
