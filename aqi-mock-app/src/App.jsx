import React, { useState } from 'react'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import HomeScreen from './components/HomeScreen'
import TrendsScreen from './components/TrendsScreen'
import InsightsScreen from './components/InsightsScreen'
import SettingsScreen from './components/SettingsScreen'

const FALLBACK_DATA = {
  kandy: {
    id: 'kandy',
    name: { en: 'Kandy District', si: 'මහනුවර දිස්ත්‍රික්කය', ta: 'கண்டி மாவட்டம்' },
    province: { en: 'Central Province, Sri Lanka', si: 'මධ්‍යම පළාත, ශ්‍රී ලංකාව', ta: 'மத்திய மாகாணம், இலங்கை' },
    aqi: '--', status: 'Loading...', temp: '--°C', humidity: '--%', wind: '--',
    pm25: { value: '--', pct: '0%' }, no2: { value: '--', pct: '0%' },
    o3: { value: '--', pct: '0%' }, co: { value: '--', pct: '0%' },
    confidence: '--%', shap: { humidity: '0%', temp: '0%', wind: '0%', topo: '0%' },
    forecasts: [],
    localContext: { en: 'Loading live data...', si: 'සජීවී දත්ත පූරණය වෙමින් පවතී...', ta: 'நேரடி தரவு ஏற்றப்படுகிறது...' }
  },
  colombo: {
    id: 'colombo',
    name: { en: 'Colombo District', si: 'කොළඹ දිස්ත්‍රික්කය', ta: 'கொழும்பு மாவட்டம்' },
    province: { en: 'Western Province, Sri Lanka', si: 'බස්නාහිර පළාත, ශ්‍රී ලංකාව', ta: 'மேல் மாகாணம், இலங்கை' },
    aqi: '--', status: 'Loading...', temp: '--°C', humidity: '--%', wind: '--',
    pm25: { value: '--', pct: '0%' }, no2: { value: '--', pct: '0%' },
    o3: { value: '--', pct: '0%' }, co: { value: '--', pct: '0%' },
    confidence: '--%', shap: { humidity: '0%', temp: '0%', wind: '0%', topo: '0%' },
    forecasts: [],
    localContext: { en: 'Loading live data...', si: 'සජීවී දත්ත පූරණය වෙමින් පවතී...', ta: 'நேரடி தரவு ஏற்றப்படுகிறது...' }
  },
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCity, setSelectedCity] = useState('kandy')
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    pushNotifications: true,
    dailySummary: false,
    spikeAlerts: true,
    threshold: 100,
    sensitiveGroups: {
      asthma: false,
      kids: true,
      elderly: false,
      pregnant: false,
    },
  })

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.2:8000";
    fetch(`${API_URL}/api/forecast?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && !data.error) {
          setApiData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch live data:", err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [selectedCity])

  const { lang, cycleLang, t, LANGUAGES } = useLanguage()
  const rawData = apiData || FALLBACK_DATA[selectedCity]
  const currentData = {
    ...rawData,
    name: rawData.name[lang] ?? rawData.name['en'],
    province: rawData.province[lang] ?? rawData.province['en'],
    localContext: {
      en: rawData.localContext?.en || FALLBACK_DATA[selectedCity].localContext.en,
      si: rawData.localContext?.si || FALLBACK_DATA[selectedCity].localContext.si,
      ta: rawData.localContext?.ta || FALLBACK_DATA[selectedCity].localContext.ta,
    }
  }
  const handleCityToggle = () =>
    setSelectedCity(prev => (prev === 'kandy' ? 'colombo' : 'kandy'))

  const refreshData = () => {
    let isMounted = true;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.2:8000";
    fetch(`${API_URL}/api/forecast?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && !data.error) {
          setApiData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch live data:", err);
        if (isMounted) setLoading(false);
      });
  };

  const TABS = [
    { key: 'home',     icon: 'map',         label: t('navHome') },
    { key: 'trends',   icon: 'trending_up',  label: t('navTrends') },
    { key: 'insights', icon: 'psychology',   label: t('navInsights') },
    { key: 'settings', icon: 'settings',     label: t('navSettings') },
  ]

    const renderScreen = () => {
      switch (activeTab) {
        case 'home':
          return <HomeScreen data={currentData} onToggleCity={handleCityToggle} onNavigateToInsights={() => setActiveTab('insights')} onRefresh={refreshData} loading={loading} />
        case 'trends':
          return <TrendsScreen data={currentData} onToggleCity={handleCityToggle} />
        case 'insights':
          return <InsightsScreen data={currentData} />
      case 'settings':
        return <SettingsScreen settings={settings} onSettingsChange={setSettings} />
      default:
        return <HomeScreen data={currentData} onToggleCity={handleCityToggle} onNavigateToInsights={() => setActiveTab('insights')} onRefresh={refreshData} loading={loading} />
    }
  }

  const currentLangLabel = LANGUAGES.find(l => l.code === lang)?.label

  return (
    <div className="relative min-h-screen text-[#1a3e59] overflow-x-hidden pb-20"
         style={{ fontFamily: lang === 'si' ? "'Noto Sans Sinhala', sans-serif" : lang === 'ta' ? "'Noto Sans Tamil', sans-serif" : "'Fira Sans', sans-serif" }}>
      {renderScreen()}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#8cb6ae]/80 backdrop-blur-xl border-t border-white/20 shadow-lg rounded-t-2xl flex justify-around items-center px-4 py-3 pb-6">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center justify-center transition-all duration-300 ease-out w-16 h-16 rounded-full ${
                isActive
                  ? 'bg-gradient-to-br from-[#1a5030] to-[#2c7a4b] text-white shadow-[0_4px_12px_rgba(26,80,48,0.4)] -translate-y-2'
                  : 'text-[#3e6058] hover:text-[#1a3e59]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className={`text-[9px] font-bold mt-1 leading-none text-center ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
