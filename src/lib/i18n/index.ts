import { useHotel } from "@/lib/habbo/hotel-context";
import { accountAge } from "@/lib/format";
import type { HotelId } from "@/lib/habbo/hotels";

import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fi } from "./fi";
import { fr } from "./fr";
import { it } from "./it";
import { nl } from "./nl";
import { pt, type Dict } from "./pt";
import { tr } from "./tr";

/** Each hotel's main language. */
export const HOTEL_LOCALE: Record<HotelId, { locale: string; dict: Dict }> = {
  br: { locale: "pt-BR", dict: pt },
  com: { locale: "en-US", dict: en },
  es: { locale: "es-ES", dict: es },
  de: { locale: "de-DE", dict: de },
  fr: { locale: "fr-FR", dict: fr },
  it: { locale: "it-IT", dict: it },
  nl: { locale: "nl-NL", dict: nl },
  fi: { locale: "fi-FI", dict: fi },
  tr: { locale: "tr-TR", dict: tr },
};

export type TKey = keyof Dict;

export function translator(hotel: HotelId) {
  const { locale, dict } = HOTEL_LOCALE[hotel] ?? HOTEL_LOCALE.br;
  const t = (key: TKey, vars?: Record<string, string | number>) => {
    let s: string = dict[key] ?? pt[key];
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
  const date = (iso: string | null | undefined, withTime = false) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
  };
  const num = (n: number) => n.toLocaleString(locale);
  const age = (iso: string | null | undefined) => {
    const a = accountAge(iso);
    if (!a) return null;
    const p = (n: number, one: TKey, many: TKey) => `${n} ${n === 1 ? t(one) : t(many)}`;
    return t("ageFmt", { y: p(a.years, "year", "years"), m: p(a.months, "month", "months"), d: p(a.days, "day", "days") });
  };
  return { t, locale, date, num, age };
}

export function useI18n() {
  const { hotel } = useHotel();
  return translator(hotel);
}
