import React, { createContext, useContext, useState, useEffect } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext()

export const LANGUAGES = [
  { code: 'en', label: 'EN', fullName: 'English' },
  { code: 'si', label: 'සිං', fullName: 'සිංහල' },
  { code: 'ta', label: 'தமி', fullName: 'தமிழ்' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const savedLang = localStorage.getItem('sentinelaq_lang')
      if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
        return savedLang
      }
    } catch (e) {
      console.debug('Failed to read lang from localStorage:', e)
    }
    return 'en'
  })

  // Synchronize whenever language changes
  useEffect(() => {
    try {
      localStorage.setItem('sentinelaq_lang', lang)
    } catch (e) {
      console.debug('Failed to write lang to localStorage:', e)
    }
  }, [lang])

  const cycleLang = () => {
    setLang((prev) => {
      const idx = LANGUAGES.findIndex((l) => l.code === prev)
      const nextLang = LANGUAGES[(idx + 1) % LANGUAGES.length].code
      return nextLang
    })
  }

  const setLanguage = (newLang) => {
    if (LANGUAGES.some((l) => l.code === newLang)) {
      setLang(newLang)
    }
  }

  const t = (key) => translations[lang]?.[key] ?? translations['en'][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, cycleLang, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
