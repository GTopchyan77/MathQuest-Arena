import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { messages, type MessageKey } from "@/lib/i18n/messages";

const warnedMissingKeys = new Set<string>();

export type MessageParams = Record<string, string | number>;

export function getMessage(locale: Locale, key: MessageKey, params?: MessageParams) {
  const localized = messages[locale]?.[key];
  const template = localized ?? messages[defaultLocale][key] ?? String(key);

  if (localized) {
    return interpolateMessage(template, params);
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

  return interpolateMessage(template, params);
}

function interpolateMessage(message: string, params?: MessageParams) {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce(
    (result, [paramKey, value]) => result.replaceAll(`{${paramKey}}`, String(value)),
    message
  );
}
