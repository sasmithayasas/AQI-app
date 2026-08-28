import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function InsightsExplainerModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage()

  if (!isOpen) return null

  const FACTORS = [
    {
      key: 'shapHumidity',
      icon: 'water_drop',
      iconColor: 'text-sky-600',
      badgeBg: 'bg-sky-500/15 text-sky-900 border-sky-500/30',
      titleKey: 'factorHumidityTitle',
      descKey: 'factorHumidityDesc',
      howItWorksKey: 'factorHumidityHow',
      titleDefault: 'Humidity & Moisture',
      descDefault:
        'When the air is damp and humid, moisture droplets cling to microscopic dust and exhaust particles (PM2.5).',
      howDefault:
        'This makes the pollution heavier, trapping it close to ground level where people breathe instead of letting it float away.',
    },
    {
      key: 'shapWind',
      icon: 'air',
      iconColor: 'text-teal-600',
      badgeBg: 'bg-teal-500/15 text-teal-900 border-teal-500/30',
      titleKey: 'factorWindTitle',
      descKey: 'factorWindDesc',
      howItWorksKey: 'factorWindHow',
      titleDefault: 'Wind & Ventilation',
      descDefault:
        'Active winds and coastal ocean breezes act as natural ventilation fans for cities.',
      howDefault:
        'Strong breezes blow away vehicle exhaust and smog, bringing fresh air. When the air is calm and still, smoke stagnates and builds up.',
    },
    {
      key: 'shapTemp',
      icon: 'device_thermostat',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-500/15 text-amber-900 border-amber-500/30',
      titleKey: 'factorTempTitle',
      descKey: 'factorTempDesc',
      howItWorksKey: 'factorTempHow',
      titleDefault: 'Temperature & Sunlight',
      descDefault:
        'Ground warmth creates vertical air currents that can lift smoke upward into the atmosphere.',
      howDefault:
        'However, strong tropical sunlight can also react with vehicle exhaust to create ground-level ozone. On cool nights, cold air can trap smoke under a lid (temperature inversion).',
    },
    {
      key: 'shapTopo',
      icon: 'landscape',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-500/15 text-emerald-900 border-emerald-500/30',
      titleKey: 'factorTopoTitle',
      descKey: 'factorTopoDesc',
      howItWorksKey: 'factorTopoHow',
      titleDefault: 'Topography (Valleys & Coastlines)',
      descDefault:
        'The physical shape of the land strongly dictates how pollution moves.',
      howDefault:
        'In mountain-ringed valleys (like Kandy), hills trap vehicle smoke and fog like a bowl. In flat coastal areas (like Colombo), ocean winds help clear smog out to sea.',
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
        {/* Top Ambient Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#00658d]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#004c6b]/10 flex items-center justify-center text-[#004c6b]">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#003e58] leading-tight">
                {t('insightsModalTitle') || 'Understanding Environmental Factors'}
              </h3>
              <p className="text-[11px] font-semibold text-[#52798e]">
                {t('insightsModalSubtitle') || 'How weather and geography shape your air'}
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

        {/* Non-technical Intro */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm mb-4 relative z-10">
          <h4 className="text-xs font-black text-[#004c6b] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">psychology</span>
            {t('insightsOverviewTitle') || 'Why do these factors matter?'}
          </h4>
          <p className="text-xs text-[#2a383f] leading-relaxed mb-3">
            {t('insightsOverviewBody') ||
              'Air quality changes constantly due to natural forces like wind, rain, heat, and mountains. The AI calculates exactly how much each factor is either trapping pollution or clearing it away.'}
          </p>

          {/* Color Meanings Pill Box */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5">
            <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shrink-0" />
              <div className="text-[10.5px] leading-tight">
                <strong className="text-rose-900 block font-bold">
                  {t('shapIncreases') || 'Increases AQI'}
                </strong>
                <span className="text-rose-700">{t('colorRedMeaning') || 'Traps pollution'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] shrink-0" />
              <div className="text-[10.5px] leading-tight">
                <strong className="text-emerald-900 block font-bold">
                  {t('shapReduces') || 'Reduces AQI'}
                </strong>
                <span className="text-emerald-700">{t('colorGreenMeaning') || 'Cleans the air'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="flex flex-col gap-3 mb-5 relative z-10">
          {FACTORS.map((factor) => {
            const title = t(factor.titleKey) || factor.titleDefault
            const desc = t(factor.descKey) || factor.descDefault
            const how = t(factor.howItWorksKey) || factor.howDefault

            return (
              <div
                key={factor.key}
                className="bg-white/90 border border-black/5 rounded-2xl p-3.5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`material-symbols-outlined text-[18px] ${factor.iconColor}`}>
                    {factor.icon}
                  </span>
                  <span className="text-xs font-black text-[#003e58]">{title}</span>
                </div>

                <p className="text-[11px] text-[#2c3e47] leading-relaxed mb-2 font-medium">
                  {desc}
                </p>

                <div className="bg-[#f0f6f8] p-2 rounded-xl border border-black/5 text-[10.5px] leading-snug flex items-start gap-1.5 text-slate-700">
                  <span className="material-symbols-outlined text-[14px] text-[#004c6b] shrink-0 mt-0.5">
                    help
                  </span>
                  <div>
                    <strong className="text-[#004c6b] font-bold">
                      {t('howItAffectsLabel') || 'How it works'}:{' '}
                    </strong>
                    <span>{how}</span>
                  </div>
                </div>
              </div>
            )
          })}
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
