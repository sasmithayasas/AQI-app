import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function TrendsScreen({ data, onToggleCity }) {
  const { t, lang, cycleLang, LANGUAGES } = useLanguage()
  const [historyTab, setHistoryTab] = useState('weekly')

  const forecasts = data.forecasts || [];
  let peakAqi = 45, peakTime = t('tomorrowAt');
  let lowestAqi = 28, lowestTime = t('tonightAt');

  if (forecasts.length > 0) {
    const futureForecasts = forecasts.filter(f => f.horizon > 0);
    if (futureForecasts.length > 0) {
      const maxF = futureForecasts.reduce((prev, curr) => (curr.aqi > prev.aqi ? curr : prev));
      const minF = futureForecasts.reduce((prev, curr) => (curr.aqi < prev.aqi ? curr : prev));
      peakAqi = maxF.aqi;
      lowestAqi = minF.aqi;
      
      const formatTime = (timeStr) => {
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { weekday: 'short' });
      };
      
      peakTime = formatTime(maxF.time);
      lowestTime = formatTime(minF.time);
    }
  }

  return (
    <div className="min-h-screen relative pb-8 bg-gradient-to-b from-[#e3f4f8] to-[#f9ede1]">
      <div className="fixed inset-0 -z-10 bg-white/40 backdrop-blur-[2px]" />

      <header className="flex justify-between items-center p-6 text-[#002b49]">
        <button onClick={cycleLang} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[#002b49]">
          <span className="material-symbols-outlined">language</span>
          <span className="text-xs font-bold">{LANGUAGES.find(l => l.code === lang)?.label}</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
        <button onClick={onToggleCity} className="flex items-center gap-1 bg-[#004c6b]/10 px-3 py-1.5 rounded-full hover:bg-[#004c6b]/20 transition-colors">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span className="text-xs font-bold text-[#003e58]">{data.name.split(' ')[0]}</span>
        </button>
      </header>

      <main className="px-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-[44px] leading-[1.1] font-extrabold text-[#003e58] mb-4 drop-shadow-sm tracking-tight">
            {t('trendsTitle')}
          </h2>
          <p className="text-[#3e5b6e] text-[15px] leading-snug max-w-[280px]">
            {t('trendsSubtitle')}
          </p>
        </div>

        {/* Expected Peak */}
        <div className="w-full bg-[#f4f7f8] border border-white/60 rounded-3xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#ffd8ce] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ba1a1a]">trending_up</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#3e4850] uppercase tracking-widest block mb-1">{t('expectedPeak')}</span>
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
              <span className="text-[10px] font-bold text-[#3e4850] uppercase tracking-widest block mb-1">{t('expectedLowest')}</span>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-[#457000]">{lowestAqi}</span>
                <span className="text-sm font-bold text-[#3e4850]">{t('aqiLabel')}</span>
              </div>
              <span className="text-sm font-bold text-[#003e58]">{lowestTime}</span>
            </div>
          </div>
        </div>

        {/* AQI Trend Chart */}
        <div className="w-full bg-[#f0f4f3] border border-white/60 rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl leading-tight font-bold text-[#003e58]">{t('trendChartTitle')}</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-4 rounded-full bg-[#1b5e7d]" />
                <span className="text-[10px] font-bold text-[#1a1c1c]">{t('past48h')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#db951f]" />
                <span className="text-[10px] font-bold text-[#1a1c1c]">{t('forecast')}</span>
              </div>
            </div>
          </div>

          {(() => {
            const past48h = data.past48h || [];
            const allAqis = [...past48h.map(d => d.aqi), ...forecasts.map(d => d.aqi)];
            const maxAqi = Math.max(50, ...allAqis);
            const getY = (aqi) => 100 - Math.min(100, (aqi / maxAqi) * 100);

            const pastPoints = past48h.map((d, i) => {
                const x = (i / Math.max(1, past48h.length - 1)) * 50;
                return `${x},${getY(d.aqi)}`;
            });
            const pastPath = pastPoints.length ? `M${pastPoints.join(' L')}` : "";
            const pastFillPath = pastPoints.length ? `${pastPath} L50,100 L0,100 Z` : "";

            const futurePoints = forecasts.map((d) => {
                const x = 50 + (d.horizon / 48) * 50;
                return `${x},${getY(d.aqi)}`;
            });
            const futurePath = futurePoints.length ? `M${futurePoints.join(' L')}` : "";
            const futureFillPath = futurePoints.length ? `${futurePath} L100,100 L50,100 Z` : "";

            return (
              <div className="relative w-full h-48 mt-4">
                <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
                  <div className="w-full border-t border-black/5" />
                  <div className="w-full border-t border-black/5" />
                  <div className="w-full border-t border-black/5" />
                </div>
                <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-bold text-[#3e4850] pt-0 pb-4">
                  <span>{maxAqi}</span><span>{Math.round(maxAqi/2)}</span><span>0</span>
                </div>
                <div className="absolute bottom-0 w-full flex justify-between pl-6 pr-2 text-[10px] font-bold text-[#1a1c1c]">
                  <span className="opacity-70">-48h</span>
                  <span className="opacity-70">-24h</span>
                  <span className="text-[#004c6b]">Now</span>
                  <span className="opacity-70">+24h</span>
                  <span className="opacity-70">+48h</span>
                </div>
                <div className="absolute top-2 bottom-6 left-1/2 border-l-2 border-dashed border-black/10" />
                <svg className="absolute inset-0 w-full h-[calc(100%-24px)] pl-6" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="pastGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1b5e7d" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1b5e7d" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="futureGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#db951f" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#db951f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {pastFillPath && <path d={pastFillPath} fill="url(#pastGradient)" />}
                  {pastPath && <path d={pastPath} fill="none" stroke="#1b5e7d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                  {futureFillPath && <path d={futureFillPath} fill="url(#futureGradient)" />}
                  {futurePath && <path d={futurePath} fill="none" stroke="#db951f" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" strokeLinejoin="round" />}
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Historical Analysis */}
        <div className="mt-8 mb-6">
          <h2 className="text-2xl font-bold text-[#003e58] mb-2">{t('historicalTitle')}</h2>
          <p className="text-[#3e5b6e] text-sm mb-4 leading-snug">{t('historicalSubtitle')}</p>
          
          <div className="w-full bg-[#f4f7f5] border border-white/60 rounded-3xl p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex bg-[#e8eceb] rounded-xl p-1 mb-6">
              {['weekly', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setHistoryTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    historyTab === tab
                      ? 'bg-white text-[#004c6b] shadow-sm'
                      : 'text-[#6e7881] hover:text-[#004c6b]'
                  }`}
                >
                  {t(tab === 'weekly' ? 'tabWeekly' : tab === 'monthly' ? 'tabMonthly' : 'tabYearly')}
                </button>
              ))}
            </div>

            {(() => {
              const histData = data.historical?.[historyTab] || [];
              const maxHist = Math.max(150, ...histData);
              const getYHist = (aqi) => 100 - Math.min(100, (aqi / maxHist) * 100);
              
              const histPoints = histData.map((val, i) => {
                  const x = (i / Math.max(1, histData.length - 1)) * 100;
                  return `${x},${getYHist(val)}`;
              });
              const histPath = histPoints.length ? `M${histPoints.join(' L')}` : "";
              const strokeColor = historyTab === 'yearly' ? "#db951f" : "#29718d";

              return (
                <div className="relative w-full h-40">
                  <div className="absolute inset-0 flex flex-col justify-between pt-1 pb-5">
                    <div className="w-full border-t border-black/5" />
                    <div className="w-full border-t border-black/5" />
                    <div className="w-full border-t border-black/5" />
                    <div className="w-full border-t border-black/5" />
                  </div>
                  <div className="absolute left-0 h-full flex flex-col justify-between text-[9px] font-bold text-[#6e7881] pt-0 pb-4">
                    <span>{maxHist}</span><span>{Math.round((maxHist/3)*2)}</span><span>{Math.round(maxHist/3)}</span><span>0</span>
                  </div>
                  <div className="absolute bottom-0 w-full flex justify-between pl-6 pr-1 text-[9px] font-bold text-[#3e4850]">
                    {historyTab === 'weekly' && <><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></>}
                    {historyTab === 'monthly' && <><span>1</span><span>7</span><span>14</span><span>21</span><span>28</span></>}
                    {historyTab === 'yearly' && <><span>J</span><span>F</span><span>M</span><span>A</span><span>M</span><span>J</span><span>J</span><span>A</span><span>S</span><span>O</span><span>N</span><span>D</span></>}
                  </div>
                  
                  <svg className="absolute inset-0 w-full h-[calc(100%-20px)] pl-6" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {histPath && (
                      <path d={histPath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </div>
              );
            })()}
            
            {/* Context Insight */}
            <div className="mt-4 flex gap-3 items-start bg-white/50 rounded-xl p-3 border border-black/5">
              <span className="material-symbols-outlined text-[#db951f] text-lg">tips_and_updates</span>
              <p className="text-xs text-[#1a1c1c] leading-relaxed">
                {historyTab === 'yearly'
                  ? 'Noticeable spike during mid-year months corresponds to increased local construction and seasonal dry winds.'
                  : 'Recent patterns show higher pollution levels during morning rush hours and late evenings.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
