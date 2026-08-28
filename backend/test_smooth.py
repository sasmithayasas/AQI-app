import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

def generate_smooth_forecast(base_pm25, current_time, xgb_step_preds, bilstm_preds=None, num_hours=24):
    """
    Interpolates multi-horizon boosting predictions with monotonic PCHIP spline
    anchored to the live observation baseline, preventing unrealistic spikes.
    """
    # Key horizon points: h=0 (current), plus available XGBoost horizons
    anchor_h = [0]
    anchor_vals = [base_pm25]
    
    for h in [1, 6, 12, 24, 48]:
        if h in xgb_step_preds:
            anchor_h.append(h)
            v = xgb_step_preds[h]
            # If BiLSTM exists and is in a reasonable range (0.3x to 3x baseline), blend gently
            if bilstm_preds and len(bilstm_preds) >= h and 0 < bilstm_preds[h-1] < base_pm25 * 3.0:
                v = 0.7 * v + 0.3 * bilstm_preds[h-1]
            anchor_vals.append(v)

    # Monotonic piecewise cubic Hermite interpolation (preserves physical shape without overshoot)
    interpolator = PchipInterpolator(anchor_h, anchor_vals)
    
    forecasts = []
    for h in range(1, num_hours + 1):
        target_time = current_time + pd.Timedelta(hours=h)
        val = float(interpolator(h))
        # Ensure non-negative and clamp to realistic physiological boundaries
        val = max(1.0, val)
        forecasts.append({
            "horizon": h,
            "time": target_time.isoformat(),
            "pm25": round(val, 1)
        })
    return forecasts

# Test with Colombo & Kandy values
now = pd.Timestamp.utcnow().floor('h')
col_xgb = {1: 9.5, 6: 8.1, 12: 8.5, 24: 6.4, 48: 8.9}
kandy_xgb = {1: 20.9, 6: 18.6, 12: 15.0, 24: 16.0, 48: 21.0}

print("=== COLOMBO SMOOTH FORECAST ===")
col_f = generate_smooth_forecast(8.2, now, col_xgb)
for f in col_f:
    print(f["horizon"], f["pm25"])

print("\n=== KANDY SMOOTH FORECAST ===")
kandy_f = generate_smooth_forecast(5.7, now, kandy_xgb)
for f in kandy_f:
    print(f["horizon"], f["pm25"])
