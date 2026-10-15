import { useCallback, useEffect, useState } from "react";

// Device-only lists (recent searches, favorites). Read after hydration to avoid SSR mismatch.
export interface SavedPlayer {
  hotel: string;
  name: string;
  figure?: string | null;
  at: number;
}

const EVENT = "bobba:local-store";

function read<T>(key: string): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function pushRecent(list: SavedPlayer[], item: SavedPlayer, max = 10): SavedPlayer[] {
  const same = (p: SavedPlayer) => p.hotel === item.hotel && p.name.toLowerCase() === item.name.toLowerCase();
  return [item, ...list.filter((p) => !same(p))].slice(0, max);
}

function useStoredList(key: string) {
  const [items, setItems] = useState<SavedPlayer[]>([]);
  useEffect(() => {
    const sync = () => setItems(read<SavedPlayer>(key));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  const save = useCallback(
    (fn: (prev: SavedPlayer[]) => SavedPlayer[]) => {
      localStorage.setItem(key, JSON.stringify(fn(read<SavedPlayer>(key))));
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [items, save] as const;
}

export function useRecentSearches() {
  const [items, save] = useStoredList("bobba:recent");
  return {
    items,
    add: (p: Omit<SavedPlayer, "at">) => save((l) => pushRecent(l, { ...p, at: Date.now() })),
    clear: () => save(() => []),
  };
}

export function useFavorites() {
  const [items, save] = useStoredList("bobba:favorites");
  const is = (hotel: string, name: string) => items.some((p) => p.hotel === hotel && p.name.toLowerCase() === name.toLowerCase());
  return {
    items,
    is,
    toggle: (p: Omit<SavedPlayer, "at">) =>
      save((l) =>
        l.some((x) => x.hotel === p.hotel && x.name.toLowerCase() === p.name.toLowerCase())
          ? l.filter((x) => !(x.hotel === p.hotel && x.name.toLowerCase() === p.name.toLowerCase()))
          : pushRecent(l, { ...p, at: Date.now() }, 100),
      ),
    remove: (hotel: string, name: string) => save((l) => l.filter((x) => !(x.hotel === hotel && x.name.toLowerCase() === name.toLowerCase()))),
  };
}
