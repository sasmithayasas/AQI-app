import React, { useState, useEffect, useRef } from 'react'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { LocalNotifications } from '@capacitor/local-notifications'
import { App as CapApp } from '@capacitor/app'
import HomeScreen from './components/HomeScreen'
import TrendsScreen from './components/TrendsScreen'
import InsightsScreen from './components/InsightsScreen'
import SettingsScreen from './components/SettingsScreen'
import SplashScreen from './components/SplashScreen'
import DailySummaryModal from './components/DailySummaryModal'
import ChatAssistantModal from './components/ChatAssistantModal'
import { FALLBACK_DATA } from './data/constants'

function AppInner() {
  const [appState, setAppState] = useState('splash') // 'splash', 'main', 'error'
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCity, setSelectedCity] = useState('kandy')
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showDailySummary, setShowDailySummary] = useState(false)
  const lastFetchedRef = useRef(0)

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinelaq_settings')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.debug('Failed to parse settings:', e)
    }
    return {
      pushNotifications: true,
      dailySummary: false,
      spikeAlerts: true,
      threshold: 100,
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sentinelaq_settings', JSON.stringify(settings))
    } catch (e) {
      console.debug('Failed to save settings:', e)
    }
  }, [settings])

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      refreshData()
    }
    const handleOffline = () => {
      setIsOffline(true)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchInitialData = () => {
    let isMounted = true;
    setAppState('splash');
    setIsFadingOut(false);
    const API_URL = import.meta.env.VITE_API_URL || "https://weather.yasasretail.cfd";
    fetch(`${API_URL}/api/forecast?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (!data.error) {
            setApiData(data);
            lastFetchedRef.current = Date.now();
            setIsOffline(false);
            setIsFadingOut(true);
            setTimeout(() => {
              if (isMounted) setAppState('main');
            }, 600); // Wait for fade out animation
          } else {
            setAppState('error');
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch live data:", err);
        if (isMounted) {
          setIsOffline(true);
          setAppState('error');
        }
      });
    return () => { isMounted = false; };
  };

  React.useEffect(() => {
    return fetchInitialData();
  }, []) // run once on boot

  React.useEffect(() => {
    if (appState === 'main') {
      let isMounted = true;
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "https://weather.yasasretail.cfd";
      fetch(`${API_URL}/api/forecast?city=${selectedCity}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && !data.error) {
            setApiData(data);
            lastFetchedRef.current = Date.now();
            setIsOffline(false);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch live data:", err);
          if (isMounted) {
            setIsOffline(true);
            setLoading(false);
          }
        });
      return () => { isMounted = false; };
    }
  }, [selectedCity])

  const { lang, cycleLang, t, LANGUAGES } = useLanguage()

  const currentData = React.useMemo(() => {
    const rawData = apiData || FALLBACK_DATA[selectedCity] || FALLBACK_DATA.kandy
    const fallback = FALLBACK_DATA[selectedCity] || FALLBACK_DATA.kandy

    const CITY_TRANSLATIONS = {
      kandy: {
        name: { en: 'Kandy District', si: 'මහනුවර දිස්ත්‍රික්කය', ta: 'கண்டி மாவட்டம்' },
        province: { en: 'Central Province, Sri Lanka', si: 'මධ්‍යම පළාත, ශ්‍රී ලංකාව', ta: 'மத்திய மாகாணம், இலங்கை' },
      },
      colombo: {
        name: { en: 'Colombo District', si: 'කොළඹ දිස්ත්‍රික්කය', ta: 'கொழும்பு மாவட்டம்' },
        province: { en: 'Western Province, Sri Lanka', si: 'බස්නාහිර පළාත, ශ්‍රී ලංකාව', ta: 'மேல் மாகாணம், இலங்கை' },
      }
    }

    const cityKey = (rawData.id || selectedCity || 'kandy').toLowerCase()
    const cityDict = CITY_TRANSLATIONS[cityKey]

    const resolvedName =
      cityDict?.name?.[lang] ||
      (typeof rawData.name === 'object' && rawData.name !== null ? (rawData.name[lang] ?? rawData.name['en']) : null) ||
      fallback.name[lang] ||
      fallback.name.en

    const resolvedProvince =
      cityDict?.province?.[lang] ||
      (typeof rawData.province === 'object' && rawData.province !== null ? (rawData.province[lang] ?? rawData.province['en']) : null) ||
      fallback.province[lang] ||
      fallback.province.en

    return {
      ...rawData,
      name: resolvedName,
      province: resolvedProvince,
      localContext: {
        en: rawData.localContext?.en || fallback.localContext.en,
        si: rawData.localContext?.si || fallback.localContext.si,
        ta: rawData.localContext?.ta || fallback.localContext.ta,
      }
    }
  }, [apiData, selectedCity, lang])
  const handleCityToggle = React.useCallback(() => {
    setSelectedCity(prev => (prev === 'kandy' ? 'colombo' : 'kandy'))
  }, [])

  const refreshData = React.useCallback(() => {
    let isMounted = true;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "https://weather.yasasretail.cfd";
    fetch(`${API_URL}/api/forecast?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && !data.error) {
          setApiData(data);
          lastFetchedRef.current = Date.now();
          setLoading(false);
          console.log('[SentinelAQ] Live data refreshed for:', selectedCity, 'at', new Date().toLocaleTimeString());
        }
      })
      .catch(err => {
        console.error("Failed to fetch live data:", err);
        if (isMounted) setLoading(false);
      });
  }, [selectedCity]);

  // Hourly Auto-Reload Interval (60 minutes)
  React.useEffect(() => {
    if (appState !== 'main') return;

    const HOURLY_INTERVAL = 60 * 60 * 1000; // 1 hour = 3,600,000 ms
    const intervalId = setInterval(() => {
      console.log('[SentinelAQ] Triggering hourly auto-reload...');
      refreshData();
    }, HOURLY_INTERVAL);

    return () => clearInterval(intervalId);
  }, [appState, refreshData]);

  // Auto-refresh when user brings app back into foreground / resumes
  React.useEffect(() => {
    if (appState !== 'main') return;

    let appStateHandle = null;

    // 1. Native Capacitor app resume
    const setupNativeResume = async () => {
      try {
        appStateHandle = await CapApp.addListener('appStateChange', (state) => {
          if (state.isActive) {
            const timeSinceLastFetch = Date.now() - (lastFetchedRef.current || 0);
            // Refresh if at least 15 minutes have passed since last data fetch
            if (timeSinceLastFetch > 15 * 60 * 1000) {
              console.log('[SentinelAQ] Native app resumed after inactivity, auto-refreshing...');
              refreshData();
            }
          }
        });
      } catch (err) {
        console.debug('Native CapApp listener skipped:', err);
      }
    };
    setupNativeResume();

    // 2. Web visibility change / browser window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastFetch = Date.now() - (lastFetchedRef.current || 0);
        if (timeSinceLastFetch > 15 * 60 * 1000) {
          console.log('[SentinelAQ] Window gained focus, auto-refreshing...');
          refreshData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      if (appStateHandle && typeof appStateHandle.remove === 'function') {
        appStateHandle.remove();
      }
    };
  }, [appState, refreshData]);

  const TABS = [
    { key: 'home',     icon: 'map',         label: t('navHome') },
    { key: 'trends',   icon: 'trending_up',  label: t('navTrends') },
    { key: 'insights', icon: 'psychology',   label: t('navInsights') },
    { key: 'settings', icon: 'settings',     label: t('navSettings') },
  ]

  React.useEffect(() => {
    let listenerHandle = null;
    const attachNotifListener = async () => {
      try {
        listenerHandle = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (action) => {
            console.log('[SentinelAQ] Notification clicked:', action);
            const type = action.notification?.extra?.type;
            const notifId = action.notification?.id;
            if (
              type === 'dailySummary' ||
              type === 'dailySummaryTest' ||
              notifId === 7001 ||
              notifId === 7002
            ) {
              setShowDailySummary(true);
            }
          }
        );
      } catch (e) {
        console.debug('Notification click listener skipped:', e);
      }
    };
    attachNotifListener();
    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
    };
  }, []);

  const renderContent = () => {
    return (
      <>
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <HomeScreen data={currentData} city={selectedCity} onToggleCity={handleCityToggle} onRefresh={refreshData} loading={loading} />
        </div>
        <div style={{ display: activeTab === 'trends' ? 'block' : 'none' }}>
          <TrendsScreen data={currentData} city={selectedCity} onToggleCity={handleCityToggle} />
        </div>
        <div style={{ display: activeTab === 'insights' ? 'block' : 'none' }}>
          <InsightsScreen data={currentData} city={selectedCity} onToggleCity={handleCityToggle} />
        </div>
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsScreen
            settings={settings}
            onSettingsChange={setSettings}
            data={currentData}
            onOpenDailySummary={() => setShowDailySummary(true)}
          />
        </div>
      </>
    )
  }

  const getCachedTimeStr = () => {
    if (!lastFetchedRef.current) return '15m ago'
    const mins = Math.max(1, Math.round((Date.now() - lastFetchedRef.current) / 60000))
    return `${mins}m ago`
  }

  return (
    <>
      <div className="relative min-h-screen text-[#1a3e59] overflow-x-hidden pb-20 animate-[fadeIn_0.5s_ease-out]"
           style={{ fontFamily: lang === 'si' ? "'Noto Sans Sinhala', sans-serif" : lang === 'ta' ? "'Noto Sans Tamil', sans-serif" : "'Fira Sans', sans-serif" }}>
        
        {/* Offline Mode Banner */}
        {isOffline && (
          <div className="sticky top-0 z-[9900] bg-amber-500/90 backdrop-blur-md text-amber-950 px-4 py-2 text-center text-xs font-black flex items-center justify-center gap-2 shadow-md animate-[fadeIn_0.3s_ease-out]">
            <span className="material-symbols-outlined text-[17px] text-amber-950 shrink-0">cloud_off</span>
            <span>
              {t('offlineCachedMsg')?.replace('{time}', getCachedTimeStr()) || `Offline Mode — Viewing cached data from ${getCachedTimeStr()}. Reconnecting...`}
            </span>
          </div>
        )}

        {renderContent()}

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

      {/* Splash Screen Overlay */}
      {(appState === 'splash' || appState === 'error') && (
        <div className={`fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <SplashScreen error={appState === 'error'} onRetry={fetchInitialData} />
        </div>
      )}

      {/* Daily Morning Summary Modal */}
      <DailySummaryModal
        isOpen={showDailySummary}
        onClose={() => setShowDailySummary(false)}
        data={currentData}
        onNavigateToTrends={() => {
          setShowDailySummary(false);
          setActiveTab('trends');
        }}
      />

      {/* Floating AI Chat Assistant */}
      {appState === 'main' && (
        <ChatAssistantModal data={currentData} city={selectedCity} />
      )}

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
