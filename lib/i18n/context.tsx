'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import fr from './fr'
import ar from './ar'
import type { Translations } from './fr'

type Lang = 'fr' | 'ar'

interface LangCtx {
  lang: Lang
  t:    Translations
  setLang: (l: Lang) => void
  isRTL: boolean
}

const LanguageContext = createContext<LangCtx>({
  lang:    'fr',
  t:       fr,
  setLang: () => {},
  isRTL:   false,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved === 'ar' || saved === 'fr') setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('lang', lang)
  }, [lang])

  function setLang(l: Lang) { setLangState(l) }

  return (
    <LanguageContext.Provider value={{ lang, t: lang === 'ar' ? ar : fr, setLang, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() { return useContext(LanguageContext) }
