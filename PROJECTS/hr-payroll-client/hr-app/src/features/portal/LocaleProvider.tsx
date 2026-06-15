"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react"

import { t, type MessageKey } from "@/lib/i18n/translate"
import { APP_LOCALES, type AppLocale } from "@/lib/i18n/types"

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  tx: (key: MessageKey, vars?: Record<string, string | number>) => string
  pending: boolean
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale)
  const [pending, startTransition] = useTransition()

  const setLocale = useCallback((next: AppLocale) => {
    startTransition(async () => {
      setLocaleState(next)
      await fetch("/api/portal/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: next }),
      })
    })
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      pending,
      tx: (key, vars) => t(key, locale, vars),
    }),
    [locale, setLocale, pending]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}

export { APP_LOCALES }
