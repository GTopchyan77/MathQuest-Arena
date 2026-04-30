import type { Locale } from "@/lib/i18n/config";
import en, { type Messages } from "@/lib/i18n/messages/en";
import hy from "@/lib/i18n/messages/hy";
import ru from "@/lib/i18n/messages/ru";

export const messages = {
  en,
  hy,
  ru
} satisfies Record<Locale, Messages>;

export type MessageKey = keyof typeof en;
