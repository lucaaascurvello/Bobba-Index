export type HotelId = "br" | "com" | "es" | "de" | "fr" | "it" | "nl" | "fi" | "tr";

export interface Hotel {
  id: HotelId;
  name: string;
  domain: string;
  /** Only hotels whose endpoints were validated are enabled. */
  enabled: boolean;
}

export const HOTELS: Hotel[] = [
  { id: "br", name: "Habbo Brasil", domain: "www.habbo.com.br", enabled: true },
  { id: "com", name: "Habbo.com", domain: "www.habbo.com", enabled: false },
  { id: "es", name: "Habbo España", domain: "www.habbo.es", enabled: false },
  { id: "de", name: "Habbo Deutschland", domain: "www.habbo.de", enabled: false },
  { id: "fr", name: "Habbo France", domain: "www.habbo.fr", enabled: false },
  { id: "it", name: "Habbo Italia", domain: "www.habbo.it", enabled: false },
  { id: "nl", name: "Habbo Nederland", domain: "www.habbo.nl", enabled: false },
  { id: "fi", name: "Habbo Suomi", domain: "www.habbo.fi", enabled: false },
  { id: "tr", name: "Habbo Türkiye", domain: "www.habbo.com.tr", enabled: false },
];

export const DEFAULT_HOTEL: HotelId = "br";

export function getHotel(id: string): Hotel | undefined {
  return HOTELS.find((h) => h.id === id);
}

export function isSupportedHotel(id: string): id is HotelId {
  return !!getHotel(id)?.enabled;
}
