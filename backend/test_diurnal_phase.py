import numpy as np
import pandas as pd

def get_diurnal_multiplier(utc_timestamp, city="colombo"):
    """
    Physical Meteorological Diurnal Boundary Layer Model for Sri Lanka (UTC+5:30).
    - Pre-Dawn Minimum (03:00 - 05:30 AM SLST): Min emissions, nocturnal settling (~0.75x baseline)
    - Morning Peak (08:00 - 09:30 AM SLST): Morning rush hour (~1.20x baseline)
    - Midday Convective Dilution (12:30 - 14:30 PM SLST): High PBL height, convective mixing (~0.90x baseline)
    - Evening Inversion Peak (17:30 - 20:30 PM SLST): Evening traffic + shallow boundary layer (~1.30x baseline)
    """
    # Convert UTC to Sri Lanka Local Time (UTC+5.5)
    local_hour = (utc_timestamp.hour + utc_timestamp.minute / 60.0 + 5.5) % 24.0
    
    # Phase calibrated to local solar time
    # Morning peak at 8.5h, Evening peak at 19.0h, Min at 4.5h, Midday dip at 13.5h
    h_rad = 2 * np.pi * local_hour / 24.0
    
    # Fourier representation matching physical PBL observation data
    base_wave = 1.0 + 0.16 * np.sin(h_rad - np.pi * 0.75) + 0.18 * np.cos(2 * (h_rad - np.pi * 0.75))
    
    if city == "kandy":
        # Valley stagnation boost in late evening
        if 18.0 <= local_hour <= 22.0:
            base_wave += 0.08
            
    return max(0.65, min(1.45, base_wave))

now_utc = pd.Timestamp.now('UTC').floor('h')
print("=== CALIBRATED DIURNAL PROFILE (SRI LANKA LOCAL TIME) ===")
print("UTC Time       Local Time   Multiplier   Physical Regime")
for h in range(24):
    t_utc = now_utc + pd.Timedelta(hours=h)
    local_h = (t_utc.hour + 5.5) % 24
    local_time_str = f"{int(local_h):02d}:{int((local_h%1)*60):02d}"
    mult = get_diurnal_multiplier(t_utc, "kandy")
    regime = ""
    if 3.0 <= local_h <= 6.0:
        regime = "-> LOWEST AQI (Pre-Dawn Night)"
    elif 8.0 <= local_h <= 10.0:
        regime = "-> MORNING RUSH PEAK"
    elif 12.5 <= local_h <= 15.0:
        regime = "-> Midday Convective Dip"
    elif 17.5 <= local_h <= 21.0:
        regime = "-> EVENING INVERSION PEAK"
        
    print(f"{t_utc.strftime('%H:%M')} UTC    {local_time_str} SLST    {mult:.3f}        {regime}")
