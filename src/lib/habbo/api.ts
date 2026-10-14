// Pure service layer for the public Habbo API. Runs on the server (see habbo.functions.ts).
import { getHotel, isSupportedHotel, type HotelId } from "./hotels";
import type {
  ApiResult,
  BadgeCatalogPage,
  CatalogBadge,
  HabboBadge,
  HabboErrorInfo,
  HabboFriend,
  HabboGroup,
  HabboProfile,
  HabboRoom,
  HabboUser,
} from "./types";

const TIMEOUT_MS = 9000;

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const bool = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : [];

export function normalizeName(raw: string): ApiResult<string> {
  const name = raw.normalize("NFC").trim();
  if (!name) return fail("invalid_input", "Digite um nick para pesquisar.");
  if (name.length > 32) return fail("invalid_input", "Nick muito longo.");
  if (/[\u0000-\u001f]/.test(name)) return fail("invalid_input", "Nick contém caracteres inválidos.");
  return { ok: true, data: name };
}

function fail(kind: HabboErrorInfo["kind"], message: string, status?: number): { ok: false; error: HabboErrorInfo } {
  return { ok: false, error: { kind, message, status } };
}

async function getJson(url: string): Promise<ApiResult<unknown>> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError")
      return fail("timeout", "O Habbo demorou demais para responder.");
    return fail("network", "Não foi possível conectar ao Habbo.");
  }
  if (res.status === 404) return fail("not_found", "Não encontrado.", 404);
  if (res.status === 429) return fail("rate_limited", "Muitas consultas em pouco tempo. Aguarde um momento.", 429);
  if (res.status === 403 || res.status === 463)
    return fail("blocked", "A consulta foi recusada pela proteção do Habbo.", res.status);
  if (!res.ok) return fail("upstream", `O Habbo respondeu com erro (${res.status}).`, res.status);
  try {
    return { ok: true, data: await res.json() };
  } catch {
    return fail("upstream", "Resposta inesperada do Habbo.");
  }
}

function hotelBase(hotel: string): ApiResult<string> {
  if (!isSupportedHotel(hotel)) return fail("unsupported_hotel", "Este hotel ainda não é suportado.");
  return { ok: true, data: `https://${getHotel(hotel)!.domain}` };
}

function mapBadge(b: Record<string, unknown>): HabboBadge {
  return { code: String(b.code ?? ""), name: str(b.name), description: str(b.description) };
}

export function mapUser(hotel: HotelId, u: Record<string, unknown>): HabboUser {
  return {
    hotel,
    uniqueId: String(u.uniqueId ?? ""),
    name: String(u.name ?? ""),
    figureString: str(u.figureString),
    motto: str(u.motto),
    online: bool(u.online),
    lastAccessTime: str(u.lastAccessTime),
    memberSince: str(u.memberSince),
    profileVisible: u.profileVisible !== false,
    currentLevel: num(u.currentLevel),
    currentLevelCompletePercent: num(u.currentLevelCompletePercent),
    totalExperience: num(u.totalExperience),
    starGemCount: num(u.starGemCount),
    selectedBadges: arr(u.selectedBadges)
      .map((b) => ({ ...mapBadge(b), badgeIndex: num(b.badgeIndex) }))
      .filter((b) => b.code),
  };
}

const mapGroup = (g: Record<string, unknown>): HabboGroup => ({
  id: String(g.id ?? ""),
  name: String(g.name ?? "Grupo sem nome"),
  description: str(g.description),
  type: str(g.type),
  badgeCode: str(g.badgeCode),
  roomId: str(g.roomId),
  isAdmin: bool(g.isAdmin),
});

const mapRoom = (r: Record<string, unknown>): HabboRoom => ({
  id: (r.id as number | string) ?? String(r.uniqueId ?? ""),
  name: String(r.name ?? "Quarto sem nome"),
  description: str(r.description),
  creationTime: str(r.creationTime),
  tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === "string") : [],
  maximumVisitors: num(r.maximumVisitors),
  rating: num(r.rating),
  thumbnailUrl: str(r.thumbnailUrl),
  imageUrl: str(r.imageUrl),
});

const mapFriend = (f: Record<string, unknown>): HabboFriend => ({
  uniqueId: String(f.uniqueId ?? ""),
  name: String(f.name ?? ""),
  motto: str(f.motto),
  figureString: str(f.figureString),
});

