import React, { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import InsightsExplainerModal from './InsightsExplainerModal'

const InsightsScreen = ({ data, onToggleCity }) => {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const [showInsightsExplainer, setShowInsightsExplainer] = useState(false)
  const { shap = { humidity: '0%', temp: '0%', wind: '0%', topo: '0%' } } = data
  const localContext = data.localContext[lang] ?? data.localContext['en']

  const cityNameShort =
    typeof data.name === 'string'
      ? data.name.split(' ')[0]
      : typeof data.name === 'object'
      ? (data.name[lang] || data.name['en'] || 'City').split(' ')[0]
      : 'City'

  // Memoized SHAP Explanation Text
  const dynamicExplanation = useMemo(() => {
    const featureData = [
      { labelKey: 'shapHumidity', rawPct: parseInt(shap.humidity.replace(/[+-]/, '').replace('%', '') || '0') * (shap.humidity.includes('+') ? 1 : -1) },
      { labelKey: 'shapTemp',     rawPct: parseInt(shap.temp.replace(/[+-]/, '').replace('%', '') || '0') * (shap.temp.includes('+') ? 1 : -1) },
      { labelKey: 'shapWind',     rawPct: parseInt(shap.wind.replace(/[+-]/, '').replace('%', '') || '0') * (shap.wind.includes('+') ? 1 : -1) },
      { labelKey: 'shapTopo',     rawPct: parseInt(shap.topo.replace(/[+-]/, '').replace('%', '') || '0') * (shap.topo.includes('+') ? 1 : -1) },
    ]
    const topIncreaser = featureData.reduce((prev, curr) => (prev.rawPct > curr.rawPct ? prev : curr))
    const topReducer = featureData.reduce((prev, curr) => (prev.rawPct < curr.rawPct ? prev : curr))

    let explanation = t('shapExplanation') || 'Currently, {increase} is the main factor driving up pollution levels, while {decrease} is helping to clear the air.'
    explanation = explanation.replace('{increase}', t(topIncreaser.labelKey).toLowerCase())
    explanation = explanation.replace('{decrease}', t(topReducer.labelKey).toLowerCase())
    return explanation
  }, [shap, t])

  // Memoized SHAP Feature Rows
  const featureRows = useMemo(() => [
    { labelKey: 'shapHumidity', value: shap.humidity, color: shap.humidity.includes('+') ? 'bg-gradient-to-r from-[#f87171] to-[#dc2626]' : 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]' },
    { labelKey: 'shapTemp',     value: shap.temp,     color: shap.temp.includes('+')     ? 'bg-gradient-to-r from-[#f87171] to-[#dc2626]' : 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]' },
    { labelKey: 'shapWind',     value: shap.wind,     color: shap.wind.includes('+')     ? 'bg-gradient-to-r from-[#f87171] to-[#dc2626]' : 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]' },
    { labelKey: 'shapTopo',     value: shap.topo,     color: shap.topo.includes('+')     ? 'bg-gradient-to-r from-[#f87171] to-[#dc2626]' : 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]' },
  ], [shap])

  return (
    <div className="min-h-screen relative pb-8">
      <div className="fixed inset-0 -z-10 overflow-hidden transform-gpu">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 will-change-transform"
          style={{
            backgroundImage: data.id === 'kandy'
              ? "url('/kandy_bg.jpg')"
              : "url('/colombo_bg.webp')",
            transform: 'translateZ(0)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8ad3d7]/80 via-white/50 to-[#b5c7cd]/80 backdrop-blur-sm" />
      </div>

      <header className="flex justify-between items-center p-6 text-[#002b49]">
        <button onClick={cycleLang} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[#002b49]">
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find(l => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
        <button onClick={onToggleCity} className="flex items-center gap-1 bg-[#004c6b]/10 px-3 py-1.5 rounded-full hover:bg-[#004c6b]/20 transition-colors">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span className="text-xs font-bold text-[#003e58]">{cityNameShort}</span>
        </button>
      </header>

      <main className="px-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-[40px] leading-tight font-extrabold text-[#004c6b] mb-4 drop-shadow-sm">
            {t('insightsTitle')}
          </h2>
          <p className="text-[#3e5b6e] text-lg leading-snug">{t('insightsSubtitle')}</p>
        </div>

        {/* SHAP Feature Impact Card */}
        <div className="w-full bg-[#f4f7f5]/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-xl mb-6 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#004c6b]">bar_chart</span>
              <h3 className="text-xl font-bold text-[#004c6b]">{t('shapTitle')}</h3>
            </div>
            <button
              onClick={() => setShowInsightsExplainer(true)}
              aria-label="Environmental Factors Guide"
              title={t('insightsGuideTitle') || "Understanding Environmental Factors"}
              className="w-7 h-7 rounded-full bg-[#004c6b]/10 hover:bg-[#004c6b]/20 active:scale-90 border border-[#004c6b]/20 flex items-center justify-center text-[#004c6b] transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">info</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowInsightsExplainer(true)}
            className="w-full text-left text-[13px] leading-relaxed text-[#3e5b6e] mb-8 bg-[#e8f1ef] hover:bg-[#e0ebe8] active:scale-[0.99] p-4 rounded-2xl border border-black/5 shadow-inner transition-all cursor-pointer flex items-start gap-2"
          >
            <span className="font-bold text-[#004c6b] material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
            <div className="flex-1">
              <span>{dynamicExplanation}</span>
              <span className="block text-[10px] font-bold text-[#004c6b] mt-1.5 opacity-80">
                {t('tapToLearn') || 'Tap to learn'} →
              </span>
            </div>
          </button>

          <div className="flex flex-col gap-6">
            {featureRows.map(feature => {
              const isPositive = feature.value.includes('+')
              const pct = feature.value.replace(/[+-]/, '')
              return (
                <div key={feature.labelKey} className="grid grid-cols-[85px_1fr_48px] items-center gap-3.5">
                  <span className="text-xs font-extrabold text-[#003e58] tracking-tight">{t(feature.labelKey)}</span>
                  <div className="h-10 rounded-2xl bg-[#dfe7e5] flex overflow-hidden border border-black/10 shadow-inner p-0.5">
                    {isPositive ? (
                      <>
                        <div className="w-1/2 h-full border-r-2 border-dashed border-black/15" />
                        <div className="w-1/2 h-full flex justify-start pl-0.5">
                          <div className={`${feature.color} h-full rounded-r-xl shadow-md transition-all duration-700`} style={{ width: pct }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-1/2 h-full flex justify-end pr-0.5 border-r-2 border-dashed border-black/15">
                          <div className={`${feature.color} h-full rounded-l-xl shadow-md transition-all duration-700`} style={{ width: pct }} />
                        </div>
                        <div className="w-1/2 h-full" />
                      </>
                    )}
                  </div>
                  <span className={`text-sm font-black text-right transition-colors ${isPositive ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
                    {feature.value}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-black/5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#16a34a] shadow-sm" />
              <span className="text-[11px] font-extrabold text-[#3e5b6e] uppercase tracking-wider">{t('shapReduces')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#dc2626] shadow-sm" />
              <span className="text-[11px] font-extrabold text-[#3e5b6e] uppercase tracking-wider">{t('shapIncreases')}</span>
            </div>
          </div>
        </div>

        {/* Local Context Card */}
        <div className="w-full bg-[#e8f1ef]/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 blur-3xl rounded-full -mr-10 -mt-10" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <span className="material-symbols-outlined text-[#3d6978]">landscape</span>
            <h3 className="text-xl font-bold text-[#3d6978]">{t('localContext')}</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-[#1a1c1c] relative z-10 min-h-[50px]">
            {localContext}
          </p>
        </div>
      </main>

      {/* Environmental Insights Explainer Modal */}
      <InsightsExplainerModal
        isOpen={showInsightsExplainer}
        onClose={() => setShowInsightsExplainer(false)}
      />
    </div>
  )
}

export default React.memo(InsightsScreen);
