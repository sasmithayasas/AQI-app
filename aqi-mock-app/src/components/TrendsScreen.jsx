import React, { useState, useMemo, useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import TrendsExplainerModal from './TrendsExplainerModal'

const HISTORY_OPTIONS = ['hourly', 'weekly', 'monthly']

const TrendsScreen = ({ data, onToggleCity }) => {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const [historyIndex, setHistoryIndex] = useState(0) // 0: 'hourly', 1: 'weekly', 2: 'monthly'
  const [showTrendsExplainer, setShowTrendsExplainer] = useState(false)
  const [hoverPoint, setHoverPoint] = useState(null)
  const historyTab = HISTORY_OPTIONS[historyIndex]

  const forecasts = data.forecasts || []

  // 1. Memoized Peak and Lowest Forecast calculations
  const { peakAqi, peakTime, lowestAqi, lowestTime } = useMemo(() => {
    let pAqi = 45, pTime = t('tomorrowAt')
    let lAqi = 28, lTime = t('tonightAt')

    if (forecasts.length > 0) {
      const futureForecasts = forecasts.filter((f) => f && f.horizon > 0)
      if (futureForecasts.length > 0) {
        const maxF = futureForecasts.reduce((prev, curr) => (curr.aqi > prev.aqi ? curr : prev))
        const minF = futureForecasts.reduce((prev, curr) => (curr.aqi < prev.aqi ? curr : prev))
        pAqi = maxF.aqi
        lAqi = minF.aqi

        const formatTime = (timeStr) => {
          try {
            const d = new Date(timeStr)
            if (isNaN(d.getTime())) return String(timeStr)
            return (
              d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
              ' ' +
              d.toLocaleDateString([], { weekday: 'short' })
            )
          } catch (_) {
            return String(timeStr)
          }
        }

        pTime = formatTime(maxF.time)
        lTime = formatTime(minF.time)
      }
    }
    return { peakAqi: pAqi, peakTime: pTime, lowestAqi: lAqi, lowestTime: lTime }
  }, [forecasts, t])

  // 2. Memoized 24-Hour Horizon SVG Paths & Metrics
  const chartData = useMemo(() => {
    const pastData = (data.past48h || data.past24h || []).slice(-24)
    const allAqis = [...pastData.map((d) => d.aqi), ...forecasts.map((d) => d.aqi)]
    const maxAqi = Math.max(50, ...allAqis)
    const getY = (aqi) => 100 - Math.min(100, (aqi / maxAqi) * 100)

    const pastPoints = pastData.map((d, i) => {
      const x = (i / Math.max(1, pastData.length - 1)) * 50
      return `${x},${getY(d.aqi)}`
    })
    const pastPath = pastPoints.length ? `M${pastPoints.join(' L')}` : ''
    const pastFillPath = pastPoints.length ? `${pastPath} L50,100 L0,100 Z` : ''

    const futurePoints = forecasts.map((d) => {
      const horizon = Math.min(24, d.horizon || 1)
      const x = 50 + (horizon / 24) * 50
      return `${x},${getY(d.aqi)}`
    })
    const futurePath = futurePoints.length ? `M${futurePoints.join(' L')}` : ''
    const futureFillPath = futurePoints.length ? `${futurePath} L100,100 L50,100 Z` : ''

    // Uncertainty Corridor (90% Confidence bounds)
    const futureUpperPoints = forecasts.map((d) => {
      const horizon = Math.min(24, d.horizon || 1)
      const x = 50 + (horizon / 24) * 50
      const sigma = 2.0 + 0.35 * horizon
      const upperAqi = Math.min(maxAqi * 1.05, d.aqi + sigma)
      return `${x},${getY(upperAqi)}`
    })
    const futureLowerPoints = forecasts.map((d) => {
      const horizon = Math.min(24, d.horizon || 1)
      const x = 50 + (horizon / 24) * 50
      const sigma = 2.0 + 0.35 * horizon
      const lowerAqi = Math.max(5, d.aqi - sigma)
      return `${x},${getY(lowerAqi)}`
    })
    const corridorPath =
      futureUpperPoints.length && futureLowerPoints.length
        ? `M${futureUpperPoints.join(' L')} L${[...futureLowerPoints].reverse().join(' L')} Z`
        : ''

    return {
      pastData,
      maxAqi,
      pastPath,
      pastFillPath,
      futurePath,
      futureFillPath,
      corridorPath,
    }
  }, [data.past48h, data.past24h, forecasts])

  // 3. Memoized Historical Analysis SVG Paths
  const historicalData = useMemo(() => {
    let histData = []
    let strokeColor = '#004c6b'

    if (historyTab === 'hourly') {
      const pastHourly = (data.past48h || data.past24h || []).slice(-24)
      histData = pastHourly.map((d) => Number(d.aqi || 0))
      if (histData.length === 0) {
        histData = [55, 57, 60, 66, 67, 67, 65, 63, 59, 57, 54, 53, 59, 61, 63, 62, 62, 62, 62, 62, 63, 62, 62, 62]
      }
      strokeColor = '#004c6b'
    } else if (historyTab === 'weekly') {
      histData = data.historical?.weekly || [71, 73, 74, 73, 71, 70, 70]
      strokeColor = '#29718d'
    } else {
      histData =
        data.historical?.monthly || [
          68, 70, 68, 70, 70, 72, 72, 75, 77, 75, 72, 72, 73, 70, 73, 75, 77, 71, 68, 72, 72, 70,
          69, 71, 73, 70, 72, 72, 74, 71, 70,
        ]
      strokeColor = '#db951f'
    }

    const maxHist = Math.max(100, ...histData)
    const getYHist = (aqi) => 100 - Math.min(100, (aqi / maxHist) * 100)

    const histPoints = histData.map((val, i) => {
      const x = (i / Math.max(1, histData.length - 1)) * 100
      return `${x},${getYHist(val)}`
    })
    const histPath = histPoints.length ? `M${histPoints.join(' L')}` : ''
    const histFillPath = histPoints.length ? `${histPath} L100,100 L0,100 Z` : ''

    return {
      histData,
      strokeColor,
      maxHist,
      histPath,
      histFillPath,
    }
  }, [historyTab, data.past48h, data.past24h, data.historical])

  // 4. Optimized Scrubbing Handler
  const handleScrub = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

      if (relX <= 0.5) {
        const pastIdx = Math.round((relX / 0.5) * Math.max(0, chartData.pastData.length - 1))
        const pt = chartData.pastData[pastIdx]
        if (pt) {
          const d = new Date(pt.time)
          setHoverPoint({
            timeStr: isNaN(d.getTime())
              ? String(pt.time)
              : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            dateStr: isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { weekday: 'short' }),
            aqi: pt.aqi,
            pctX: relX * 100,
            isForecast: false,
          })
        }
      } else {
        const forecastIdx = Math.min(
          forecasts.length - 1,
          Math.round(((relX - 0.5) / 0.5) * (forecasts.length - 1))
        )
        const pt = forecasts[forecastIdx]
        if (pt) {
          const d = new Date(pt.time)
          setHoverPoint({
            timeStr: isNaN(d.getTime())
              ? pt.horizon
                ? `+${pt.horizon}h`
                : 'Tomorrow'
              : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            dateStr: isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { weekday: 'short' }),
            aqi: pt.aqi,
            pctX: relX * 100,
            isForecast: true,
          })
        }
      }
    },
    [chartData.pastData, forecasts]
  )

  const cityName =
    typeof data.name === 'string'
      ? data.name.split(' ')[0]
      : typeof data.name === 'object'
      ? (data.name[lang] || data.name['en'] || 'City').split(' ')[0]
      : 'City'

  return (
    <div className="min-h-screen relative pb-8 bg-gradient-to-b from-[#e3f4f8] to-[#f9ede1]">
      <div className="fixed inset-0 -z-10 bg-white/40 backdrop-blur-[2px]" />

      <header className="flex justify-between items-center p-6 text-[#002b49]">
        <button
          onClick={cycleLang}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[#002b49]"
        >
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find((l) => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
        <button
          onClick={onToggleCity}
          className="flex items-center gap-1 bg-[#004c6b]/10 px-3 py-1.5 rounded-full hover:bg-[#004c6b]/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span className="text-xs font-bold text-[#003e58]">{cityName}</span>
        </button>
      </header>

      <main className="px-6 flex flex-col">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-[44px] leading-[1.1] font-extrabold text-[#003e58] mb-4 drop-shadow-sm tracking-tight">
              {t('trendsTitle')}
            </h2>
            <p className="text-[#3e5b6e] text-[15px] leading-snug max-w-[280px]">
              {t('trendsSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowTrendsExplainer(true)}
            aria-label="Trends Guide"
            title={t('trendsGuideTitle') || 'Understanding Forecasts & Trends'}
            className="w-9 h-9 rounded-full bg-[#004c6b]/10 hover:bg-[#004c6b]/20 active:scale-90 border border-[#004c6b]/20 flex items-center justify-center text-[#004c6b] transition-all cursor-pointer shadow-sm mt-2"
          >
            <span className="material-symbols-outlined text-[19px] font-bold">info</span>
          </button>
        </div>

        {/* Expected Peak */}
        <div className="w-full bg-[#f4f7f8] border border-white/60 rounded-3xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#ffd8ce] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ba1a1a]">trending_up</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#3e4850] uppercase tracking-widest block mb-1">
                {t('expectedPeak')}
              </span>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-[#ba1a1a]">{peakAqi}</span>
                <span className="text-sm font-bold text-[#3e4850]">{t('aqiLabel')}</span>
              </div>
              <span className="text-sm font-bold text-[#003e58]">{peakTime}</span>
            </div>
          </div>
        </div>

        {/* Expected Lowest */}
        <div className="w-full bg-[#f4f7f5] border border-white/60 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#ccff88] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#457000]">trending_down</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#3e4850] uppercase tracking-widest block mb-1">
                {t('expectedLowest')}
              </span>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-[#457000]">{lowestAqi}</span>
                <span className="text-sm font-bold text-[#3e4850]">{t('aqiLabel')}</span>
              </div>
              <span className="text-sm font-bold text-[#003e58]">{lowestTime}</span>
            </div>
          </div>
        </div>

        {/* AQI Trend Chart with Interactive Scrubbing & Uncertainty Corridor */}
        <div className="w-full bg-[#f0f4f3] border border-white/60 rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl leading-tight font-bold text-[#003e58]">{t('trendChartTitle')}</h3>
              <button
                onClick={() => setShowTrendsExplainer(true)}
                aria-label="Open Trends Guide"
                className="text-[#004c6b]/70 hover:text-[#004c6b] transition-colors"
              >
                <span className="material-symbols-outlined text-base font-bold">help</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-3.5 rounded-full bg-[#1b5e7d]" />
                <span className="text-[10px] font-bold text-[#1a1c1c]">{t('past24h') || t('past48h')}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#db951f]" />
                <span className="text-[10px] font-bold text-[#1a1c1c]">{t('forecast')}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-2 rounded bg-[#db951f]/20 border border-[#db951f]/40" />
                <span className="text-[9px] font-semibold text-[#52798e]">
                  {t('confidenceCorridor') || 'Prediction Range'}
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative w-full h-52 mt-4 select-none touch-pan-y cursor-crosshair"
            onMouseMove={handleScrub}
            onTouchMove={handleScrub}
            onClick={handleScrub}
            onMouseLeave={() => setHoverPoint(null)}
          >
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6 pointer-events-none">
              <div className="w-full border-t border-black/5" />
              <div className="w-full border-t border-black/5" />
              <div className="w-full border-t border-black/5" />
            </div>

            {/* Y-Axis Value Labels */}
            <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-bold text-[#3e4850] pt-0 pb-4 pointer-events-none">
              <span>{chartData.maxAqi}</span>
              <span>{Math.round(chartData.maxAqi / 2)}</span>
              <span>0</span>
            </div>

            {/* X-Axis Timeline Labels */}
            <div className="absolute bottom-0 w-full flex justify-between pl-6 pr-2 text-[10px] font-bold text-[#1a1c1c] pointer-events-none">
              <span className="opacity-70">-24h</span>
              <span className="opacity-70">-12h</span>
              <span className="text-[#004c6b] font-black">Now</span>
              <span className="opacity-70">+12h</span>
              <span className="opacity-70">+24h</span>
            </div>

            {/* Center 'Now' Line */}
            <div className="absolute top-2 bottom-6 left-1/2 border-l-2 border-dashed border-black/15 pointer-events-none" />

            {/* Interactive Tooltip Cursor */}
            {hoverPoint && (
              <>
                <div
                  className="absolute top-0 bottom-6 border-l-2 border-[#004c6b] z-20 pointer-events-none transition-all duration-75"
                  style={{ left: `${hoverPoint.pctX}%` }}
                />
                <div
                  className="absolute top-1 z-30 transform -translate-x-1/2 bg-[#003850] text-white px-3 py-1.5 rounded-xl shadow-xl border border-white/20 text-center pointer-events-none animate-[fadeIn_0.15s_ease-out]"
                  style={{ left: `${Math.max(18, Math.min(82, hoverPoint.pctX))}%` }}
                >
                  <div className="text-[9.5px] font-semibold text-sky-200 leading-tight">
                    {hoverPoint.timeStr} {hoverPoint.dateStr}
                  </div>
                  <div className="text-xs font-black text-white leading-tight mt-0.5 flex items-center justify-center gap-1.5">
                    <span>AQI {hoverPoint.aqi}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hoverPoint.aqi <= 50
                          ? 'bg-emerald-400'
                          : hoverPoint.aqi <= 100
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="text-[8.5px] text-white/70 block uppercase font-bold tracking-wider mt-0.5">
                    {hoverPoint.isForecast ? t('forecast') : t('past24h')}
                  </span>
                </div>
              </>
            )}

            {/* SVG Curve Canvas */}
            <svg
              className="absolute inset-0 w-full h-[calc(100%-24px)] pl-6 pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="pastGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1b5e7d" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1b5e7d" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="futureGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#db951f" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#db951f" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="corridorGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#db951f" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#db951f" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Uncertainty Corridor Ribbon */}
              {chartData.corridorPath && (
                <path
                  d={chartData.corridorPath}
                  fill="url(#corridorGradient)"
                  stroke="#db951f"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              )}

              {/* Past 24h Area & Curve */}
              {chartData.pastFillPath && <path d={chartData.pastFillPath} fill="url(#pastGradient)" />}
              {chartData.pastPath && (
                <path
                  d={chartData.pastPath}
                  fill="none"
                  stroke="#1b5e7d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Future 24h Area & Curve */}
              {chartData.futureFillPath && <path d={chartData.futureFillPath} fill="url(#futureGradient)" />}
              {chartData.futurePath && (
                <path
                  d={chartData.futurePath}
                  fill="none"
                  stroke="#db951f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Historical Analysis */}
        <div className="mt-8 mb-6">
          <h2 className="text-2xl font-bold text-[#003e58] mb-2">{t('historicalTitle')}</h2>
          <p className="text-[#3e5b6e] text-sm mb-4 leading-snug">{t('historicalSubtitle')}</p>

          <div className="w-full bg-[#f4f7f5] border border-white/60 rounded-3xl p-6 shadow-sm">
            {/* Interactive Timeline Range Slider */}
            <div className="mb-6 px-1">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-[#6e7881] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#004c6b]">tune</span>
                  {t('timelineResolution') || 'Timeline Period'}
                </span>
                <span className="text-xs font-bold text-[#004c6b] bg-[#e8eceb] px-3 py-1 rounded-full shadow-inner">
                  {t(
                    historyTab === 'hourly'
                      ? 'tabHourly'
                      : historyTab === 'weekly'
                      ? 'tabWeekly'
                      : 'tabMonthly'
                  )}
                </span>
              </div>

              {/* Slider Track Control */}
              <div className="relative pt-1 pb-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={historyIndex}
                  onChange={(e) => setHistoryIndex(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#d8e2e4] rounded-lg appearance-none cursor-pointer accent-[#004c6b] focus:outline-none transition-all"
                  style={{
                    background: `linear-gradient(to right, #004c6b 0%, #004c6b ${
                      (historyIndex / 2) * 100
                    }%, #d8e2e4 ${(historyIndex / 2) * 100}%, #d8e2e4 100%)`,
                  }}
                />

                {/* Slider Step Labels */}
                <div className="w-full flex justify-between mt-2.5 px-0.5">
                  {[
                    { idx: 0, key: 'hourly', label: t('tabHourly') || 'Hourly' },
                    { idx: 1, key: 'weekly', label: t('tabWeekly') || 'Weekly' },
                    { idx: 2, key: 'monthly', label: t('tabMonthly') || 'Monthly' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setHistoryIndex(item.idx)}
                      className={`text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                        historyIndex === item.idx
                          ? 'text-[#004c6b] scale-105'
                          : 'text-[#6e7881] hover:text-[#004c6b]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          historyIndex === item.idx ? 'bg-[#004c6b]' : 'bg-transparent'
                        }`}
                      />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative w-full h-40">
              <div className="absolute inset-0 flex flex-col justify-between pt-1 pb-5">
                <div className="w-full border-t border-black/5" />
                <div className="w-full border-t border-black/5" />
                <div className="w-full border-t border-black/5" />
                <div className="w-full border-t border-black/5" />
              </div>
              <div className="absolute left-0 h-full flex flex-col justify-between text-[9px] font-bold text-[#6e7881] pt-0 pb-4">
                <span>{historicalData.maxHist}</span>
                <span>{Math.round((historicalData.maxHist / 3) * 2)}</span>
                <span>{Math.round(historicalData.maxHist / 3)}</span>
                <span>0</span>
              </div>
              <div className="absolute bottom-0 w-full flex justify-between pl-6 pr-1 text-[9px] font-bold text-[#3e4850]">
                {historyTab === 'hourly' && (
                  <>
                    <span>-24h</span>
                    <span>-18h</span>
                    <span>-12h</span>
                    <span>-6h</span>
                    <span>Now</span>
                  </>
                )}
                {historyTab === 'weekly' && (
                  <>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </>
                )}
                {historyTab === 'monthly' && (
                  <>
                    <span>1</span>
                    <span>7</span>
                    <span>14</span>
                    <span>21</span>
                    <span>28</span>
                  </>
                )}
              </div>

              <svg
                className="absolute inset-0 w-full h-[calc(100%-20px)] pl-6"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="histGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={historicalData.strokeColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={historicalData.strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {historicalData.histFillPath && (
                  <path d={historicalData.histFillPath} fill="url(#histGradient)" />
                )}
                {historicalData.histPath && (
                  <path
                    d={historicalData.histPath}
                    fill="none"
                    stroke={historicalData.strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>

            {/* Context Insight */}
            <div className="mt-4 flex gap-3 items-start bg-white/50 rounded-xl p-3 border border-black/5">
              <span className="material-symbols-outlined text-[#db951f] text-lg">tips_and_updates</span>
              <p className="text-xs text-[#1a1c1c] leading-relaxed">
                {historyTab === 'hourly'
                  ? 'Past 24-hour log highlights nocturnal clean air windows and rush hour boundary layer accumulation.'
                  : historyTab === 'weekly'
                  ? 'Weekly patterns show lower pollution during weekends with peaks during midweek commuter traffic.'
                  : 'Monthly tracking shows seasonal baseline stability with periodic spikes during dry wind episodes.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Forecast & Trends Explainer Modal */}
      <TrendsExplainerModal
        isOpen={showTrendsExplainer}
        onClose={() => setShowTrendsExplainer(false)}
      />
    </div>
  )
}

export default React.memo(TrendsScreen)
