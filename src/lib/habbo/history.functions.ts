import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database, Json } from "@/integrations/supabase/types";
import { fetchProfile, fetchUserByName } from "./api";
import { buildHistory, decideWrite, type PlayerHistory, type Snapshot, type SnapshotFriend } from "./history";

type Row = Database["public"]["Tables"]["player_snapshots"]["Row"];

function toSnapshot(r: Row): Snapshot {
  return {
    name: r.name,
    figure: r.figure,
    motto: r.motto,
    friends: Array.isArray(r.friends) ? (r.friends as unknown as SnapshotFriend[]) : null,
    firstSeenAt: r.first_seen_at,
    lastSeenAt: r.last_seen_at,
  };
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const input = z.object({ hotel: z.string().max(8), uniqueId: z.string().max(100), name: z.string().max(64) });

/** Re-reads the player from Habbo on the server (never trusts browser data) and stores a snapshot if needed. */
export const recordSnapshotFn = createServerFn({ method: "POST" })
  .inputValidator(input)
  .handler(async ({ data }) => {
    const prof = await fetchProfile(data.hotel, data.uniqueId);
    let current: Omit<Snapshot, "firstSeenAt" | "lastSeenAt">;
    if (prof.ok) {
      const u = prof.data.user;
      current = {
        name: u.name,
        figure: u.figureString,
        motto: u.motto,
        friends: prof.data.friends?.map((f) => ({ id: f.uniqueId, name: f.name, figure: f.figureString })) ?? null,
      };
    } else {
      const u = await fetchUserByName(data.hotel, data.name);
      if (!u.ok || u.data.uniqueId !== data.uniqueId) return { ok: false as const };
      current = { name: u.data.name, figure: u.data.figureString, motto: u.data.motto, friends: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("player_snapshots")
      .select("*")
      .eq("hotel", data.hotel)
      .eq("unique_id", data.uniqueId)
      .order("first_seen_at", { ascending: false })
      .limit(1);
    if (error) { console.error("snapshot read", error); return { ok: false as const }; }
    const latestRow = rows?.[0] ?? null;
    const decision = decideWrite(latestRow ? toSnapshot(latestRow) : null, current, Date.now());
    const now = new Date().toISOString();

    if (decision === "insert") {
      const { error: e } = await supabaseAdmin.from("player_snapshots").insert({
        hotel: data.hotel,
        unique_id: data.uniqueId,
        name: current.name,
        figure: current.figure,
        motto: current.motto,
        friends: (current.friends ?? null) as unknown as Json,
        first_seen_at: now,
        last_seen_at: now,
      });
      if (e) console.error("snapshot insert", e);
    } else if (decision === "touch" && latestRow) {
      const { error: e } = await supabaseAdmin.from("player_snapshots").update({ last_seen_at: now }).eq("id", latestRow.id);
      if (e) console.error("snapshot touch", e);
    }
    return { ok: true as const, decision };
  });

export const getHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), uniqueId: z.string().max(100) }))
  .handler(async ({ data }): Promise<PlayerHistory | null> => {
    const { data: rows, error } = await publicClient()
      .from("player_snapshots")
      .select("*")
      .eq("hotel", data.hotel)
      .eq("unique_id", data.uniqueId)
      .order("first_seen_at", { ascending: true })
      .limit(1000);
    if (error) { console.error("history read", error); return null; }
    return buildHistory((rows ?? []).map(toSnapshot));
  });
