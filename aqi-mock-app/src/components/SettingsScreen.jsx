import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function SettingsScreen({ settings, onSettingsChange }) {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()

  const toggleSetting = (key) => {
    onSettingsChange(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleGroup = (key) => {
    onSettingsChange(prev => ({
      ...prev,
      sensitiveGroups: { ...prev.sensitiveGroups, [key]: !prev.sensitiveGroups[key] }
    }))
  }

  const handleSliderChange = (e) => {
    onSettingsChange(prev => ({ ...prev, threshold: Number(e.target.value) }))
  }

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full flex items-center p-0.5 relative mt-2 shrink-0 transition-colors ${on ? 'bg-[#d0d3d4] justify-end' : 'bg-[#d0d3d4] justify-start'}`}
    >
      {on ? (
        <div className="w-5 h-5 rounded-full bg-[#0a58ca] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-[12px]">check</span>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-[#6e7881] border-2 border-[#d0d3d4] shadow-sm" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen relative pb-8 bg-gradient-to-b from-white to-[#f7f9f9]">
      <header className="flex justify-between items-center p-6 text-[#003e58] border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={cycleLang} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[#003e58]">
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find(l => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('settingsTitle')}</h1>
        <div className="w-6" />
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
          <div className="flex justify-between items-start mb-6">
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

        {/* AQI Threshold */}
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-[#00658d]">{t('aqiThreshold')}</h2>
          <span className="text-3xl font-extrabold text-[#003e58]">{settings.threshold}</span>
        </div>

        <div className="w-full bg-[#fbf6f5] rounded-3xl p-6 shadow-sm mb-8">
          <p className="text-[#3e4850] text-sm mb-8">{t('thresholdDesc')}</p>
          <div className="relative w-full h-1.5 bg-[#d0d3d4] rounded-full mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-[#c6cfd1] rounded-l-full transition-all duration-150"
              style={{ width: `${(settings.threshold / 300) * 100}%` }}
            />
            <input
              type="range" min="0" max="300" step="5"
              value={settings.threshold}
              onChange={handleSliderChange}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-[#d0d3d4] rounded-full shadow-sm pointer-events-none transition-all duration-150"
              style={{ left: `calc(${(settings.threshold / 300) * 100}% - 10px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#6e7881] mt-4">
            <span>{t('thresholdGood')}</span>
            <span>{t('thresholdUnhealthy')}</span>
            <span>{t('thresholdHazardous')}</span>
          </div>
        </div>

        {/* Sensitive Groups Profile */}
        <h2 className="text-xl font-bold text-[#00658d] mb-4 mt-2">{t('sensitiveGroupsTitle')}</h2>
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00658d]">pulmonology</span>
              <span className="text-[15px] font-bold text-[#1a1c1c]">{t('groupAsthma')}</span>
            </div>
            <Toggle on={settings.sensitiveGroups.asthma} onToggle={() => toggleGroup('asthma')} />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00658d]">child_care</span>
              <span className="text-[15px] font-bold text-[#1a1c1c]">{t('groupKids')}</span>
            </div>
            <Toggle on={settings.sensitiveGroups.kids} onToggle={() => toggleGroup('kids')} />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00658d]">elderly</span>
              <span className="text-[15px] font-bold text-[#1a1c1c]">{t('groupElderly')}</span>
            </div>
            <Toggle on={settings.sensitiveGroups.elderly} onToggle={() => toggleGroup('elderly')} />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00658d]">pregnant_woman</span>
              <span className="text-[15px] font-bold text-[#1a1c1c]">{t('groupPregnant')}</span>
            </div>
            <Toggle on={settings.sensitiveGroups.pregnant} onToggle={() => toggleGroup('pregnant')} />
          </div>
        </div>

        {/* Recent Alerts */}
        <h2 className="text-xl font-bold text-[#00658d] mb-4">{t('recentAlerts')}</h2>
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden flex relative">
            <div className="w-1.5 bg-[#ba1a1a] absolute left-0 top-0 bottom-0" />
            <div className="pl-5 pr-4 py-4 flex gap-4 w-full">
              <div className="w-10 h-10 rounded-full bg-[#fcede7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-[#ba1a1a]">{t('alertWarning')}</span>
                  <span className="text-[10px] font-bold text-[#6e7881]">2{t('hoursAgo')}</span>
                </div>
                <p className="text-xs text-[#1a1c1c] leading-relaxed">{t('alertMsg1')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden flex relative">
            <div className="w-1.5 bg-[#457000] absolute left-0 top-0 bottom-0" />
            <div className="pl-5 pr-4 py-4 flex gap-4 w-full">
              <div className="w-10 h-10 rounded-full bg-[#e8f5d0] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#457000] text-[20px]">info</span>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-[#457000]">{t('alertNotif')}</span>
                  <span className="text-[10px] font-bold text-[#6e7881]">5{t('hoursAgo')}</span>
                </div>
                <p className="text-xs text-[#1a1c1c] leading-relaxed">{t('alertMsg2')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
