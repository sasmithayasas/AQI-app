import React, { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import AqiExplainerModal from './AqiExplainerModal'
import ChemicalExplainerModal from './ChemicalExplainerModal'

const getAqiTheme = (aqi) => {
  const val = Number(aqi) || 0
  if (val <= 50) {
    return {
      level: 'good',
      labelKey: 'statusGood',
      textColor: 'text-sky-950',
      badgeBg: 'bg-[#b7f568]',
      badgeText: 'text-[#2a4511]',
      outerGlass: 'border-emerald-400/70 bg-gradient-to-br from-emerald-400/25 via-white/30 to-emerald-500/10 shadow-[0_12px_36px_rgba(0,0,0,0.18),inset_0_2px_4px_rgba(255,255,255,0.8)]',
      innerGlass: 'from-white/85 via-white/55 to-emerald-50/30 border-white/70',
    }
  } else if (val <= 100) {
    return {
      level: 'moderate',
      labelKey: 'statusModerate',
      textColor: 'text-amber-950',
      badgeBg: 'bg-[#ffd54f]',
      badgeText: 'text-[#5a3a00]',
      outerGlass: 'border-amber-400/70 bg-gradient-to-br from-amber-400/25 via-white/30 to-amber-500/10 shadow-[0_12px_36px_rgba(0,0,0,0.18),inset_0_2px_4px_rgba(255,255,255,0.8)]',
      innerGlass: 'from-white/85 via-white/55 to-amber-50/30 border-white/70',
    }
  } else if (val <= 150) {
    return {
      level: 'sensitive',
      labelKey: 'statusUnhealthy',
      textColor: 'text-orange-950',
      badgeBg: 'bg-[#ff9800]',
      badgeText: 'text-white',
      outerGlass: 'border-orange-400/75 bg-gradient-to-br from-orange-400/25 via-white/30 to-orange-500/10 shadow-[0_12px_36px_rgba(0,0,0,0.18),inset_0_2px_4px_rgba(255,255,255,0.8)]',
      innerGlass: 'from-white/85 via-white/55 to-orange-50/30 border-white/70',
    }
  } else {
    return {
      level: 'hazardous',
      labelKey: 'statusHazardous',
      textColor: 'text-red-950',
      badgeBg: 'bg-[#ef5350]',
      badgeText: 'text-white',
      outerGlass: 'border-rose-400/80 bg-gradient-to-br from-rose-400/30 via-white/30 to-red-500/15 shadow-[0_12px_36px_rgba(0,0,0,0.18),inset_0_2px_4px_rgba(255,255,255,0.8)]',
      innerGlass: 'from-white/85 via-white/55 to-rose-50/30 border-white/70',
    }
  }
}

const getWindDetails = (deg, cityId) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round(((deg % 360) / 45)) % 8
  const cardinal = dirs[idx]
  let noteKey = 'windCalm'
  if (cardinal.includes('W') || cardinal.includes('S')) {
    noteKey = cityId === 'colombo' ? 'windOnshoreSea' : 'windHill'
  } else {
    noteKey = cityId === 'kandy' ? 'windValley' : 'windInland'
  }
  return { cardinal, noteKey }
}

