import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { HOTEL_LOCALE } from "@/lib/i18n/locale-map";
import { DEFAULT_HOTEL, isSupportedHotel, type HotelId } from "./hotels";

const HotelContext = createContext<{ hotel: HotelId; setHotel: (h: HotelId) => void }>({
  hotel: DEFAULT_HOTEL,
  setHotel: () => {},
});

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotel, updateHotel] = useState<HotelId>(DEFAULT_HOTEL);
  const setHotel = (next: HotelId) => updateHotel(isSupportedHotel(next) ? next : DEFAULT_HOTEL);
  useEffect(() => {
    document.documentElement.lang = HOTEL_LOCALE[hotel] ?? "pt-BR";
  }, [hotel]);
  return <HotelContext.Provider value={{ hotel, setHotel }}>{children}</HotelContext.Provider>;
}

export const useHotel = () => useContext(HotelContext);
