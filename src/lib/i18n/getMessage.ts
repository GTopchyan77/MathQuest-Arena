import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { messages, type MessageKey } from "@/lib/i18n/messages";

const warnedMissingKeys = new Set<string>();

export function getMessage(locale: Locale, key: MessageKey) {
  const localized = messages[locale]?.[key];

  if (localized) {
    return localized;
  }

  const fallback = messages[defaultLocale][key];

  if (process.env.NODE_ENV !== "production") {
    const warningKey = `${locale}:${String(key)}:${fallback ? "fallback" : "missing"}`;

    if (!warnedMissingKeys.has(warningKey)) {
      warnedMissingKeys.add(warningKey);
      console.warn(
        fallback
          ? `[i18n] Missing message key "${String(key)}" for locale "${locale}". Falling back to "${defaultLocale}".`
          : `[i18n] Missing message key "${String(key)}" for locale "${locale}" and default locale "${defaultLocale}".`
      );
    }
  }

  return fallback ?? String(key);
}