const HomeScreen = ({ data, onToggleCity, onNavigateToInsights, onRefresh, loading }) => {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const [showAqiExplainer, setShowAqiExplainer] = useState(false)
  const [showChemExplainer, setShowChemExplainer] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = React.useRef(0)
  
  // Memoized threshold theme
  const aqiNum = Number(data.aqi) || 0
  const aqiTheme = useMemo(() => getAqiTheme(aqiNum), [aqiNum])
  const isGood = aqiTheme.level === 'good'

  // Pull-to-refresh touch handlers
  const handleTouchStart = (e) => {
    if (window.scrollY <= 4) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }

  const handleTouchMove = (e) => {
    if (!touchStartY.current || window.scrollY > 4) return
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY.current
    if (diff > 0) {
      const distance = Math.min(85, diff * 0.45)
      setPullDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance >= 55 && typeof onRefresh === 'function' && !loading) {
      onRefresh()
    }
    setPullDistance(0)
    touchStartY.current = 0
  }

  // Memoized optimal outdoor planning windows
  const { bestWindow, peakWindow } = useMemo(() => {
    const forecasts = Array.isArray(data.forecasts) ? data.forecasts : []
    const futureForecasts = forecasts.filter(f => f && (f.horizon > 0 || f.time))

    const formatWindowTime = (timeStr, horizon) => {
      if (!timeStr) return horizon ? `+${horizon}h` : 'Tomorrow'
      try {
        const d = new Date(timeStr)
        if (isNaN(d.getTime())) return String(timeStr)
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { weekday: 'short' })
      } catch (_) {
        return String(timeStr)
      }
    }

    let best = { timeStr: 'Tomorrow 7:00 AM', aqi: 28, isGood: true }
    let peak = { timeStr: 'Today 6:00 PM', aqi: 74, isGood: false }

    if (futureForecasts.length > 0) {
      const minF = futureForecasts.reduce((prev, curr) => (Number(curr.aqi || 0) < Number(prev.aqi || 0) ? curr : prev))
      const maxF = futureForecasts.reduce((prev, curr) => (Number(curr.aqi || 0) > Number(prev.aqi || 0) ? curr : prev))
      best = {
        timeStr: formatWindowTime(minF.time, minF.horizon),
        aqi: minF.aqi ?? 32,
        isGood: (minF.aqi ?? 32) <= 50,
      }
      peak = {
        timeStr: formatWindowTime(maxF.time, maxF.horizon),
        aqi: maxF.aqi ?? 85,
        isGood: (maxF.aqi ?? 85) <= 50,
      }
    }
    return { bestWindow: best, peakWindow: peak }
  }, [data.forecasts])

  // Memoized wind info
  const windBearing = Number(data.windDir) || (data.id === 'colombo' ? 225 : 45)
  const windInfo = useMemo(() => getWindDetails(windBearing, data.id), [windBearing, data.id])

  return (
    <div 
      className="min-h-screen relative pb-8 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Hardware Accelerated Overlay */}
      <div className="fixed inset-0 -z-10 overflow-hidden transform-gpu">
        <div
          className="absolute inset-0 w-full h-full scale-105 transition-opacity duration-700 will-change-transform"
          style={{
            backgroundImage: data.id === 'kandy'
              ? "url('/kandy_bg.jpg')"
              : "url('/colombo_bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(3px)',
            transform: 'translateZ(0)',
          }}
        />
        <div
          className={`absolute inset-0 transition-colors duration-700 ${isGood
            ? 'bg-gradient-to-b from-sky-900/50 via-sky-800/30 to-slate-900/70'
            : 'bg-gradient-to-b from-orange-900/50 via-amber-800/30 to-stone-900/70'
            }`}
        />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center p-6 text-white drop-shadow-lg">
        <button onClick={cycleLang} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find(l => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
        <button onClick={onToggleCity} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <span className="material-symbols-outlined">location_on</span>
        </button>
      </header>

      {/* Pull-to-Refresh Frosted Visual Indicator */}
      <div 
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none px-6"
        style={{
          height: loading ? '48px' : `${pullDistance}px`,
          opacity: pullDistance > 6 || loading ? 1 : 0,
          marginBottom: pullDistance > 6 || loading ? '12px' : '0px'
        }}
      >
        <div className="bg-black/50 backdrop-blur-xl border border-white/25 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-white transform">
          <div 
            className={`w-4 h-4 flex items-center justify-center rounded-full ${loading ? 'animate-spin text-[#ccff00]' : 'text-white'}`}
            style={{
              transform: loading ? 'none' : `rotate(${pullDistance * 6}deg)`
            }}
          >
            <span className="material-symbols-outlined text-[16px]">
              {loading ? 'sync' : pullDistance >= 55 ? 'arrow_downward' : 'refresh'}
            </span>
          </div>
          <span className="text-[10.5px] font-extrabold tracking-tight">
            {loading 
              ? (t('refreshing') || 'Updating live telemetry...') 
              : pullDistance >= 55 
              ? (t('releaseToRefresh') || 'Release to refresh') 
              : (t('pullToRefresh') || 'Pull down to refresh')}
          </span>
        </div>
      </div>

      <main className="px-6 flex flex-col items-center w-full">
        {/* Title & Province */}
        <div className="w-full flex flex-col items-center justify-center text-center mb-8 px-2 mt-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg text-center tracking-tight leading-tight">
            {data.name}
          </h2>
          <p className="text-white/75 font-medium mt-1 drop-shadow text-center text-sm sm:text-base leading-snug">
            {data.province}
          </p>
        </div>

        {/* Glassmorphic AQI Ring with Threshold Colored Outer Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8 transition-all duration-500">
          {/* Outer Glassmorphic Ring with Subtle Color Accent */}
          <div 
            className={`absolute inset-0 backdrop-blur-2xl rounded-full border-[2.5px] transition-all duration-500 ${aqiTheme.outerGlass}`}
          />

          {/* Inner Frosted Glass Surface */}
          <div className={`absolute inset-3.5 bg-gradient-to-br ${aqiTheme.innerGlass} backdrop-blur-md rounded-full border shadow-inner flex items-center justify-center transition-all duration-500`} />

          {/* (i) Info Button on Top-Right of AQI Ring */}
          <button
            onClick={() => setShowAqiExplainer(true)}
            aria-label="AQI Information Guide"
            title={t('aqiGuideTitle') || "Understanding AQI"}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/40 hover:bg-white/70 active:scale-90 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] font-bold">info</span>
          </button>

          {/* Core Typography */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-black text-slate-500 tracking-widest uppercase">{t('aqiLabel')}</span>
            <span className={`text-7xl font-black ${aqiTheme.textColor} leading-none my-1 tracking-tighter drop-shadow-sm`}>
              {data.aqi}
            </span>
            <div className={`${aqiTheme.badgeBg} px-4 py-1 rounded-full shadow-sm mt-2 transition-all`}>
              <span className={`text-xs font-bold ${aqiTheme.badgeText}`}>{t(aqiTheme.labelKey)}</span>
            </div>
          </div>
        </div>

        {/* Optimal Outdoor Activity Planner Card */}
        <div className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-lg mb-8 text-white">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ccff00] text-xl">schedule</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {t('outdoorPlannerTitle')}
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/25 text-white/90">
              24h AI Outlook
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Best Window */}
            <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/35 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80] shrink-0" />
                  <span className="text-[11px] font-black text-emerald-300">
                    {t('bestWindowLabel')}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-white leading-tight block mb-1">
                  {bestWindow.timeStr}
                </span>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('cleanAirNote')}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-[9px] text-white/60 font-bold uppercase">{t('expectedAqi')}</span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-400/20">
                  {bestWindow.aqi}
                </span>
              </div>
            </div>

            {/* Peak Window */}
            <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-orange-400/35 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#fb923c] shadow-[0_0_6px_#fb923c] shrink-0" />
                  <span className="text-[11px] font-black text-orange-300">
                    {t('peakWindowLabel')}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-white leading-tight block mb-1">
                  {peakWindow.timeStr}
                </span>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('peakAirNote')}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-[9px] text-white/60 font-bold uppercase">{t('expectedAqi')}</span>
                <span className="text-xs font-black text-orange-300 bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-400/20">
                  {peakWindow.aqi}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inter-District Travel Health Advisory Card (Triggered on AQI > 50) */}
        {(aqiNum > 50 || peakWindow.aqi > 50) && (
          <div className="w-full max-w-md bg-rose-950/40 backdrop-blur-xl border border-rose-400/50 rounded-3xl p-4 shadow-lg mb-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0 mt-0.5 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">commute</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                    {t('travelAdvisoryTitle')}
                  </span>
                  <span className="text-[9px] font-extrabold bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/30">
                    50+ AQI
                  </span>
                </div>
                <p className="text-[11.5px] text-white/90 leading-snug font-medium">
                  {t('travelAdvisoryMsg')
                    ?.replace('{city}', typeof data.name === 'string' ? data.name : data.name[lang] || 'District')
                    ?.replace('{aqi}', String(Math.max(aqiNum, peakWindow.aqi)))
                    ?.replace('{status}', aqiNum > 50 ? t(aqiTheme.labelKey) : t('statusModerate'))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Microclimate Cards (Temp & Humidity) */}
        <div className="w-full flex gap-4 mb-4">
          <div className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-4 flex flex-col items-center shadow-lg">
            <span className="material-symbols-outlined text-white/70 mb-2">device_thermostat</span>
            <span className="text-xs font-bold text-white/60 mb-1">{t('temp')}</span>
            <span className="text-2xl font-bold text-white">{data.temp}</span>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-4 flex flex-col items-center shadow-lg">
            <span className="material-symbols-outlined text-white/70 mb-2">water_drop</span>
            <span className="text-xs font-bold text-white/60 mb-1">{t('humidity')}</span>
            <span className="text-2xl font-bold text-white">{data.humidity}</span>
          </div>
        </div>

        {/* Enhanced Wind Card with Direction Compass */}
        <div className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-4 flex items-center justify-between shadow-lg mb-6 text-white">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <span
                className="material-symbols-outlined text-2xl text-[#ccff00] transition-transform duration-700"
                style={{ transform: `rotate(${windBearing}deg)` }}
              >
                navigation
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white/80">{t('wind')}</span>
                <span className="text-[10.5px] font-extrabold text-[#ccff00] bg-black/25 px-2 py-0.5 rounded-md border border-white/10">
                  {windInfo.cardinal} ({windBearing}°)
                </span>
              </div>
              <span className="text-xs font-semibold text-white/85 block mt-0.5">
                {t(windInfo.noteKey)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{data.wind}</span>
            <span className="text-xs font-medium text-white/70 ml-1">{t('windUnit')}</span>
          </div>
        </div>

        {/* Chemical Breakdown */}
        <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white">science</span>
              <h3 className="text-xl font-bold text-white leading-tight">{t('chemBreakdown')}</h3>
            </div>
            <button
              onClick={() => setShowChemExplainer(true)}
              aria-label="Chemical Breakdown Guide"
              title={t('chemGuideTitle') || "Chemical Breakdown Guide"}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 active:scale-90 border border-white/25 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">info</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {[
              { label: 'PM2.5', data: data.pm25, unit: 'µg/m³', color: 'bg-[#ccff00]' },
              { label: 'NO2',   data: data.no2,  unit: 'ppb',    color: 'bg-[#ccff00]' },
              { label: 'O3',    data: data.o3,   unit: 'ppb',    color: 'bg-[#ccff00]' },
              { label: 'CO',    data: data.co,   unit: 'ppb',    color: 'bg-[#ccff00]' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-white/60">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.data.value} <span className="text-[8px] font-normal opacity-70">{item.unit}</span></span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: item.data.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AQI Explainer Card (Clickable to open detailed popup guide) */}
        <button
          onClick={() => setShowAqiExplainer(true)}
          className="w-full text-left bg-black/40 hover:bg-black/50 active:scale-[0.99] backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/15 shadow-sm flex items-start gap-4 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#ccff00] text-3xl mt-1 shrink-0">info</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-bold">{t('aqiExplainerTitle')}</h4>
              <span className="text-[10px] font-bold text-white/80 bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>{t('tapToLearn') || 'Tap to learn'}</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              </span>
            </div>
            <p className="text-white/70 text-[11px] leading-relaxed">
              {t('aqiExplainerDesc')}
            </p>
          </div>
        </button>

        {/* Trust / Transparency Footer */}
        <div className="w-full flex flex-col items-center gap-1.5 mb-8">
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title="Live data pulled from Open-Meteo">
            <span className="material-symbols-outlined text-white text-[11px]">database</span>
            <span className="text-[9px] font-bold text-white uppercase tracking-widest">{t('dataSource')}: Open-Meteo API</span>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <span className="material-symbols-outlined text-white text-[11px]">schedule</span>
            {typeof data.lastUpdated === 'object' ? (
                <div className="flex flex-col text-right pr-2 border-r border-white/20 mr-2">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">{t('apiUpdated')}: {new Date(data.lastUpdated.openMeteo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">{t('modelUpdated')}: {new Date(data.lastUpdated.modelServer).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ) : (
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                  {t('lastUpdated')}: {data.lastUpdated && data.lastUpdated !== '--' ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Loading...'}
                </span>
              )}
          </div>
        </div>

      </main>

      {/* Detailed AQI Explainer Modal */}
      <AqiExplainerModal
        isOpen={showAqiExplainer}
        onClose={() => setShowAqiExplainer(false)}
      />

      {/* Detailed Chemical Pollutants Explainer Modal */}
      <ChemicalExplainerModal
        isOpen={showChemExplainer}
        onClose={() => setShowChemExplainer(false)}
      />
    </div>
  )
}

export default React.memo(HomeScreen);
