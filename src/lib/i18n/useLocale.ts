"use client";

import { useContext } from "react";
import { I18nContext } from "@/lib/i18n/I18nProvider";

export function useLocale() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useLocale must be used within I18nProvider.");
  }

  return context;
}
