import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function HomeScreen({ data, onToggleCity, onNavigateToInsights, onRefresh, loading }) {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const isGood = data.status === 'Good'
  const statusKey = isGood ? 'statusGood' : 'statusModerate'

  return (
    <div className="min-h-screen relative pb-8">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full scale-110 transition-all duration-700"
          style={{
            backgroundImage: data.id === 'kandy'
              ? "url('/kandy_bg.jpg')"
              : "url('/colombo_bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(4px)',
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

      <main className="px-6 flex flex-col items-center">
        {/* Live Sensors Pill */}
        <div className="bg-black/30 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full flex items-center gap-2 mb-6 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_8px_#ccff00] animate-pulse" />
          <span className="text-xs font-bold text-white">{t('liveSensors')}</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">{data.name}</h2>
        </div>
        <p className="text-white/70 font-medium mb-10 drop-shadow">{data.province}</p>

        {/* Huge AQI Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8 transition-all">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-full border-[1.5px] border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.1),inset_0_4px_20px_rgba(255,255,255,0.8)]" />
          <div className="absolute inset-4 bg-gradient-to-br from-white/80 to-white/20 rounded-full border border-white/50 shadow-inner" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-sm font-bold text-slate-500 tracking-widest">{t('aqiLabel')}</span>
            <span className={`text-7xl font-extrabold ${isGood ? 'text-sky-800' : 'text-amber-800'} leading-none my-1 tracking-tighter`}>{data.aqi}</span>
            <div className={`${isGood ? 'bg-[#b7f568]' : 'bg-[#ffd54f]'} px-4 py-1 rounded-full shadow-sm mt-2 transition-colors`}>
              <span className={`text-xs font-bold ${isGood ? 'text-[#2a4511]' : 'text-[#5a3a00]'}`}>{t(statusKey)}</span>
            </div>
          </div>
        </div>

        {/* Health Advice */}
        <div className="flex items-center justify-center mb-10 w-full">
          <div className={`w-full max-w-[280px] bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg ${isGood ? '' : 'border-orange-300/50 bg-orange-900/30'}`}>
            <span className="material-symbols-outlined text-white text-2xl">
              {isGood ? 'directions_run' : data.aqi > 100 ? 'house' : 'masks'}
            </span>
            <span className="text-sm font-bold text-white leading-snug">
              {isGood ? t('adviceSafe') : data.aqi > 100 ? t('adviceWindows') : t('adviceMask')}
            </span>
          </div>
        </div>

        {/* Microclimate Cards */}
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
        <div className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-4 flex flex-col items-center shadow-lg mb-6">
          <span className="material-symbols-outlined text-white/70 mb-2">air</span>
          <span className="text-xs font-bold text-white/60 mb-1">{t('wind')}</span>
          <span className="text-2xl font-bold text-white">{data.wind} <span className="text-sm font-medium">{t('windUnit')}</span></span>
        </div>

        {/* Chemical Breakdown */}
        <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-white">science</span>
              <h3 className="text-xl font-bold text-white leading-tight">{t('chemBreakdown')}</h3>
            </div>
            <button
              onClick={() => alert(`Showing detailed chemical history for ${data.name}...`)}
              className="text-xs font-bold text-white/80 px-2 py-1 bg-white/20 rounded-lg hover:bg-white/40 transition-colors"
            >
              {t('details')}
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

        {/* System Status / XGBoost */}
        <div className="w-full bg-gradient-to-br from-[#1b6b7a] to-[#0f4459] rounded-3xl p-6 shadow-xl border border-white/10 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />

          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center bg-white/5">
              <span className="material-symbols-outlined text-white text-sm">memory</span>
            </div>
            <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">{t('systemStatus')}</span>
          </div>

          <h3 className="text-xl font-bold text-white leading-tight mb-6 mt-4">{t('xgboostBanner')}</h3>

          <div className="flex justify-between items-center relative z-10">
            <span className="text-xs text-white/80">{data.confidence} {t('confidence')}</span>
            <button
              onClick={onNavigateToInsights}
              className="text-xs font-bold text-white border border-white/30 bg-white/10 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-white/20 transition-colors"
            >
              {t('viewModels')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* AQI Explainer */}
        <div className="w-full bg-black/40 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/10 shadow-sm flex items-start gap-4">
          <span className="material-symbols-outlined text-white/70 text-3xl mt-1">info</span>
          <div>
            <h4 className="text-white font-bold mb-1">{t('aqiExplainerTitle')}</h4>
            <p className="text-white/70 text-[11px] leading-relaxed">
              {t('aqiExplainerDesc')}
            </p>
          </div>
        </div>

        {/* Trust / Transparency Footer */}
        <div className="w-full flex flex-col items-center gap-1.5 mb-8">
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title="Live data pulled from Open-Meteo">
            <span className="material-symbols-outlined text-white text-[11px]">database</span>
            <span className="text-[9px] font-bold text-white uppercase tracking-widest">{t('dataSource')}: Open-Meteo API</span>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <span className="material-symbols-outlined text-white text-[11px]">schedule</span>
            <span className="text-[9px] font-bold text-white uppercase tracking-widest">
              {t('lastUpdated')}: {data.lastUpdated && data.lastUpdated !== '--' ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Loading...'}
            </span>
            <button 
              onClick={onRefresh} 
              disabled={loading} 
              className={`p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all flex items-center justify-center ${loading ? 'animate-spin opacity-50' : ''}`}
            >
              <span className="material-symbols-outlined text-[12px] text-white">refresh</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
