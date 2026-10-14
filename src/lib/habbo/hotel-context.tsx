import { createContext, useContext, useState, type ReactNode } from "react";

import { DEFAULT_HOTEL, type HotelId } from "./hotels";

const HotelContext = createContext<{ hotel: HotelId; setHotel: (h: HotelId) => void }>({
  hotel: DEFAULT_HOTEL,
  setHotel: () => {},
});

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotel, setHotel] = useState<HotelId>(DEFAULT_HOTEL);
  return <HotelContext.Provider value={{ hotel, setHotel }}>{children}</HotelContext.Provider>;
}

export const useHotel = () => useContext(HotelContext);
