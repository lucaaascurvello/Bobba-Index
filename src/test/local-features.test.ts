import { describe, expect, it } from "vitest";

import { accountAge, formatAccountAge } from "@/lib/format";
import { pushRecent } from "@/lib/local-store";

describe("account age", () => {
  it("computes years, months and days", () => {
    expect(accountAge("2020-01-10T00:00:00Z", new Date("2026-10-15T00:00:00Z"))).toEqual({ years: 6, months: 9, days: 5 });
  });
  it("borrows days from previous month", () => {
    expect(accountAge("2025-09-20T00:00:00Z", new Date("2026-10-15T00:00:00Z"))).toEqual({ years: 1, months: 0, days: 25 });
  });
  it("formats in Portuguese", () => {
    expect(formatAccountAge("2025-10-14T00:00:00Z", new Date("2026-10-15T00:00:00Z"))).toBe("1 ano, 0 meses e 1 dia de hotel");
  });
  it("returns null when missing", () => expect(formatAccountAge(null)).toBeNull());
});

describe("recent searches", () => {
  it("dedupes case-insensitively, newest first, capped at 10", () => {
    let l = Array.from({ length: 10 }, (_, i) => ({ hotel: "br", name: `p${i}`, at: i }));
    l = pushRecent(l, { hotel: "br", name: "P3", at: 99 });
    expect(l[0]!.name).toBe("P3");
    expect(l.filter((p) => p.name.toLowerCase() === "p3")).toHaveLength(1);
    l = pushRecent(l, { hotel: "br", name: "new", at: 100 });
    expect(l).toHaveLength(10);
  });
});
