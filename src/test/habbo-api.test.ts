import { describe, expect, it, vi } from "vitest";

import { fetchBadgeOwners, fetchCommunityPhotos, fetchPhotos, fetchProfile, fetchUserByName, mapUser, normalizeName, parseBadgeTexts, searchBadgeCatalog } from "@/lib/habbo/api";

describe("Unknown hotel API access", () => {
  it("rejects unknown hotels on every public-data path without network calls", async () => {
    const network = vi.spyOn(globalThis, "fetch");
    try {
      const results = await Promise.all([
        fetchUserByName("xx", "Bobba"),
        fetchProfile("xx", "hhus-123"),
        fetchPhotos("xx", "hhus-123"),
        fetchBadgeOwners("xx", "ACH_Login1"),
        fetchCommunityPhotos("xx"),
        searchBadgeCatalog("xx", { q: "", prefix: "all", page: 1, pageSize: 60 }),
      ]);
      for (const result of results) {
        expect(result).toMatchObject({ ok: false, error: { kind: "unsupported_hotel" } });
      }
      expect(network).not.toHaveBeenCalled();
    } finally {
      network.mockRestore();
    }
  });
});

describe("habbo service", () => {
  it("rejects empty nick", () => {
    expect(normalizeName("   ").ok).toBe(false);
  });

  it("parses badge names and descriptions from gamedata texts", () => {
    const items = parseBadgeTexts("badge_name_ ABC=Nome\nbadge_desc_ABC=Desc\nother=x\nbadge_name_ZZ=Z");
    expect(items).toEqual([
      { code: "ABC", name: "Nome", description: "Desc" },
      { code: "ZZ", name: "Z", description: null },
    ]);
  });

  it("maps missing/empty fields to null instead of inventing values", () => {
    const u = mapUser("br", { uniqueId: "hhbr-1", name: "X", motto: "" });
    expect(u.motto).toBeNull();
    expect(u.memberSince).toBeNull();
    expect(u.online).toBeNull();
    expect(u.selectedBadges).toEqual([]);
  });
});

describe("photos", () => {
  it("maps photo time and protocol-relative urls", async () => {
    const { mapPhoto } = await import("@/lib/habbo/api");
    const p = mapPhoto({ id: "1", url: "//x/a.png", time: 0, likes: ["a", "b"] });
    expect(p.url).toBe("https://x/a.png");
    expect(p.takenAt).toBe("1970-01-01T00:00:00.000Z");
    expect(p.likes).toBe(2);
  });
});

describe("badge catalog download", () => {
  it("sends a non-browser identity and uses the stored copy when Habbo answers 463", async () => {
    const { CATALOG_HEADERS } = await import("@/lib/habbo/api");
    expect(CATALOG_HEADERS["User-Agent"]).not.toMatch(/Mozilla/);
    const network = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 463 }));
    try {
      const store = { load: async () => ({ items: [{ code: "ABC", name: "N", description: null }], fetchedAt: "2026-10-01T00:00:00Z" }), save: async () => {} };
      const r = await searchBadgeCatalog("fi", { q: "", prefix: "all", page: 1, pageSize: 60 }, store);
      expect(r).toMatchObject({ ok: true, data: { total: 1, snapshotAt: "2026-10-01T00:00:00Z" } });
      const noStore = await searchBadgeCatalog("tr", { q: "", prefix: "all", page: 1, pageSize: 60 });
      expect(noStore).toMatchObject({ ok: false, error: { kind: "blocked", status: 463 } });
    } finally {
      network.mockRestore();
    }
  });
});
