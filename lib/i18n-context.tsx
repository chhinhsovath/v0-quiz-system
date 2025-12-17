"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, type Translation } from "./i18n"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translation
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("km")

  useEffect(() => {
    const saved = localStorage.getItem("quiz_language") as Language
    if (saved && (saved === "en" || saved === "km")) {
      setLanguageState(saved)
    } else {
      // Set default to Khmer if no saved preference
      setLanguageState("km")
      localStorage.setItem("quiz_language", "km")
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("quiz_language", lang)
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
