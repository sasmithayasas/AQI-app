import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function DailySummaryModal({ isOpen, onClose, data, onNavigateToTrends }) {
  const { t, lang } = useLanguage()
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(null)

  if (!isOpen || !data) return null

  // Safely extract string properties (prevent "Objects are not valid as a React child" errors)
  const cityName =
    typeof data.name === 'object'
      ? data.name[lang] || data.name['en'] || Object.values(data.name)[0] || 'District'
      : data.name || 'District'

  const provinceName =
    typeof data.province === 'object'
      ? data.province[lang] || data.province['en'] || Object.values(data.province)[0] || ''
      : data.province || ''

  const statusText =
    typeof data.status === 'object'
      ? data.status[lang] || data.status['en'] || 'Good'
      : data.status || 'Good'

  const aqiValue = data.aqi ?? '--'
  const isGood = statusText === 'Good' || String(statusText).toLowerCase().includes('good')

  // Safely compute forecasts highlights
  const forecasts = Array.isArray(data.forecasts) ? data.forecasts : []
  let peakAqi = 45
  let peakTime = t('tomorrowAt') || 'Tomorrow 2:00 PM'
  let lowestAqi = 28
  let lowestTime = t('tonightAt') || 'Tonight 4:00 AM'

  if (forecasts.length > 0) {
    const futureForecasts = forecasts.filter((f) => f && (f.horizon > 0 || f.time))
    if (futureForecasts.length > 0) {
      try {
        const maxF = futureForecasts.reduce((prev, curr) =>
          Number(curr?.aqi || 0) > Number(prev?.aqi || 0) ? curr : prev
        )
        const minF = futureForecasts.reduce((prev, curr) =>
          Number(curr?.aqi || 0) < Number(prev?.aqi || 0) ? curr : prev
        )

        if (maxF && maxF.aqi !== undefined) peakAqi = maxF.aqi
        if (minF && minF.aqi !== undefined) lowestAqi = minF.aqi

        const formatTime = (timeStr) => {
          if (!timeStr) return ''
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

        if (maxF?.time) peakTime = formatTime(maxF.time)
        if (minF?.time) lowestTime = formatTime(minF.time)
      } catch (err) {
        console.debug('Forecast reduction error handled:', err)
      }
    }
  }

  // Safe locale date string formatting
  let todayDateStr = ''
  try {
    const localeTag = lang === 'si' ? 'si' : lang === 'ta' ? 'ta' : 'en-US'
    todayDateStr = new Date().toLocaleDateString(localeTag, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  } catch (_) {
    todayDateStr = new Date().toDateString()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { download48hPdfReport } = await import('../utils/pdfReportGenerator')
      const res = await download48hPdfReport(data)
      if (res.success) {
        setDownloadSuccess(res.savedPath || res.fileName)
        setTimeout(() => setDownloadSuccess(null), 6000)
      }
    } catch (e) {
      console.error('Failed to export 48h PDF report:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.25s_ease-out]">
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-[#e3f4f8] via-[#f7fbfa] to-[#f4f7f5] rounded-3xl p-6 shadow-2xl border border-white/80 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          fontFamily:
            lang === 'si'
              ? "'Noto Sans Sinhala', sans-serif"
              : lang === 'ta'
              ? "'Noto Sans Tamil', sans-serif"
              : "'Fira Sans', sans-serif",
        }}
      >
        {/* Decorative Sunrise Orb */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-[#ffd54f]/30 to-[#00658d]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffb74d] to-[#ff9800] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="material-symbols-outlined text-[22px]">wb_sunny</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00658d] uppercase tracking-wider block">
                {todayDateStr}
              </span>
              <h2 className="text-lg font-extrabold text-[#003e58] leading-tight">
                {t('morningBriefing')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-[#003e58] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* District Banner */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 mb-4 border border-black/5 shadow-sm">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-extrabold text-[#003e58]">{cityName}</span>
            <span className="text-[11px] font-medium text-[#6e7881]">{provinceName}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#003e58] leading-none">{aqiValue}</span>
              <span className="text-xs font-bold text-[#6e7881]">{t('aqiLabel')}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isGood ? 'bg-[#ccff88] text-[#2a4511]' : 'bg-[#ffd54f] text-[#5a3a00]'
              }`}
            >
              {statusText}
            </div>
          </div>
        </div>

        {/* Expected Peak & Cleanest Windows */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#fcede7] rounded-2xl p-3.5 border border-[#ba1a1a]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">
                trending_up
              </span>
              <span className="text-[10px] font-bold text-[#ba1a1a] uppercase">
                {t('peakPollution')}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-[#ba1a1a] leading-none mb-1">
              {peakAqi}
            </span>
            <span className="text-[10px] font-semibold text-[#3e4850]">{peakTime}</span>
          </div>

          <div className="bg-[#e8f5d0] rounded-2xl p-3.5 border border-[#457000]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-[#457000] text-[16px]">
                trending_down
              </span>
              <span className="text-[10px] font-bold text-[#457000] uppercase">
                {t('cleanestAir')}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-[#457000] leading-none mb-1">
              {lowestAqi}
            </span>
            <span className="text-[10px] font-semibold text-[#3e4850]">{lowestTime}</span>
          </div>
        </div>

        {/* Microclimate Quick Row */}
        <div className="flex justify-around bg-white/70 rounded-2xl py-2.5 px-2 mb-4 border border-black/5 shadow-sm text-center">
          <div>
            <span className="text-[9px] font-bold text-[#6e7881] block">{t('temp')}</span>
            <span className="text-xs font-bold text-[#003e58]">{data.temp || '--'}</span>
          </div>
          <div className="border-r border-black/5" />
          <div>
            <span className="text-[9px] font-bold text-[#6e7881] block">{t('humidity')}</span>
            <span className="text-xs font-bold text-[#003e58]">{data.humidity || '--'}</span>
          </div>
          <div className="border-r border-black/5" />
          <div>
            <span className="text-[9px] font-bold text-[#6e7881] block">{t('wind')}</span>
            <span className="text-xs font-bold text-[#003e58]">
              {data.wind || '--'} {t('windUnit')}
            </span>
          </div>
        </div>

        {/* Daily Health Advice */}
        <div className="bg-white/90 rounded-2xl p-4 mb-4 border border-black/5 shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#e5f0f3] flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[#00658d] text-[18px]">
              {isGood ? 'nature_people' : 'masks'}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-[#003e58] block mb-0.5">
              {t('dailyAdviceTitle')}
            </span>
            <p className="text-[11px] text-[#3e4850] leading-relaxed">
              {isGood
                ? t('adviceGood') || 'Great air quality — safe for general outdoor activities and opening windows.'
                : t('adviceMask') + '. Sensitive individuals should limit prolonged outdoor exposure.'}
            </p>
          </div>
        </div>

        {/* Download confirmation toast */}
        {downloadSuccess && (
          <div className="mb-4 p-3 bg-[#457000]/15 border border-[#457000]/30 rounded-2xl flex flex-col gap-1 text-[#2a4511] text-xs font-bold animate-[fadeIn_0.25s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>{t('pdfReportDownloaded')}</span>
            </div>
            <span className="text-[10px] font-medium text-[#457000] ml-6 opacity-90 break-all">
              Saved to: {downloadSuccess}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 relative z-10">
          {/* Download Past 24h & Next 24h PDF Report Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] border border-[#004c6b]/30 text-[#004c6b] font-bold py-2.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
              {downloading ? 'hourglass_top' : 'picture_as_pdf'}
            </span>
            {downloading ? 'Generating PDF Report...' : t('download48hPdfReport')}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              if (onNavigateToTrends) onNavigateToTrends()
            }}
            className="w-full bg-gradient-to-r from-[#004c6b] to-[#00658d] hover:from-[#003e58] hover:to-[#004c6b] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-2xl shadow-lg shadow-[#004c6b]/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">show_chart</span>
            {t('exploreTrends')}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs font-bold text-[#6e7881] hover:text-[#003e58] transition-colors cursor-pointer"
          >
            {t('dismissModal')}
          </button>
        </div>
      </div>
    </div>
  )
}
