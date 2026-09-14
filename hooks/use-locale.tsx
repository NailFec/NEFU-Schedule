"use client"

import * as React from "react"

import { messages, type Locale, type Messages } from "@/lib/i18n/messages"
import {
  htmlLangForLocale,
  loadLocale,
  saveLocale,
} from "@/lib/schedule/storage"

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
  ready: boolean
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("zh")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const stored = loadLocale()
    setLocaleState(stored)
    document.documentElement.lang = htmlLangForLocale(stored)
    setReady(true)
  }, [])

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next)
    saveLocale(next)
    document.documentElement.lang = htmlLangForLocale(next)
  }, [])

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
      ready,
    }),
    [locale, ready, setLocale]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider.")
  }
  return context
}
