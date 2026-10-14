import { getHotel } from "./hotels";

export function avatarUrl(
  hotel: string,
  opts: { name?: string; figure?: string | null; size?: "s" | "m" | "l"; headOnly?: boolean },
) {
  const domain = getHotel(hotel)?.domain ?? "www.habbo.com.br";
  const p = new URLSearchParams();
  if (opts.figure) p.set("figure", opts.figure);
  else if (opts.name) p.set("user", opts.name);
  p.set("size", opts.size ?? "l");
  p.set("direction", "2");
  p.set("head_direction", "3");
  p.set("gesture", "sml");
  if (opts.headOnly) p.set("headonly", "1");
  return `https://${domain}/habbo-imaging/avatarimage?${p.toString()}`;
}

export const badgeImageUrl = (code: string) =>
  `https://images.habbo.com/c_images/album1584/${encodeURIComponent(code)}.gif`;

export const groupBadgeUrl = (hotel: string, code: string) =>
  `https://${getHotel(hotel)?.domain ?? "www.habbo.com.br"}/habbo-imaging/badge/${encodeURIComponent(code)}.gif`;
