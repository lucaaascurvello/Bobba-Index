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
