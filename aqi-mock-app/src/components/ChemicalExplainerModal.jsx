import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function ChemicalExplainerModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage()

  if (!isOpen) return null

  const CHEMICALS = [
    {
      symbol: 'PM2.5',
      nameEn: 'Fine Particulate Matter',
      unit: 'µg/m³',
      badgeColor: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
      dotColor: 'bg-rose-500',
      titleKey: 'chemPm25Title',
      descKey: 'chemPm25Desc',
      healthKey: 'chemPm25Health',
      aqiRoleKey: 'chemPm25AqiRole',
      descDefault:
        'Microscopic airborne particles smaller than 2.5 microns (30x thinner than a strand of hair), produced by vehicle exhaust, road dust, and burning.',
      healthDefault:
        'Penetrates deep into lung alveoli and the bloodstream, triggering asthma attacks, coughing, and cardiovascular strain.',
      aqiRoleDefault:
        'The #1 primary driver of the AQI score in most urban and valley environments.',
    },
    {
      symbol: 'NO2',
      nameEn: 'Nitrogen Dioxide',
      unit: 'ppb',
      badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
      dotColor: 'bg-amber-500',
      titleKey: 'chemNo2Title',
      descKey: 'chemNo2Desc',
      healthKey: 'chemNo2Health',
      aqiRoleKey: 'chemNo2AqiRole',
      descDefault:
        'A pungent, reddish-brown gas generated during high-temperature fuel combustion in motor vehicles (diesel and petrol) and power generators.',
      healthDefault:
        'Inflames airway passages, increases susceptibility to respiratory infections, and aggravates chronic bronchitis.',
      aqiRoleDefault:
        'A direct indicator of traffic congestion and vehicle emissions in city corridors.',
    },
    {
      symbol: 'O3',
      nameEn: 'Ground-Level Ozone',
      unit: 'ppb',
      badgeColor: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
      titleKey: 'chemO3Title',
      descKey: 'chemO3Desc',
      healthKey: 'chemO3Health',
      aqiRoleKey: 'chemO3AqiRole',
      descDefault:
        'A secondary pollutant formed when vehicle fumes (NOx) react chemically with volatile organic gases under intense tropical sunlight and heat.',
      healthDefault:
        'Acts as a powerful lung irritant, causing chest tightness, burning eyes, and reduced lung capacity on sunny afternoons.',
      aqiRoleDefault:
        'Tends to peak during hot midday and afternoon hours when sunlight intensity is highest.',
    },
    {
      symbol: 'CO',
      nameEn: 'Carbon Monoxide',
      unit: 'ppb',
      badgeColor: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
      dotColor: 'bg-sky-500',
      titleKey: 'chemCoTitle',
      descKey: 'chemCoDesc',
      healthKey: 'chemCoHealth',
      aqiRoleKey: 'chemCoAqiRole',
      descDefault:
        'A colorless, odorless gas produced by incomplete combustion of carbon-based fuels (petrol, diesel, firewood, and trash burning).',
      healthDefault:
        'Reduces the oxygen-carrying capacity of blood by binding to hemoglobin, causing headaches, dizziness, and fatigue.',
      aqiRoleDefault:
        'Tracks atmospheric stagnation and localized combustion buildup in heavy traffic.',
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
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#003e58] leading-tight">
                {t('chemModalTitle') || 'Chemical Pollutants & AQI Guide'}
              </h3>
              <p className="text-[11px] font-semibold text-[#52798e]">
                {t('chemModalSubtitle') || 'How each chemical shapes the air you breathe'}
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

        {/* What does this mean card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm mb-4 relative z-10">
          <h4 className="text-xs font-black text-[#004c6b] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">info</span>
            {t('chemOverviewTitle') || 'How Chemicals Affect AQI'}
          </h4>
          <p className="text-xs text-[#2a383f] leading-relaxed">
            {t('chemOverviewBody') ||
              'The overall AQI is determined by the highest pollutant level at any moment. While PM2.5 fine dust is the primary concern, gases like NO2, Ozone, and Carbon Monoxide also contribute to urban pollution.'}
          </p>
        </div>

        {/* 4 Chemicals List */}
        <div className="flex flex-col gap-3.5 mb-5 relative z-10">
          {CHEMICALS.map((chem) => {
            const chemTitle = t(chem.titleKey) || chem.nameEn
            const desc = t(chem.descKey) || chem.descDefault
            const health = t(chem.healthKey) || chem.healthDefault
            const aqiRole = t(chem.aqiRoleKey) || chem.aqiRoleDefault

            return (
              <div
                key={chem.symbol}
                className="bg-white/90 border border-black/5 rounded-2xl p-4 shadow-sm"
              >
                {/* Chemical Top Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#004c6b] tracking-tight">
                      {chem.symbol}
                    </span>
                    <span className="text-xs font-bold text-slate-700">({chemTitle})</span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${chem.badgeColor}`}
                  >
                    {chem.unit}
                  </span>
                </div>

                {/* What it is / Sources */}
                <div className="text-[11px] text-[#2c3e47] leading-relaxed mb-2.5">
                  <strong className="text-[#004c6b] font-bold">
                    {t('chemSourcesLabel') || 'Sources'}:{' '}
                  </strong>
                  {desc}
                </div>

                {/* Health Impact */}
                <div className="bg-[#f0f6f8] p-2.5 rounded-xl border border-black/5 text-[11px] leading-snug mb-2 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-rose-600 shrink-0 mt-0.5">
                    cardiology
                  </span>
                  <div>
                    <strong className="text-rose-900 font-bold">
                      {t('chemHealthLabel') || 'Health Impact'}:{' '}
                    </strong>
                    <span className="text-[#1e293b]">{health}</span>
                  </div>
                </div>

                {/* Connection to AQI */}
                <div className="bg-[#f8faf9] p-2 rounded-xl border border-black/5 text-[10.5px] leading-snug flex items-start gap-1.5 text-slate-700">
                  <span className="material-symbols-outlined text-[14px] text-[#00658d] shrink-0 mt-0.5">
                    analytics
                  </span>
                  <div>
                    <strong className="text-[#004c6b] font-bold">
                      {t('chemAqiRoleLabel') || 'AQI Impact'}:{' '}
                    </strong>
                    <span>{aqiRole}</span>
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
