import { describe, expect, it } from "vitest";

import { buildHistory, decideWrite, type Snapshot } from "@/lib/habbo/history";

const f = (id: string) => ({ id, name: `N${id}`, figure: null });
const snap = (p: Partial<Snapshot> & { firstSeenAt: string }): Snapshot => ({
  name: "Bobba", figure: "hd-1", motto: "oi", friends: [], lastSeenAt: p.firstSeenAt, ...p,
});

describe("buildHistory", () => {
  it("detects removed and added friends with the interval between lookups", () => {
    const h = buildHistory([
      snap({ firstSeenAt: "2026-01-01T00:00:00Z", lastSeenAt: "2026-01-02T00:00:00Z", friends: [f("a"), f("b")] }),
      snap({ firstSeenAt: "2026-01-05T00:00:00Z", friends: [f("b"), f("c")] }),
    ]);
    const removed = h.friendChanges.filter((c) => c.type === "removed");
    expect(removed.map((c) => c.friend.id)).toEqual(["a"]);
    expect(removed[0]?.between).toBe("2026-01-02T00:00:00Z");
    expect(removed[0]?.and).toBe("2026-01-05T00:00:00Z");
    expect(h.friendChanges.filter((c) => c.type === "added").map((c) => c.friend.id)).toEqual(["c"]);
  });

  it("dedupes repeated looks and keeps mottos newest first", () => {
    const h = buildHistory([
      snap({ firstSeenAt: "2026-01-01T00:00:00Z", figure: "x", motto: "a" }),
      snap({ firstSeenAt: "2026-01-02T00:00:00Z", figure: "y", motto: "b" }),
      snap({ firstSeenAt: "2026-01-03T00:00:00Z", figure: "x", motto: "b" }),
    ]);
    expect(h.looks.map((l) => l.figure).sort()).toEqual(["x", "y"]);
    expect(h.mottos.map((m) => m.motto)).toEqual(["b", "a"]);
  });

  it("ignores private (null) friend lists instead of reporting everyone as removed", () => {
    const h = buildHistory([
      snap({ firstSeenAt: "2026-01-01T00:00:00Z", friends: [f("a")] }),
      snap({ firstSeenAt: "2026-01-02T00:00:00Z", friends: null }),
    ]);
    expect(h.friendChanges).toEqual([]);
  });
});

describe("decideWrite", () => {
  const latest = snap({ firstSeenAt: "2026-01-01T00:00:00Z", lastSeenAt: "2026-01-01T00:00:00Z" });
  const t0 = Date.parse("2026-01-01T00:00:00Z");
  it("skips writes within 30 minutes", () => {
    expect(decideWrite(latest, { ...latest, motto: "novo" }, t0 + 29 * 60_000)).toBe("skip");
  });
  it("inserts after 30 minutes when something changed, touches when not", () => {
    expect(decideWrite(latest, { ...latest, motto: "novo" }, t0 + 31 * 60_000)).toBe("insert");
    expect(decideWrite(latest, latest, t0 + 31 * 60_000)).toBe("touch");
  });
  it("inserts the first snapshot", () => {
    expect(decideWrite(null, latest, t0)).toBe("insert");
  });
});
