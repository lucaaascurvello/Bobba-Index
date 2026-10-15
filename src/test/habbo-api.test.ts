import { describe, expect, it } from "vitest";

import { mapUser, normalizeName, parseBadgeTexts } from "@/lib/habbo/api";

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
