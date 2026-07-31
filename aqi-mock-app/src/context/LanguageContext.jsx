import React, { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext()

export const LANGUAGES = [
  { code: 'en', label: 'EN', fullName: 'English' },
  { code: 'si', label: 'සිං', fullName: 'සිංහල' },
  { code: 'ta', label: 'தமி', fullName: 'தமிழ்' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const cycleLang = () => {
    setLang(prev => {
      const idx = LANGUAGES.findIndex(l => l.code === prev)
      return LANGUAGES[(idx + 1) % LANGUAGES.length].code
    })
  }

  const t = (key) => translations[lang]?.[key] ?? translations['en'][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, cycleLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
