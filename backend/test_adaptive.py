import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

def generate_adaptive_forecast(base_pm25, current_time, xgb_step_preds, roll24h_mean=None):
    """
    Applies baseline-relative adjustment.
    If the current air is exceptionally clean (e.g. monsoon rain washout: 5 ug/m3 vs historical 20 ug/m3),
    the model scales the diurnal trajectory relative to current ambient baseline.
    """
    anchor_h = [0]
    anchor_vals = [base_pm25]
    
    # Calculate baseline ratio (live observation vs model's nominal expectation)
    nominal_base = xgb_step_preds.get(1, base_pm25)
    
    # Blending factor between absolute model output and live baseline shift
    # When current PM2.5 is low (< 10 ug/m3), preserve the live low baseline
    for h in [1, 6, 12, 24, 48]:
        if h in xgb_step_preds:
            raw_p = xgb_step_preds[h]
            if base_pm25 < 15.0:
                # Live clean air adjustment: scale prediction towards current observation
                adjusted_p = 0.65 * base_pm25 * (raw_p / max(5.0, nominal_base)) + 0.35 * raw_p
            else:
                adjusted_p = 0.5 * raw_p + 0.5 * base_pm25
                
            anchor_h.append(h)
            anchor_vals.append(max(1.0, adjusted_p))

    interpolator = PchipInterpolator(anchor_h, anchor_vals)
    
    forecasts = []
    for h in range(1, 25):
        target_time = current_time + pd.Timedelta(hours=h)
        val = float(interpolator(h))
        forecasts.append({"horizon": h, "pm25": round(max(1.0, val), 1)})
    return forecasts

# Test Kandy with live base 5.7 ug/m3
now = pd.Timestamp.now('UTC').floor('h')
kandy_xgb = {1: 20.9, 6: 18.6, 12: 15.0, 24: 16.0, 48: 21.0}
print("=== ADAPTIVE KANDY FORECAST (Base: 5.7 ug/m3) ===")
for f in generate_adaptive_forecast(5.7, now, kandy_xgb):
    print(f"h={f['horizon']}: {f['pm25']} ug/m3")
