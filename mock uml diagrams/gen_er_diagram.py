"""
gen_er_diagram.py
Generates the SentinelAQ Entity-Relationship Diagram.
Style: modern "table-style" ER (dbdiagram.io aesthetic)
matching the existing aqi_use_case_diagram.png colour palette.

Entities:
  Location, Sensor, AirQualityReading, WeatherReading,
  ForecastResult, SHAPExplanation, User, AlertSubscription

Run:
    python gen_er_diagram.py
Output:
    er_diagram.png
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np

# ── Palette (matching existing diagrams) ─────────────────────────────────────
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
PK_BG      = "#fff8e1"    # light gold for PK rows
FK_BG      = "#e8f4fd"    # light blue for FK rows
HDR_TEXT   = WHITE

ROW_H  = 0.36   # height of each attribute row
HDR_H  = 0.58   # header height
PAD    = 0.10   # inner vertical padding

# ── Canvas ───────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(24, 21))
ax.set_xlim(0, 24)
ax.set_ylim(0, 21)
ax.axis("off")
fig.patch.set_facecolor(WHITE)
ax.set_facecolor(GREY_BG)

# ════════════════════════════════════════════════════════════════════════════
#  Helpers
# ════════════════════════════════════════════════════════════════════════════

def entity(ax, x, y, w, title, rows, hdr_color=NAVY):
    """
    Draw an ER entity box.
    rows = list of (icon, name, type)
      icon: "PK", "FK", "  " (normal)
    Returns anchor dict.
    """
    n   = len(rows)
    h   = HDR_H + PAD + n * ROW_H + PAD

    # shadow
    shadow = FancyBboxPatch((x+0.06, y-h-0.06), w, h,
        boxstyle="round,pad=0.05", lw=0, facecolor=GREY_MID, zorder=1)
    ax.add_patch(shadow)

    # body
    body = FancyBboxPatch((x, y-h), w, h,
        boxstyle="round,pad=0.05", lw=1.4,
        edgecolor=GREY_MID, facecolor=WHITE, zorder=2)
    ax.add_patch(body)

    # header
    hdr = FancyBboxPatch((x, y-HDR_H), w, HDR_H,
        boxstyle="round,pad=0.05", lw=0,
        facecolor=hdr_color, zorder=3)
    ax.add_patch(hdr)
    ax.text(x + w/2, y - HDR_H/2, title,
            ha="center", va="center", fontsize=10, fontweight="bold",
            color=HDR_TEXT, zorder=4)

    # header bottom rule
    ax.plot([x+0.04, x+w-0.04], [y-HDR_H, y-HDR_H],
            color=GREY_MID, lw=0.8, zorder=3)

    # attribute rows
    cur = y - HDR_H - PAD
    for (icon, name, dtype) in rows:
        ry = cur - ROW_H

        # row background for PK / FK
        if icon == "PK":
            rb = FancyBboxPatch((x+0.03, ry+0.02), w-0.06, ROW_H-0.04,
                boxstyle="round,pad=0.02", lw=0, facecolor=PK_BG, zorder=2)
            ax.add_patch(rb)
        elif icon == "FK":
            rb = FancyBboxPatch((x+0.03, ry+0.02), w-0.06, ROW_H-0.04,
                boxstyle="round,pad=0.02", lw=0, facecolor=FK_BG, zorder=2)
            ax.add_patch(rb)

        # icon badge
        icon_colors = {"PK": ("#f9a825","#fff8e1"),
                       "FK": ("#1565c0","#e8f4fd"),
                       "  ": (None, None)}
        ic, _ = icon_colors.get(icon, (None,None))
        if ic:
            bp = FancyBboxPatch((x+0.10, ry+0.07), 0.36, ROW_H-0.14,
                boxstyle="round,pad=0.02", lw=0, facecolor=ic, zorder=3)
            ax.add_patch(bp)
            ax.text(x+0.28, cur - ROW_H/2, icon,
                    ha="center", va="center", fontsize=6,
                    fontweight="bold", color=WHITE, zorder=4)

        ax.text(x+0.56, cur - ROW_H/2, name,
                ha="left", va="center", fontsize=8,
                color=GREY_D if icon=="  " else NAVY,
                fontfamily="monospace", fontweight="bold" if icon in ("PK","FK") else "normal",
                zorder=4)
        ax.text(x+w-0.12, cur - ROW_H/2, dtype,
                ha="right", va="center", fontsize=7.2,
                color=GREY_D, style="italic", zorder=4)

        # row divider
        ax.plot([x+0.04, x+w-0.04], [ry, ry],
                color=GREY_MID, lw=0.5, zorder=3)

        cur -= ROW_H

    # compute anchors
    cy = y - h/2
    return dict(x=x, y=y, w=w, h=h,
                top=(x+w/2, y),
                bot=(x+w/2, y-h),
                left=(x, cy),
                right=(x+w, cy),
                mid_left=(x, cy),
                mid_right=(x+w, cy),
                mid_top=(x+w/2, y),
                mid_bot=(x+w/2, y-h),
                # named row anchors (row n from top, 0-indexed, mid-y of that row)
                _row_y=lambda i: y - HDR_H - PAD - (i+0.5)*ROW_H)


def rel_line(ax, p1, p2, label="", cardinality=("1","N"),
             color=NAVY, dashed=False, lw=1.3):
    """Draw a relationship line with cardinality labels."""
    ls = "--" if dashed else "-"
    ax.annotate("", xy=p2, xytext=p1,
                arrowprops=dict(arrowstyle="-", color=color, lw=lw,
                                linestyle=ls,
                                connectionstyle="arc3,rad=0.0"), zorder=5)
    if label:
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        ax.text(mx, my+0.13, label,
                ha="center", va="bottom", fontsize=7.5,
                color=color, style="italic", zorder=6,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))
    # cardinality markers
    def card(ax, pt, near, txt, color):
        dx = near[0]-pt[0]; dy = near[1]-pt[1]
        norm = max((dx**2+dy**2)**0.5, 0.001)
        ox, oy = pt[0]+0.18*dx/norm, pt[1]+0.18*dy/norm
        ax.text(ox, oy, txt, ha="center", va="center",
                fontsize=8, fontweight="bold", color=color, zorder=7,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))
    card(ax, p1, p2, cardinality[0], color)
    card(ax, p2, p1, cardinality[1], color)


def seg_rel(ax, pts, label="", cardinality=("1","N"),
            color=NAVY, dashed=False, lw=1.3):
    """Multi-segment relationship line."""
    ls = "--" if dashed else "-"
    for i in range(len(pts)-1):
        ax.plot([pts[i][0], pts[i+1][0]],
                [pts[i][1], pts[i+1][1]],
                color=color, lw=lw, linestyle=ls, zorder=5)
    if label:
        mx = (pts[-2][0]+pts[-1][0])/2
        my = (pts[-2][1]+pts[-1][1])/2
        ax.text(mx, my+0.14, label,
                ha="center", va="bottom", fontsize=7.5,
                color=color, style="italic", zorder=6,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1))
    # cardinality at start and end
    def card(ax, pt, nxt, txt):
        dx = nxt[0]-pt[0]; dy = nxt[1]-pt[1]
        norm = max((dx**2+dy**2)**0.5, 0.001)
        ox, oy = pt[0]+0.22*dx/norm, pt[1]+0.22*dy/norm
        ax.text(ox, oy, txt, ha="center", va="center",
                fontsize=8.5, fontweight="bold", color=color, zorder=7,
                bbox=dict(facecolor=WHITE, edgecolor="none", pad=1.5))
    card(ax, pts[0],  pts[1],  cardinality[0])
    card(ax, pts[-1], pts[-2], cardinality[1])


def diamond(ax, cx, cy, txt, color=TEAL):
    """Relationship diamond label (Chen notation style)."""
    d = FancyBboxPatch((cx-0.7, cy-0.22), 1.4, 0.44,
        boxstyle="round,pad=0.06",
        facecolor=color, edgecolor="none", zorder=6)
    ax.add_patch(d)
    ax.text(cx, cy, txt, ha="center", va="center",
            fontsize=7.5, color=WHITE, fontweight="bold", zorder=7)


# ════════════════════════════════════════════════════════════════════════════
#  TITLE
# ════════════════════════════════════════════════════════════════════════════
ax.text(12, 20.75, "SentinelAQ — Entity Relationship Diagram",
        ha="center", fontsize=19, fontweight="bold", color=NAVY, zorder=10)
ax.text(12, 20.32, "Database Schema  ·  Firebase / Firestore Collections",
        ha="center", fontsize=10, color=GREY_D, zorder=10)
ax.plot([0.3, 23.7], [20.12, 20.12], color=GREY_MID, lw=1.2, zorder=5)

# ════════════════════════════════════════════════════════════════════════════
#  ENTITIES
# ════════════════════════════════════════════════════════════════════════════

# ── Location  (top-left) ─────────────────────────────────────────────────────
loc = entity(ax, 0.3, 19.7, 4.2, "Location",
    [("PK", "location_id",   "string"),
     ("  ", "city_name",     "string"),
     ("  ", "latitude",      "float"),
     ("  ", "longitude",     "float"),
     ("  ", "timezone",      "string"),
     ("  ", "elevation_m",   "int"),
     ("  ", "is_active",     "boolean")],
    hdr_color=NAVY)

# ── Sensor  (top second) ─────────────────────────────────────────────────────
sen = entity(ax, 5.0, 19.7, 4.2, "Sensor",
    [("PK", "sensor_id",     "string"),
     ("FK", "location_id",   "string"),
     ("  ", "sensor_index",  "int"),
     ("  ", "sensor_type",   "string"),
     ("  ", "channel",       "string"),
     ("  ", "is_active",     "boolean"),
     ("  ", "last_seen_at",  "datetime")],
    hdr_color=NAVY)

# ── AirQualityReading  (top third) ───────────────────────────────────────────
aqr = entity(ax, 9.8, 19.7, 4.6, "AirQualityReading",
    [("PK", "reading_id",    "string"),
     ("FK", "sensor_id",     "string"),
     ("FK", "location_id",   "string"),
     ("  ", "timestamp_utc", "datetime"),
     ("  ", "pm25_atm",      "float"),
     ("  ", "aqi_value",     "int"),
     ("  ", "aqi_category",  "string"),
     ("  ", "no2_density",   "float"),
     ("  ", "no2_source",    "string"),
     ("  ", "source",        "string")],
    hdr_color=TEAL)

# ── WeatherReading  (top fourth) ─────────────────────────────────────────────
wth = entity(ax, 14.9, 19.7, 4.3, "WeatherReading",
    [("PK", "weather_id",    "string"),
     ("FK", "location_id",   "string"),
     ("  ", "timestamp_utc", "datetime"),
     ("  ", "temp_c",        "float"),
     ("  ", "humidity_pct",  "float"),
     ("  ", "rain_mm",       "float"),
     ("  ", "pressure_hpa",  "float"),
     ("  ", "wind_speed_kmh","float"),
     ("  ", "wind_dir_deg",  "float"),
     ("  ", "source",        "string")],
    hdr_color=TEAL)

# ── User  (top-right) ────────────────────────────────────────────────────────
usr = entity(ax, 19.5, 19.7, 4.2, "User",
    [("PK", "user_id",           "string"),
     ("FK", "preferred_loc_id",  "string"),
     ("  ", "device_id",         "string"),
     ("  ", "platform",          "string"),
     ("  ", "notifications_on",  "boolean"),
     ("  ", "created_at",        "datetime"),
     ("  ", "last_active_at",    "datetime")],
    hdr_color=RED)

# ── ForecastResult  (middle centre) ──────────────────────────────────────────
frc = entity(ax, 6.8, 12.5, 5.0, "ForecastResult",
    [("PK", "forecast_id",   "string"),
     ("FK", "location_id",   "string"),
     ("FK", "reading_id",    "string"),
     ("FK", "weather_id",    "string"),
     ("  ", "generated_at",  "datetime"),
     ("  ", "pm25_current",  "float"),
     ("  ", "aqi_current",   "int"),
     ("  ", "pm25_h1",       "float"),
     ("  ", "pm25_h6",       "float"),
     ("  ", "pm25_h12",      "float"),
     ("  ", "pm25_h24",      "float"),
     ("  ", "pm25_h48",      "float"),
     ("  ", "model_used",    "string"),
     ("  ", "is_valid",      "boolean")],
    hdr_color=PURPLE)

# ── SHAPExplanation  (middle right) ──────────────────────────────────────────
shp = entity(ax, 13.2, 12.5, 4.5, "SHAPExplanation",
    [("PK", "shap_id",       "string"),
     ("FK", "forecast_id",   "string"),
     ("  ", "horizon_h",     "int"),
     ("  ", "feature_name",  "string"),
     ("  ", "feature_label", "string"),
     ("  ", "shap_value",    "float"),
     ("  ", "feature_value", "float"),
     ("  ", "rank",          "int")],
    hdr_color=TEAL_D)

# ── AlertSubscription  (bottom right) ────────────────────────────────────────
alr = entity(ax, 17.8, 12.5, 4.2, "AlertSubscription",
    [("PK", "alert_id",      "string"),
     ("FK", "user_id",       "string"),
     ("FK", "location_id",   "string"),
     ("  ", "threshold_aqi", "int"),
     ("  ", "threshold_cat", "string"),
     ("  ", "is_active",     "boolean"),
     ("  ", "created_at",    "datetime")],
    hdr_color=ORANGE)

# ── UserForecastView  (junction — bottom centre) ──────────────────────────────
ufv = entity(ax, 6.8, 4.2, 4.8, "UserForecastView",
    [("PK", "view_id",       "string"),
     ("FK", "user_id",       "string"),
     ("FK", "forecast_id",   "string"),
     ("  ", "viewed_at",     "datetime"),
     ("  ", "city_selected", "string")],
    hdr_color=GREEN_D)

# ════════════════════════════════════════════════════════════════════════════
#  RELATIONSHIPS
# ════════════════════════════════════════════════════════════════════════════

# Location → Sensor  (1 : N)
seg_rel(ax,
    [loc["right"], (4.75, loc["right"][1]), (4.75, sen["left"][1]), sen["left"]],
    "has", ("1","N"), NAVY)

# Location → AirQualityReading  (1 : N)
seg_rel(ax,
    [(loc["top"][0], loc["top"][1]),
     (loc["top"][0], 20.15),
     (aqr["top"][0]-0.5, 20.15),
     (aqr["top"][0]-0.5, aqr["top"][1])],
    "records", ("1","N"), TEAL)

# Location → WeatherReading  (1 : N)
seg_rel(ax,
    [(loc["top"][0]+0.4, loc["top"][1]),
     (loc["top"][0]+0.4, 20.40),
     (wth["top"][0]-0.3, 20.40),
     (wth["top"][0]-0.3, wth["top"][1])],
    "logs", ("1","N"), TEAL)

# Location → ForecastResult  (1 : N)
seg_rel(ax,
    [(loc["bot"][0], loc["bot"][1]),
     (loc["bot"][0], 12.5+0.3),
     (frc["left"][0], frc["left"][1])],
    "generates", ("1","N"), PURPLE)

# Sensor → AirQualityReading  (1 : N)
seg_rel(ax,
    [sen["right"], (9.5, sen["right"][1]), (9.5, aqr["left"][1]), aqr["left"]],
    "measures", ("1","N"), TEAL)

# AirQualityReading → ForecastResult  (1 : N)  — vertical
seg_rel(ax,
    [(aqr["bot"][0]-0.3, aqr["bot"][1]),
     (aqr["bot"][0]-0.3, 12.5+0.28),
     (frc["top"][0]+0.5, 12.5+0.28),
     (frc["top"][0]+0.5, frc["top"][1])],
    "feeds", ("1","N"), PURPLE, dashed=True)

# WeatherReading → ForecastResult  (1 : N)  — vertical
seg_rel(ax,
    [(wth["bot"][0]-0.3, wth["bot"][1]),
     (wth["bot"][0]-0.3, 12.5+0.50),
     (frc["top"][0]+1.2, 12.5+0.50),
     (frc["top"][0]+1.2, frc["top"][1])],
    "feeds", ("1","N"), PURPLE, dashed=True)

# ForecastResult → SHAPExplanation  (1 : N)
seg_rel(ax,
    [frc["right"], shp["left"]],
    "explained by", ("1","N"), TEAL_D)

# ForecastResult → UserForecastView  (1 : N)
seg_rel(ax,
    [(frc["bot"][0], frc["bot"][1]),
     (frc["bot"][0], ufv["top"][1])],
    "viewed via", ("1","N"), GREEN_D)

# User → UserForecastView  (1 : N)
seg_rel(ax,
    [(usr["bot"][0], usr["bot"][1]),
     (usr["bot"][0], 4.2-1.0),
     (ufv["right"][0]+0.5, 4.2-1.0),
     (ufv["right"][0]+0.5, ufv["right"][1])],
    "views", ("1","N"), GREEN_D)

# User → AlertSubscription  (1 : N)
seg_rel(ax,
    [(usr["bot"][0]-0.3, usr["bot"][1]),
     (usr["bot"][0]-0.3, alr["top"][1]+0.30),
     (alr["top"][0], alr["top"][1]+0.30),
     (alr["top"][0], alr["top"][1])],
    "subscribes", ("1","N"), ORANGE)

# Location → AlertSubscription  (1 : N)
seg_rel(ax,
    [(loc["bot"][0]+0.3, loc["bot"][1]),
     (loc["bot"][0]+0.3, 7.5),
     (alr["right"][0]+0.28, 7.5),
     (alr["right"][0]+0.28, alr["right"][1])],
    "triggers", ("1","N"), ORANGE, dashed=True)

# User → Location  (preferred, M:1)
seg_rel(ax,
    [(usr["left"][0], usr["left"][1]+0.4),
     (loc["right"][0]+0.15, usr["left"][1]+0.4),
     (loc["right"][0]+0.15, loc["right"][1])],
    "prefers", ("N","1"), RED)


# ════════════════════════════════════════════════════════════════════════════
#  LEGEND
# ════════════════════════════════════════════════════════════════════════════
lx, ly = 0.3, 9.0
ax.text(lx+0.5, ly+0.42, "Legend", fontsize=10, fontweight="bold",
        color=NAVY, zorder=10)

# colour legend
ent_items = [
    (NAVY,    "Core reference entities (Location, Sensor)"),
    (TEAL,    "Sensor observation entities"),
    (PURPLE,  "Forecast output entity"),
    (TEAL_D,  "SHAP AI Explainability entity"),
    (RED,     "App user entity"),
    (ORANGE,  "Alert / notification entity"),
    (GREEN_D, "Junction / view entity"),
]
for i, (col, txt) in enumerate(ent_items):
    ry = ly - i*0.46
    r = FancyBboxPatch((lx, ry-0.16), 0.32, 0.32,
        boxstyle="round,pad=0.03", facecolor=col, edgecolor="none", zorder=6)
    ax.add_patch(r)
    ax.text(lx+0.48, ry, txt, fontsize=7.8, color=GREY_D,
            va="center", zorder=6)

# key type legend
ky = ly - len(ent_items)*0.46 - 0.30
ax.text(lx+0.5, ky+0.10, "Key types", fontsize=9, fontweight="bold",
        color=NAVY, zorder=10)
for icon, label, bg in [
    ("PK","Primary Key","#f9a825"),
    ("FK","Foreign Key","#1565c0"),
]:
    ky -= 0.42
    b = FancyBboxPatch((lx, ky-0.14), 0.36, 0.30,
        boxstyle="round,pad=0.03", facecolor=bg, edgecolor="none", zorder=6)
    ax.add_patch(b)
    ax.text(lx+0.18, ky, icon, ha="center", va="center",
            fontsize=7, fontweight="bold", color=WHITE, zorder=7)
    ax.text(lx+0.52, ky, label, fontsize=7.8, color=GREY_D,
            va="center", zorder=6)

# cardinality legend
ky -= 0.55
ax.text(lx+0.5, ky+0.10, "Cardinality", fontsize=9, fontweight="bold",
        color=NAVY, zorder=10)
for card, meaning in [
    ("1 ── N", "One-to-Many"),
    ("1 ── 1", "One-to-One"),
    ("N ── M", "Many-to-Many (via junction)"),
    ("- - - -", "Implicit / derived feed"),
]:
    ky -= 0.42
    ax.text(lx+0.12, ky, card, fontsize=7.8, color=NAVY,
            va="center", fontfamily="monospace", zorder=6)
    ax.text(lx+1.4, ky, meaning, fontsize=7.8, color=GREY_D,
            va="center", zorder=6)

# ════════════════════════════════════════════════════════════════════════════
#  SAVE
# ════════════════════════════════════════════════════════════════════════════
OUT = r"C:\Users\Yasas\Desktop\AQI app\mock uml diagrams\er_diagram.png"
plt.savefig(OUT, dpi=180, bbox_inches="tight", facecolor=WHITE)
plt.close()
print(f"✓ Saved -> {OUT}")
