import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { getHistoryFn, recordSnapshotFn } from "./history.functions";
import type { HabboUser } from "./types";

export const historyQuery = (hotel: string, uniqueId: string) =>
  queryOptions({
    queryKey: ["habbo", "history", hotel, uniqueId],
    queryFn: () => getHistoryFn({ data: { hotel, uniqueId } }),
    staleTime: 60_000,
  });

const recorded = new Set<string>();

/** Records a snapshot of this player (once per page session) and returns the recorded history. */
export function usePlayerHistory(user: HabboUser | undefined) {
  const qc = useQueryClient();
  const record = useServerFn(recordSnapshotFn);
  const key = user ? `${user.hotel}:${user.uniqueId}` : "";

  useEffect(() => {
    if (!user || recorded.has(key)) return;
    recorded.add(key);
    record({ data: { hotel: user.hotel, uniqueId: user.uniqueId, name: user.name } })
      .then(() => qc.invalidateQueries({ queryKey: ["habbo", "history", user.hotel, user.uniqueId] }))
      .catch(() => recorded.delete(key));
  }, [key, user, record, qc]);

  return useQuery({ ...historyQuery(user?.hotel ?? "", user?.uniqueId ?? ""), enabled: !!user });
}
