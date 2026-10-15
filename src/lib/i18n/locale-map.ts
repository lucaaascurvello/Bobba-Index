import type { HotelId } from "@/lib/habbo/hotels";

/** Each hotel's main language, kept separate to avoid import cycles. */
export const HOTEL_LOCALE: Record<HotelId, string> = {
  br: "pt-BR",
  com: "en-US",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  nl: "nl-NL",
  fi: "fi-FI",
  tr: "tr-TR",
};
