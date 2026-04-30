"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, locales, localeStorageKey, type Locale } from "@/lib/i18n/config";
import { getMessage } from "@/lib/i18n/getMessage";
import type { MessageKey } from "@/lib/i18n/messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }

    const stored = window.localStorage.getItem(localeStorageKey);
    return stored && locales.includes(stored as Locale) ? (stored as Locale) : defaultLocale;
  });

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(localeStorageKey, nextLocale);
      document.documentElement.lang = nextLocale;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => getMessage(locale, key)
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
