import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  sendAQIThresholdAlert,
  requestNotificationPermission,
  scheduleDailySummaryNotification,
  sendSampleDailySummaryNotification,
  cancelDailySummaryNotification,
} from '../utils/notifications'

// Individual Swipeable Alert Card Component
const SwipeableAlertCard = ({ alert, onDismiss, t }) => {
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)

  const handleTouchStart = (e) => {
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    currentXRef.current = e.touches[0].clientX
    const diff = currentXRef.current - startXRef.current
    setOffsetX(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = currentXRef.current - startXRef.current

    if (Math.abs(diff) > 85) {
      setIsDismissing(true)
      setOffsetX(diff < 0 ? -400 : 400)
      setTimeout(() => {
        onDismiss(alert.id)
      }, 240)
    } else {
      setOffsetX(0)
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    currentXRef.current = e.clientX
    const diff = currentXRef.current - startXRef.current
    setOffsetX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = currentXRef.current - startXRef.current

    if (Math.abs(diff) > 85) {
      setIsDismissing(true)
      setOffsetX(diff < 0 ? -400 : 400)
      setTimeout(() => {
        onDismiss(alert.id)
      }, 240)
    } else {
      setOffsetX(0)
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        isDismissing ? 'max-h-0 opacity-0 mb-0 py-0 scale-95' : 'max-h-32 mb-3'
      }`}
    >
      {/* Red Background Revealed on Swipe */}
      <div className="absolute inset-0 bg-[#ba1a1a] rounded-xl flex items-center justify-between px-5 text-white font-bold text-xs shadow-inner">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">delete</span>
          <span>Dismiss</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Dismiss</span>
          <span className="material-symbols-outlined text-lg">delete</span>
        </div>
      </div>

      {/* Main Alert Card Foreground */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.25s ease',
          opacity: 1 - Math.min(Math.abs(offsetX) / 300, 0.6),
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
        }}
        className="bg-white rounded-xl shadow-sm border border-black/5 flex relative select-none"
      >
        <div className="w-1.5 absolute left-0 top-0 bottom-0" style={{ backgroundColor: alert.color }} />
        <div className="pl-5 pr-4 py-4 flex gap-4 w-full items-start">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: alert.bg }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ color: alert.color }}>
              {alert.icon}
            </span>
          </div>
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold" style={{ color: alert.color }}>
                {t(alert.titleKey) || alert.titleKey}
              </span>
              <span className="text-[10px] font-bold text-[#6e7881]">{alert.time}</span>
            </div>
            <p className="text-xs text-[#1a1c1c] leading-relaxed">{alert.msg}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SettingsScreen = ({ settings, onSettingsChange, data, onOpenDailySummary }) => {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const [alertsList, setAlertsList] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinelaq_alerts_list')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.debug('Failed to parse alertsList from storage:', e)
    }
    return []
  })
  const [alertStatusMessage, setAlertStatusMessage] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('sentinelaq_alerts_list', JSON.stringify(alertsList))
    } catch (e) {
      console.debug('Failed to save alertsList to storage:', e)
    }
  }, [alertsList])

  const currentAqi = data && !isNaN(Number(data.aqi)) ? Number(data.aqi) : null
  const cityName = data?.name || 'Active City'
  const statusText = data?.status || 'Active'

  const toggleSetting = async (key) => {
    const nextVal = !settings[key]
    onSettingsChange((prev) => ({ ...prev, [key]: nextVal }))

    if (key === 'pushNotifications' && nextVal) {
      const granted = await requestNotificationPermission()
      if (granted && currentAqi !== null && currentAqi > settings.threshold) {
        dispatchAlert(currentAqi, settings.threshold)
      }
    }

    if (key === 'dailySummary') {
      if (nextVal) {
        const granted = await requestNotificationPermission()
        if (granted) {
          await scheduleDailySummaryNotification({
            cityName,
            aqi: currentAqi || 'Normal',
            hour: 7,
            minute: 0,
            lang,
          })
          setAlertStatusMessage(t('dailySummaryScheduled'))
          setTimeout(() => setAlertStatusMessage(null), 3500)
        }
      } else {
        await cancelDailySummaryNotification()
        setAlertStatusMessage(t('dailySummaryCancelled'))
        setTimeout(() => setAlertStatusMessage(null), 3500)
      }
    }
  }

  // Keep daily summary forecast updated if settings.dailySummary is active and language changes
  useEffect(() => {
    if (settings.dailySummary && cityName) {
      scheduleDailySummaryNotification({
        cityName,
        aqi: currentAqi || 'Normal',
        hour: 7,
        minute: 0,
        lang,
      })
    }
  }, [settings.dailySummary, cityName, currentAqi, lang])

  const dispatchAlert = async (aqiVal, threshVal) => {
    const success = await sendAQIThresholdAlert({
      aqi: aqiVal,
      threshold: threshVal,
      cityName,
      statusText,
      force: false,
      lang,
    })

    if (success) {
      setAlertStatusMessage(`${t('alertTriggered')}: AQI ${aqiVal} > ${threshVal}`)
      setTimeout(() => setAlertStatusMessage(null), 4000)

      // Add to recent alerts log
      setAlertsList((prev) => [
        {
          id: Date.now(),
          type: 'warning',
          titleKey: 'alertWarning',
          time: t('justNow'),
          msg: `AQI in ${cityName} reached ${aqiVal}, surpassing your limit of ${threshVal}.`,
          color: '#ba1a1a',
          bg: '#fcede7',
          icon: 'warning',
        },
        ...prev,
      ])
    }
  }

  // Smooth slider movement without triggering alert on every drag event
  const handleSliderChange = (e) => {
    const newThreshold = Number(e.target.value)
    onSettingsChange((prev) => ({ ...prev, threshold: newThreshold }))
  }

  // Only check and alert when user releases the slider
  const handleSliderCommit = () => {
    if (settings.pushNotifications && currentAqi !== null && currentAqi > settings.threshold) {
      dispatchAlert(currentAqi, settings.threshold)
    }
  }

  const handleTestDailySummary = async () => {
    const success = await sendSampleDailySummaryNotification({
      cityName,
      aqi: currentAqi || 'Normal',
      delaySeconds: 5,
      lang,
    })
    if (success) {
      setAlertStatusMessage(t('testDailySummaryScheduled'))
      setTimeout(() => setAlertStatusMessage(null), 4000)
    }
  }

  const [downloadingReport, setDownloadingReport] = useState(false)
  const [reportSuccessMsg, setReportSuccessMsg] = useState(null)

  const handleDownloadReportDirect = async () => {
    if (!data) return
    setDownloadingReport(true)
    try {
      const { download48hPdfReport } = await import('../utils/pdfReportGenerator')
      const res = await download48hPdfReport(data)
      if (res?.success) {
        setReportSuccessMsg(t('report48hDownloaded') || '48-Hour Report PDF saved to Documents!')
        setTimeout(() => setReportSuccessMsg(null), 6000)
      }
    } catch (err) {
      console.error('Direct PDF export error:', err)
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleDismissAlert = (id) => {
    setAlertsList((prev) => prev.filter((item) => item.id !== id))
  }

  const isExceeded = currentAqi !== null && currentAqi > settings.threshold

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full flex items-center p-0.5 relative mt-2 shrink-0 transition-colors ${
        on ? 'bg-[#004c6b] justify-end' : 'bg-[#d0d3d4] justify-start'
      }`}
    >
      {on ? (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[#004c6b] text-[12px]">check</span>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-[#6e7881] border-2 border-[#d0d3d4] shadow-sm" />
      )}
    </button>
  )

  const districtName =
    typeof data?.name === 'string'
      ? data.name
      : typeof data?.name === 'object'
      ? data.name[lang] || data.name['en'] || (data.id === 'colombo' ? 'Colombo District' : 'Kandy District')
      : data.id === 'colombo'
      ? 'Colombo District'
      : 'Kandy District'

  return (
    <div className="min-h-screen relative pb-8 bg-gradient-to-b from-white to-[#f7f9f9]">
      <header className="flex justify-between items-center p-6 text-[#003e58] border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={cycleLang}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[#003e58]"
        >
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find((l) => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('settingsTitle')}</h1>
        <div className="flex items-center gap-1 text-[#003e58] select-none" title={`Active District: ${districtName}`}>
          <span className="material-symbols-outlined text-[17px] text-[#00658d]">location_on</span>
          <span className="text-xs font-semibold text-[#003e58] tracking-tight">{districtName}</span>
        </div>
      </header>

      <main className="px-6 flex flex-col pt-6">
        <h2 className="text-xl font-bold text-[#00658d] mb-4">{t('notifPrefs')}</h2>

        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-8">
          {/* Push Notifications */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e5f0f3] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#00658d] text-[20px]">notifications_active</span>
              </div>
              <div className="flex flex-col pr-4">
                <span className="text-[15px] font-bold text-[#1a1c1c] leading-snug">{t('enablePush')}</span>
                <span className="text-xs text-[#3e4850] mt-1 leading-snug">{t('enablePushDesc')}</span>
              </div>
            </div>
            <Toggle on={settings.pushNotifications} onToggle={() => toggleSetting('pushNotifications')} />
          </div>

          {/* Daily Summary */}
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#e5f0f3] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#00658d] text-[20px]">light_mode</span>
                </div>
                <div className="flex flex-col pr-4">
                  <span className="text-[15px] font-bold text-[#1a1c1c] leading-snug">{t('dailySummary')}</span>
                  <span className="text-xs text-[#3e4850] mt-1 leading-snug">{t('dailySummaryDesc')}</span>
                </div>
              </div>
              <Toggle on={settings.dailySummary} onToggle={() => toggleSetting('dailySummary')} />
            </div>
            {settings.dailySummary && (
              <div className="mt-2.5 ml-14 flex items-center gap-2">
                <button
                  onClick={handleTestDailySummary}
                  className="text-[11px] font-bold text-[#004c6b] bg-[#e5f0f3] hover:bg-[#d0e5ec] active:scale-95 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">timer</span>
                  {t('testDailySummary')}
                </button>
                {onOpenDailySummary && (
                  <button
                    onClick={onOpenDailySummary}
                    className="text-[11px] font-bold text-[#004c6b] bg-white border border-[#004c6b]/20 hover:bg-[#f0f8fa] active:scale-95 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                    {t('viewSummary')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Spike Alerts */}
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#fcede7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
              </div>
              <div className="flex flex-col pr-4">
                <span className="text-[15px] font-bold text-[#1a1c1c] leading-snug">{t('spikeAlerts')}</span>
                <span className="text-xs text-[#3e4850] mt-1 leading-snug">{t('spikeAlertsDesc')}</span>
              </div>
            </div>
            <Toggle on={settings.spikeAlerts} onToggle={() => toggleSetting('spikeAlerts')} />
          </div>
        </div>

        {/* Environmental Forecast Reports Card */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00658d]">{t('reportSectionTitle')}</h2>
        </div>

        <div className="w-full bg-gradient-to-br from-[#004c6b] to-[#002b3d] rounded-3xl p-6 shadow-md text-white relative overflow-hidden mb-8 border border-white/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-sm">
              <span className="material-symbols-outlined text-white text-2xl">picture_as_pdf</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-white leading-tight">
                {t('download48hReport')}
              </h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                {t('downloadReportDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadReportDirect}
            disabled={downloadingReport || !data}
            className="w-full py-3.5 px-4 bg-white text-[#003e58] hover:bg-[#f0f8fa] active:scale-[0.98] rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 relative z-10 disabled:opacity-60"
          >
            {downloadingReport ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin text-[#004c6b]">sync</span>
                <span>{t('generatingPdf')}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg text-[#004c6b]">download</span>
                <span>{t('downloadReportBtn')}</span>
              </>
            )}
          </button>

          {reportSuccessMsg && (
            <div className="mt-3 p-3 bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 rounded-xl text-xs font-bold text-center animate-[fadeIn_0.3s_ease-out] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-300">check_circle</span>
              <span>{reportSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* AQI Threshold */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#00658d]">{t('aqiThreshold')}</h2>
            {currentAqi !== null && (
              <span className="text-xs font-semibold text-[#6e7881]">
                {cityName} Real AQI: <span className="font-bold text-[#003e58]">{currentAqi}</span>
              </span>
            )}
          </div>
          <span className="text-3xl font-extrabold text-[#003e58]">{settings.threshold}</span>
        </div>

        <div className="w-full bg-[#fbf6f5] rounded-3xl p-6 shadow-sm mb-8 border border-black/5">
          <p className="text-[#3e4850] text-sm mb-6">{t('thresholdDesc')}</p>

          {/* Real-time Threshold Status Indicator */}
          {currentAqi !== null && (
            <div
              className={`mb-6 p-3 rounded-2xl flex items-center justify-between border transition-all ${
                isExceeded
                  ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]'
                  : 'bg-[#457000]/10 border-[#457000]/30 text-[#457000]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  {isExceeded ? 'warning' : 'check_circle'}
                </span>
                <span className="text-xs font-bold leading-tight">
                  {isExceeded
                    ? `Real AQI (${currentAqi}) exceeds limit (${settings.threshold})`
                    : `Real AQI (${currentAqi}) is within safe limit`}
                </span>
              </div>
              {isExceeded && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full animate-pulse">
                  Alert Active
                </span>
              )}
            </div>
          )}

          {/* Slider */}
          <div className="relative w-full h-2 bg-[#d0d3d4] rounded-full mb-3">
            <div
              className={`absolute left-0 top-0 h-full rounded-l-full transition-all duration-150 ${
                isExceeded ? 'bg-[#ba1a1a]' : 'bg-[#004c6b]'
              }`}
              style={{ width: `${(settings.threshold / 300) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={settings.threshold}
              onChange={handleSliderChange}
              onPointerUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              onMouseUp={handleSliderCommit}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-0 cursor-pointer z-10 h-6"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[3px] border-[#004c6b] rounded-full shadow-md pointer-events-none transition-all duration-150"
              style={{ left: `calc(${(settings.threshold / 300) * 100}% - 12px)` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-bold text-[#6e7881] mt-4">
            <span>{t('thresholdGood')}</span>
            <span>{t('thresholdUnhealthy')}</span>
            <span>{t('thresholdHazardous')}</span>
          </div>

          {alertStatusMessage && (
            <div className="mt-4 p-2 bg-[#004c6b] text-white rounded-xl text-xs font-bold text-center animate-[fadeIn_0.3s_ease-out]">
              {alertStatusMessage}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00658d]">{t('recentAlerts')}</h2>
          {alertsList.length > 0 && (
            <span className="text-[11px] font-semibold text-[#6e7881] bg-black/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">swipe</span>
              {t('swipeToClear')}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {alertsList.length > 0 ? (
            alertsList.map((alert) => (
              <SwipeableAlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
                t={t}
              />
            ))
          ) : (
            <div className="bg-white/60 border border-black/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s_ease-out]">
              <div className="w-12 h-12 rounded-full bg-[#e8f5d0] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl text-[#457000]">done_all</span>
              </div>
              <span className="text-sm font-bold text-[#003e58]">{t('noAlerts')}</span>
              <span className="text-xs text-[#6e7881] mt-1">{t('allClear')}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default React.memo(SettingsScreen)