/** GET /api/public/users?name= — exact (case-insensitive) nick lookup. */
export async function fetchUserByName(hotel: string, rawName: string): Promise<ApiResult<HabboUser>> {
  const base = hotelBase(hotel);
  if (!base.ok) return base;
  const name = normalizeName(rawName);
  if (!name.ok) return name;
  const r = await getJson(`${base.data}/api/public/users?name=${encodeURIComponent(name.data)}`);
  if (!r.ok) {
    if (r.error.kind === "not_found") return fail("not_found", `Nenhum jogador chamado “${name.data}”.`, 404);
    return r;
  }
  const body = r.data as Record<string, unknown>;
  if (!body || typeof body !== "object" || !body.uniqueId) return fail("not_found", "Jogador não encontrado.");
  return { ok: true, data: mapUser(hotel as HotelId, body) };
}

/** GET /api/public/users/{id}/profile — badges, groups, rooms, friends. 404 when the profile is private. */
export async function fetchProfile(hotel: string, uniqueId: string): Promise<ApiResult<HabboProfile>> {
  const base = hotelBase(hotel);
  if (!base.ok) return base;
  if (!/^[a-z0-9-]{3,80}$/i.test(uniqueId)) return fail("invalid_input", "Identificador inválido.");
  const r = await getJson(`${base.data}/api/public/users/${uniqueId}/profile`);
  if (!r.ok) {
    if (r.error.kind === "not_found") return fail("private", "Este perfil é privado ou indisponível.", 404);
    return r;
  }
  const p = r.data as Record<string, unknown>;
  return {
    ok: true,
    data: {
      user: mapUser(hotel as HotelId, (p.user as Record<string, unknown>) ?? {}),
      badges: Array.isArray(p.badges) ? arr(p.badges).map(mapBadge).filter((b) => b.code) : null,
      groups: Array.isArray(p.groups) ? arr(p.groups).map(mapGroup) : null,
      rooms: Array.isArray(p.rooms) ? arr(p.rooms).map(mapRoom) : null,
      friends: Array.isArray(p.friends) ? arr(p.friends).map(mapFriend) : null,
    },
  };
}

// ---------- Badge catalog (from the hotel's public external_flash_texts gamedata) ----------

export function parseBadgeTexts(text: string): CatalogBadge[] {
  const names = new Map<string, string>();
  const descs = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq);
    const value = line.slice(eq + 1).trim();
    if (key.startsWith("badge_name_")) {
      const code = key.slice(11).trim();
      if (code) names.set(code, value);
    } else if (key.startsWith("badge_desc_")) {
      const code = key.slice(11).trim();
      if (code) descs.set(code, value);
    }
  }
  return [...names.entries()]
    .map(([code, name]) => ({ code, name: name || null, description: descs.get(code) || null }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

const catalogCache = new Map<string, { at: number; items: CatalogBadge[] }>();
const CATALOG_TTL = 6 * 60 * 60 * 1000;

async function loadCatalog(hotel: string): Promise<ApiResult<CatalogBadge[]>> {
  const cached = catalogCache.get(hotel);
  if (cached && Date.now() - cached.at < CATALOG_TTL) return { ok: true, data: cached.items };
  const base = hotelBase(hotel);
  if (!base.ok) return base;
  let res: Response;
  try {
    res = await fetch(`${base.data}/gamedata/external_flash_texts/1`, { signal: AbortSignal.timeout(20000) });
  } catch {
    return fail("network", "Não foi possível carregar o catálogo de emblemas.");
  }
  if (res.status === 429) return fail("rate_limited", "Limite de consultas atingido.", 429);
  if (!res.ok) return fail(res.status === 463 || res.status === 403 ? "blocked" : "upstream", `Catálogo indisponível (${res.status}).`, res.status);
  const items = parseBadgeTexts(await res.text());
  if (items.length === 0) return fail("upstream", "O catálogo retornou vazio.");
  catalogCache.set(hotel, { at: Date.now(), items });
  return { ok: true, data: items };
}

export const BADGE_PREFIXES = ["ACH_"] as const;

export async function searchBadgeCatalog(
  hotel: string,
  opts: { q: string; prefix: "all" | "ach" | "other"; page: number; pageSize: number },
): Promise<ApiResult<BadgeCatalogPage>> {
  const cat = await loadCatalog(hotel);
  if (!cat.ok) return cat;
  const q = opts.q.trim().toLowerCase();
  const filtered = cat.data.filter((b) => {
    const isAch = b.code.startsWith("ACH_");
    if (opts.prefix === "ach" && !isAch) return false;
    if (opts.prefix === "other" && isAch) return false;
    if (!q) return true;
    return b.code.toLowerCase().includes(q) || (b.name ?? "").toLowerCase().includes(q);
  });
  const start = (opts.page - 1) * opts.pageSize;
  return {
    ok: true,
    data: {
      items: filtered.slice(start, start + opts.pageSize),
      total: filtered.length,
      page: opts.page,
      pageSize: opts.pageSize,
      catalogSize: cat.data.length,
    },
  };
}
