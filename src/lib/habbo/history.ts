// Pure history logic: builds "recent looks", "past mottos" and friend changes
// from snapshots we recorded each time a player was looked up.

export interface SnapshotFriend {
  id: string;
  name: string;
  figure: string | null;
}

export interface Snapshot {
  name: string;
  figure: string | null;
  motto: string | null;
  friends: SnapshotFriend[] | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface LookEntry { figure: string; firstSeenAt: string; lastSeenAt: string }
export interface MottoEntry { motto: string | null; from: string; to: string }
export interface FriendChange { friend: SnapshotFriend; type: "added" | "removed"; between: string; and: string }

export interface PlayerHistory {
  trackedSince: string | null;
  snapshotCount: number;
  looks: LookEntry[]; // newest first
  mottos: MottoEntry[]; // newest first
  friendChanges: FriendChange[]; // newest first
}

export const SNAPSHOT_INTERVAL_MS = 30 * 60_000;

export function buildHistory(input: Snapshot[]): PlayerHistory {
  const snaps = [...input].sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt));
  const looks: LookEntry[] = [];
  const mottos: MottoEntry[] = [];
  const friendChanges: FriendChange[] = [];

  for (const s of snaps) {
    if (s.figure) {
      const existing = looks.find((l) => l.figure === s.figure);
      if (existing) existing.lastSeenAt = s.lastSeenAt;
      else looks.push({ figure: s.figure, firstSeenAt: s.firstSeenAt, lastSeenAt: s.lastSeenAt });
    }
    const last = mottos[mottos.length - 1];
    if (last && last.motto === s.motto) last.to = s.lastSeenAt;
    else mottos.push({ motto: s.motto, from: s.firstSeenAt, to: s.lastSeenAt });
  }

  let prev: Snapshot | null = null;
  for (const s of snaps) {
    if (!s.friends) continue;
    if (prev?.friends) {
      const before = new Map(prev.friends.map((f) => [f.id, f]));
      const now = new Map(s.friends.map((f) => [f.id, f]));
      for (const [id, f] of before) if (!now.has(id)) friendChanges.push({ friend: f, type: "removed", between: prev.lastSeenAt, and: s.firstSeenAt });
      for (const [id, f] of now) if (!before.has(id)) friendChanges.push({ friend: f, type: "added", between: prev.lastSeenAt, and: s.firstSeenAt });
    }
    prev = s;
  }

  return {
    trackedSince: snaps[0]?.firstSeenAt ?? null,
    snapshotCount: snaps.length,
    looks: looks.reverse(),
    mottos: mottos.reverse(),
    friendChanges: friendChanges.reverse(),
  };
}

export type WriteDecision = "insert" | "touch" | "skip";

function sameState(a: Omit<Snapshot, "firstSeenAt" | "lastSeenAt">, b: Omit<Snapshot, "firstSeenAt" | "lastSeenAt">) {
  if (a.name !== b.name || a.figure !== b.figure || a.motto !== b.motto) return false;
  // Unknown friend list (private profile) is not treated as a change.
  if (!a.friends || !b.friends) return a.friends === b.friends || !b.friends;
  if (a.friends.length !== b.friends.length) return false;
  const ids = new Set(a.friends.map((f) => f.id));
  return b.friends.every((f) => ids.has(f.id));
}

/** At most one write per player every 30 minutes; unchanged state only extends lastSeenAt. */
export function decideWrite(latest: Snapshot | null, current: Omit<Snapshot, "firstSeenAt" | "lastSeenAt">, now: number): WriteDecision {
  if (!latest) return "insert";
  if (now - Date.parse(latest.lastSeenAt) < SNAPSHOT_INTERVAL_MS) return "skip";
  return sameState(latest, current) ? "touch" : "insert";
}
