import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function AqiExplainerModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage()

  if (!isOpen) return null

  const STAGES = [
    {
      range: '0 – 50',
      key: 'stageGood',
      nameEn: 'Good',
      color: '#16a34a',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      descKey: 'stageGoodDesc',
      actionKey: 'stageGoodAction',
      descDefault: 'Air quality is clean and poses little or no risk.',
      actionDefault: 'Ideal for walking, outdoor activities, and opening windows.',
    },
    {
      range: '51 – 100',
      key: 'stageModerate',
      nameEn: 'Moderate',
      color: '#ca8a04',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      descKey: 'stageModerateDesc',
      actionKey: 'stageModerateAction',
      descDefault: 'Acceptable air quality for most people.',
      actionDefault: 'Safe for general public. Unusually sensitive individuals should observe any minor symptoms.',
    },
    {
      range: '101 – 150',
      key: 'stageSensitive',
      nameEn: 'Unhealthy for Sensitive Groups',
      color: '#ea580c',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/30',
      text: 'text-orange-900',
      dot: 'bg-orange-500',
      descKey: 'stageSensitiveDesc',
      actionKey: 'stageSensitiveAction',
      descDefault: 'Children, elderly, pregnant women, and asthmatics are at risk.',
      actionDefault: 'Wear a mask outdoors. Sensitive groups should reduce strenuous outdoor activities.',
    },
    {
      range: '151 – 200',
      key: 'stageUnhealthy',
      nameEn: 'Unhealthy',
      color: '#dc2626',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/30',
      text: 'text-rose-900',
      dot: 'bg-rose-500',
      descKey: 'stageUnhealthyDesc',
      actionKey: 'stageUnhealthyAction',
      descDefault: 'Everyone may begin to experience adverse health effects.',
      actionDefault: 'Wear a protective mask outdoors, keep home windows shut, and avoid long outdoor stays.',
    },
    {
      range: '201 – 300',
      key: 'stageVeryUnhealthy',
      nameEn: 'Very Unhealthy',
      color: '#9333ea',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      text: 'text-purple-900',
      dot: 'bg-purple-500',
      descKey: 'stageVeryUnhealthyDesc',
      actionKey: 'stageVeryUnhealthyAction',
      descDefault: 'Health alert: Increased risk of respiratory or cardiac issues for the whole community.',
      actionDefault: 'Avoid all outdoor activities. Stay indoors, seal windows, and run air filtration if available.',
    },
    {
      range: '301+',
      key: 'stageHazardous',
      nameEn: 'Hazardous',
      color: '#881337',
      bg: 'bg-red-900/15',
      border: 'border-red-900/30',
      text: 'text-red-950',
      dot: 'bg-red-900',
      descKey: 'stageHazardousDesc',
      actionKey: 'stageHazardousAction',
      descDefault: 'Emergency health warning: Serious health risk for the entire population.',
      actionDefault: 'Strictly remain indoors. Do not venture outdoors unless absolutely necessary.',
    },
  ]

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-[#eaf4f7] via-[#f7faf9] to-[#f0f5f4] rounded-3xl p-6 shadow-2xl border border-white/80 overflow-hidden max-h-[88vh] overflow-y-auto"
        style={{
          fontFamily:
            lang === 'si'
              ? "'Noto Sans Sinhala', sans-serif"
              : lang === 'ta'
              ? "'Noto Sans Tamil', sans-serif"
              : 'inherit',
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#004c6b]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#004c6b]/10 flex items-center justify-center text-[#004c6b]">
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#003e58] leading-tight">
                {t('aqiGuideModalTitle') || 'Understanding AQI & Health Levels'}
              </h3>
              <p className="text-[11px] font-semibold text-[#52798e]">
                {t('aqiGuideModalSubtitle') || 'Air Quality Index Quick Reference'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-90 flex items-center justify-center text-[#3e5b6e] transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* What is AQI Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm mb-5 relative z-10">
          <h4 className="text-xs font-black text-[#004c6b] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">info</span>
            {t('whatIsAqiTitle') || 'What is the AQI?'}
          </h4>
          <p className="text-xs text-[#2a383f] leading-relaxed mb-2.5">
            {t('whatIsAqiBody') ||
              'The Air Quality Index (AQI) is a 0 to 500 health scale. Lower numbers mean cleaner, safer air. The primary pollutant tracked is PM2.5 (microscopic airborne particles that can enter your lungs).'}
          </p>
          <div className="flex items-center gap-2 bg-[#f0f6f8] px-3 py-1.5 rounded-xl border border-black/5 text-[11px] font-bold text-[#004c6b]">
            <span className="material-symbols-outlined text-[14px]">lightbulb</span>
            <span>{t('aqiRuleOfThumb') || 'Rule of Thumb: Below 50 is ideal, 100+ requires care.'}</span>
          </div>
        </div>

        {/* Color Levels Breakdown Header */}
        <div className="flex items-center gap-1.5 mb-3 relative z-10">
          <span className="material-symbols-outlined text-[16px] text-[#00658d]">palette</span>
          <h4 className="text-xs font-black text-[#003e58] uppercase tracking-wider">
            {t('colorStagesTitle') || 'Color Stages & Recommended Actions'}
          </h4>
        </div>

        {/* 6 Stages Cards */}
        <div className="flex flex-col gap-3 mb-5 relative z-10">
          {STAGES.map((stage) => {
            const stageName = t(stage.key) || stage.nameEn
            const desc = t(stage.descKey) || stage.descDefault
            const action = t(stage.actionKey) || stage.actionDefault

            return (
              <div
                key={stage.range}
                className={`${stage.bg} border ${stage.border} rounded-2xl p-3.5 shadow-sm transition-all`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dot} shadow-sm shrink-0`} />
                    <span className={`text-xs font-black ${stage.text}`}>{stageName}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-600 bg-white/70 px-2 py-0.5 rounded-full shadow-inner">
                    AQI {stage.range}
                  </span>
                </div>

                <p className="text-[11px] text-[#2c3e47] leading-snug mb-2 font-medium">
                  {desc}
                </p>

                <div className="flex items-start gap-1.5 bg-white/60 p-2 rounded-xl border border-black/5 text-[11px] leading-snug">
                  <span className="material-symbols-outlined text-[14px] text-[#004c6b] shrink-0 mt-0.5">
                    task_alt
                  </span>
                  <span className="font-semibold text-[#1e293b]">
                    <strong className="font-bold text-[#004c6b]">{t('whatToDoLabel') || 'Action'}: </strong>
                    {action}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Practical Tips */}
        <div className="bg-white/80 rounded-2xl p-3.5 border border-black/5 shadow-sm mb-5 text-[11px] text-[#334155] leading-relaxed relative z-10">
          <div className="flex items-center gap-1.5 text-[#004c6b] font-bold mb-1">
            <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
            <span>{t('practicalTipsTitle') || 'Daily Air Quality Habits'}</span>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>{t('tip1') || 'Check the 24h Trends tab in the morning to plan workouts or school commutes.'}</li>
            <li>{t('tip2') || 'Check the Insights tab to see whether wind or humidity is driving pollution.'}</li>
            <li>{t('tip3') || 'Set a custom alert threshold in Settings to get push notifications during sudden spikes.'}</li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#004c6b] hover:bg-[#003850] active:scale-[0.98] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 relative z-10"
        >
          <span className="material-symbols-outlined text-base">check</span>
          <span>{t('dismissModal') || 'Got it'}</span>
        </button>
      </div>
    </div>
  )
}
