import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function InsightsScreen({ data }) {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const { shap } = data
  const localContext = data.localContext[lang] ?? data.localContext['en']

  return (
    <div className="min-h-screen relative pb-8">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: data.id === 'kandy'
              ? "url('https://images.unsplash.com/photo-1579002124673-100236a297e6?q=80&w=1000&auto=format&fit=crop')"
              : "url('https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1000&auto=format&fit=crop')",
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
        <div className="w-12" /> {/* Spacer to keep flex-between balanced */}
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
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#004c6b]">bar_chart</span>
            <h3 className="text-xl font-bold text-[#004c6b]">{t('shapTitle')}</h3>
          </div>
          
          <p className="text-[13px] leading-relaxed text-[#3e5b6e] mb-8 bg-[#e8f1ef] p-4 rounded-2xl border border-black/5 shadow-inner">
            <span className="font-bold text-[#004c6b] material-symbols-outlined text-sm align-middle mr-1.5 -mt-0.5">info</span>
            {(() => {
              const featureData = [
                { labelKey: 'shapHumidity', rawPct: parseInt(shap.humidity.replace(/[+-]/, '').replace('%', '')) * (shap.humidity.includes('+') ? 1 : -1) },
                { labelKey: 'shapTemp',     rawPct: parseInt(shap.temp.replace(/[+-]/, '').replace('%', '')) * (shap.temp.includes('+') ? 1 : -1) },
                { labelKey: 'shapWind',     rawPct: parseInt(shap.wind.replace(/[+-]/, '').replace('%', '')) * (shap.wind.includes('+') ? 1 : -1) },
                { labelKey: 'shapTopo',     rawPct: parseInt(shap.topo.replace(/[+-]/, '').replace('%', '')) * (shap.topo.includes('+') ? 1 : -1) },
              ]
              const topIncreaser = featureData.reduce((prev, curr) => (prev.rawPct > curr.rawPct) ? prev : curr)
              const topReducer = featureData.reduce((prev, curr) => (prev.rawPct < curr.rawPct) ? prev : curr)
              
              let explanation = t('shapExplanation')
              explanation = explanation.replace('{increase}', t(topIncreaser.labelKey).toLowerCase())
              explanation = explanation.replace('{decrease}', t(topReducer.labelKey).toLowerCase())
              return explanation
            })()}
          </p>

          <div className="flex flex-col gap-5">
            {[
              { labelKey: 'shapHumidity', value: shap.humidity, color: shap.humidity.includes('+') ? 'bg-[#1b5e7d]' : 'bg-[#528a2c]' },
              { labelKey: 'shapTemp',     value: shap.temp,     color: shap.temp.includes('+')     ? 'bg-[#29718d]' : 'bg-[#73a34a]' },
              { labelKey: 'shapWind',     value: shap.wind,     color: shap.wind.includes('+')     ? 'bg-[#1b5e7d]' : 'bg-[#528a2c]' },
              { labelKey: 'shapTopo',     value: shap.topo,     color: shap.topo.includes('+')     ? 'bg-[#1a5574]' : 'bg-[#528a2c]' },
            ].map(feature => {
              const isPositive = feature.value.includes('+')
              const pct = feature.value.replace(/[+-]/, '')
              return (
                <div key={feature.labelKey} className="grid grid-cols-[80px_1fr_40px] items-center gap-4">
                  <span className="text-xs font-bold text-[#3e4850]">{t(feature.labelKey)}</span>
                  <div className="h-8 rounded-full bg-[#e8eceb] flex overflow-hidden border border-black/5 shadow-inner">
                    {isPositive ? (
                      <>
                        <div className="w-1/2 h-full border-r border-black/10" />
                        <div className="w-1/2 h-full flex justify-start">
                          <div className={`${feature.color} h-full rounded-r-full shadow-sm transition-all duration-700`} style={{ width: pct }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-1/2 h-full flex justify-end border-r border-black/10">
                          <div className={`${feature.color} h-full rounded-l-full shadow-sm transition-all duration-700`} style={{ width: pct }} />
                        </div>
                        <div className="w-1/2 h-full" />
                      </>
                    )}
                  </div>
                  <span className={`text-xs font-bold text-right transition-colors ${isPositive ? 'text-[#004c6b]' : 'text-[#457000]'}`}>
                    {feature.value}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#528a2c]" />
              <span className="text-[10px] font-bold text-[#6e7881] uppercase tracking-wider">{t('shapReduces')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1b5e7d]" />
              <span className="text-[10px] font-bold text-[#6e7881] uppercase tracking-wider">{t('shapIncreases')}</span>
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
          <p className="text-[15px] leading-relaxed text-[#1a1c1c] mb-8 relative z-10 min-h-[70px]">
            {localContext}
          </p>
          <div className="border-t border-black/10 pt-4 flex justify-between items-end relative z-10">
            <span className="text-xs font-bold text-[#6e7881]">{t('confidence')}</span>
            <span className="text-2xl font-bold text-[#457000]">{data.confidence}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
