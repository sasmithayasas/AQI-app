import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function ChatAssistantModal({ data, city }) {
  const { t, lang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const cityName =
    typeof data?.name === 'string'
      ? data.name
      : typeof data?.name === 'object'
      ? data.name[lang] || data.name['en'] || (city === 'colombo' ? 'Colombo District' : 'Kandy District')
      : city === 'colombo'
      ? 'Colombo District'
      : 'Kandy District'

  const currentAqi = data?.aqi ?? '--'
  const currentStatus =
    typeof data?.status === 'string'
      ? data.status
      : typeof data?.status === 'object'
      ? data.status[lang] || data.status['en'] || 'Moderate'
      : 'Moderate'

  // Default initial welcome message
  const getInitialMessages = () => {
    const welcomeEn = `Hello! I am **SentinelAI**, your personal environmental health assistant for **${cityName}**.\n\nCurrent air quality is **AQI ${currentAqi} (${currentStatus})**. How can I help you plan your day?`
    const welcomeSi = `ආයුබෝවන්! මම **SentinelAI**, **${cityName}** සඳහා ඔබගේ සජීවී වායු තත්ත්ව සහකාරවරයායි.\n\nවත්මන් වායු තත්ත්වය **AQI ${currentAqi} (${currentStatus})** වේ. මගෙන් ඕනෑම දෙයක් විමසන්න!`
    const welcomeTa = `வணக்கம்! நான் **SentinelAI**, **${cityName}** க்கான உங்கள் நேரடி காற்று தர உதவியாளர்.\n\nதற்போதைய காற்று தரம் **AQI ${currentAqi} (${currentStatus})**. உங்களுக்கு எவ்வாறு உதவலாம்?`

    const welcome = lang === 'si' ? welcomeSi : lang === 'ta' ? welcomeTa : welcomeEn
    return [{ id: 'welcome', role: 'assistant', content: welcome, time: 'Just now' }]
  }

  const [messages, setMessages] = useState(getInitialMessages)

  // Quick-prompt suggestions tailored by language
  const PROMPTS = {
    en: [
      { id: 'compare', label: '🆚 Compare Colombo vs Kandy', query: 'Compare the air quality, microclimate, and forecast between Colombo and Kandy today. Which city is cleaner?' },
      { id: 'travel', label: '🚗 Travel Advisory Between Cities', query: 'Is it safe to travel between Colombo and Kandy today based on current AQI thresholds (is AQI > 50)?' },
      { id: 'jog', label: '🏃 Best time to jog today?', query: 'What is the best time window for outdoor exercise or jogging today in ' + cityName + '?' },
      { id: 'asthma', label: '🫁 Safe for asthma / children?', query: 'Is it safe for asthmatics or children to play outdoors today in ' + cityName + '?' },
      { id: 'why', label: '🔍 Why is air hazy/humid?', query: 'Why is air quality at this level and what are the main weather factors driving it in ' + cityName + '?' },
    ],
    si: [
      { id: 'compare', label: '🆚 කොළඹ සහ මහනුවර සසඳන්න', query: 'අද දිනයේ කොළඹ සහ මහනුවර වායු තත්ත්වය සහ කාලගුණ සාධක සසඳන්න. වඩා පිරිසිදු නගරය කුමක්ද?' },
      { id: 'travel', label: '🚗 නගර අතර ගමන් ආරක්ෂිතද?', query: 'වත්මන් AQI අගය අනුව (AQI 50 ට වැඩි නම්) අද කොළඹ සහ මහනුවර අතර ගමන් කිරීම ආරක්ෂිතද?' },
      { id: 'jog', label: '🏃 දුවන්න හොඳම වෙලාව?', query: cityName + ' හි අද එළිමහනේ ව්‍යායාම කිරීමට හෝ දුවන්න හොඳම කාලය කුමක්ද?' },
      { id: 'asthma', label: '🫁 ළමුන්ට / ඇදුම රෝගීන්ට?', query: cityName + ' හි අද ළමුන්ට හෝ ඇදුම රෝගීන්ට පිටතට යාම ආරක්ෂිතද?' },
      { id: 'why', label: '🔍 වාතය දූෂණය වීමට හේතුව?', query: cityName + ' හි වායු දූෂණයට බලපාන ප්‍රධාන කාලගුණ සාධක මොනවාද?' },
    ],
    ta: [
      { id: 'compare', label: '🆚 கொழும்பு vs கண்டி ஒப்பீடு', query: 'இன்று கொழும்பு மற்றும் கண்டி இடையே காற்று தரம் மற்றும் முன்னறிவிப்பை ஒப்பிடுக. எந்த நகரம் சுத்தமானது?' },
      { id: 'travel', label: '🚗 பயண சுகாதார எச்சரிக்கை', query: 'தற்போதைய AQI (AQI > 50) இன் அடிப்படையில் இன்று கொழும்பு மற்றும் கண்டி இடையே பயணம் செய்வது பாதுகாப்பானதா?' },
      { id: 'jog', label: '🏃 ஓட சிறந்த நேரம்?', query: cityName + ' இல் இன்று உடற்பயிற்சி செய்ய சிறந்த நேரம் எது?' },
      { id: 'asthma', label: '🫁 குழந்தைகளுக்கு பாதுகாப்பானதா?', query: cityName + ' இல் குழந்தைகள் அல்லது ஆஸ்துமா உள்ளவர்கள் வெளியே செல்லலாமா?' },
      { id: 'why', label: '🔍 காற்று மாசுபட காரணம்?', query: cityName + ' இல் காற்று தரத்தை பாதிக்கும் முக்கிய காரணிகள் யாவை?' },
    ]
  }

  const activePrompts = PROMPTS[lang] || PROMPTS.en

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim()
    if (!query || isLoading) return

    const userMsgId = Date.now().toString()
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://weather.yasasretail.cfd'
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          city: city || 'kandy',
          lang: lang || 'en',
          history: historyPayload
        })
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const resData = await response.json()
      const aiReply = resData.reply || 'I could not generate an answer at this moment.'

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error('[SentinelAI] Chat error:', err)
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          lang === 'si'
            ? 'සමාවන්න, සේවාදායකය සමඟ සම්බන්ධ වීමේ ගැටලුවක් මතු විය. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.'
            : lang === 'ta'
            ? 'மன்னிக்கவும், சேவையகத்துடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, I had trouble connecting to the live air quality service. Please try again shortly.',
        time: 'Just now'
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages(getInitialMessages())
  }

  // Simple Markdown-like formatter for bold text and bullet points
  const renderFormattedText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      // Bullet lines
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      return (
        <span
          key={idx}
          className={`block ${isBullet ? 'pl-2 my-0.5' : 'my-1'}`}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      )
    })
  }

  return (
    <>
      {/* ── 1. Compact Squircle Floating Action Button ────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Air Quality Assistant"
        title={t('askAi') || 'Ask SentinelAI Assistant'}
        className="fixed bottom-[112px] right-4 z-40 w-12 h-12 bg-gradient-to-br from-[#004c6b] via-[#00658d] to-[#00839e] text-white rounded-[18px] shadow-[0_8px_24px_rgba(0,76,107,0.5)] border border-white/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md group cursor-pointer animate-[fadeIn_0.5s_ease-out]"
      >
        <span className="material-symbols-outlined text-[22px] text-[#ccff00] group-hover:rotate-12 transition-transform">
          auto_awesome
        </span>
        {/* Active status pulse indicator on top-right */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ccff00] border-2 border-[#004c6b]" />
        </span>
      </button>

      {/* ── 2. Full Interactive Chat Assistant Modal ──────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center sm:p-4 bg-black/65 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="relative w-full sm:max-w-md h-[85vh] sm:h-[620px] bg-gradient-to-b from-[#eaf4f7] via-[#f7faf9] to-[#f0f5f4] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/80 flex flex-col overflow-hidden"
            style={{
              fontFamily:
                lang === 'si'
                  ? "'Noto Sans Sinhala', sans-serif"
                  : lang === 'ta'
                  ? "'Noto Sans Tamil', sans-serif"
                  : 'inherit',
            }}
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#004c6b]/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

            {/* Chat Modal Header */}
            <div className="p-4 px-5 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between relative z-10 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#004c6b] to-[#007ba8] flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-[#003e58] leading-none">
                      {t('aiAssistantTitle') || 'SentinelAI Assistant'}
                    </h3>
                    <span className="text-[9px] font-black bg-[#004c6b]/10 text-[#004c6b] px-1.5 py-0.5 rounded uppercase">
                      BiLSTM
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#52798e] mt-0.5">
                    {cityName} • <strong className="text-[#004c6b]">AQI {currentAqi}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear chat"
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-90 flex items-center justify-center text-[#52798e] transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-90 flex items-center justify-center text-[#3e5b6e] transition-all"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestion Pills */}
            <div className="py-2.5 px-4 bg-[#e8f1ef]/60 border-b border-black/5 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 shrink-0 relative z-10">
              {activePrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSendMessage(p.query)}
                  className="text-[11px] font-bold bg-white/90 hover:bg-white text-[#004c6b] border border-black/10 px-3 py-1.5 rounded-full shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 relative z-10">
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-[fadeIn_0.2s_ease-out]`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-[#004c6b] to-[#00658d] text-white rounded-br-none'
                          : 'bg-white/95 text-[#1a2e38] border border-black/5 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {isUser ? msg.content : renderFormattedText(msg.content)}
                    </div>
                    <span className="text-[9.5px] text-[#6b8593] font-semibold mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
                  <div className="bg-white/90 border border-black/5 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#004c6b] animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-[#004c6b] animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-[#004c6b] animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 px-4 bg-white/90 backdrop-blur-md border-t border-black/5 relative z-10 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('chatPlaceholder') || 'Ask SentinelAI anything about your air...'}
                  disabled={isLoading}
                  className="flex-1 bg-[#f0f5f4] border border-black/10 rounded-2xl px-4 py-2.5 text-xs text-[#002b49] placeholder-[#7d99a5] focus:outline-none focus:border-[#004c6b] focus:ring-1 focus:ring-[#004c6b] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-2xl bg-[#004c6b] hover:bg-[#003952] active:scale-90 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 shadow-md cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[19px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
