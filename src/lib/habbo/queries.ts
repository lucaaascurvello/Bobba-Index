import { queryOptions } from "@tanstack/react-query";

import { getProfileFn, getUserByNameFn, searchBadgesFn } from "./habbo.functions";
import type { ApiResult, HabboErrorInfo } from "./types";

export class HabboError extends Error {
  kind: HabboErrorInfo["kind"];
  status?: number | undefined;
  constructor(info: HabboErrorInfo) {
    super(info.message);
    this.kind = info.kind;
    this.status = info.status;
  }
}

function unwrap<T>(r: ApiResult<T>): T {
  if (!r.ok) throw new HabboError(r.error);
  return r.data;
}

const retry = (count: number, err: unknown) =>
  count < 1 && err instanceof HabboError && (err.kind === "network" || err.kind === "timeout");

export const userByNameQuery = (hotel: string, name: string) =>
  queryOptions({
    queryKey: ["habbo", "user", hotel, name.trim().toLowerCase()],
    queryFn: async () => unwrap(await getUserByNameFn({ data: { hotel, name } })),
    staleTime: 5 * 60_000,
    retry,
  });

export const profileQuery = (hotel: string, uniqueId: string) =>
  queryOptions({
    queryKey: ["habbo", "profile", hotel, uniqueId],
    queryFn: async () => unwrap(await getProfileFn({ data: { hotel, uniqueId } })),
    staleTime: 5 * 60_000,
    retry,
  });

export const badgeCatalogQuery = (hotel: string, q: string, prefix: "all" | "ach" | "other", page: number) =>
  queryOptions({
    queryKey: ["badges", hotel, q.trim().toLowerCase(), prefix, page],
    queryFn: async () => unwrap(await searchBadgesFn({ data: { hotel, q, prefix, page } })),
    staleTime: 30 * 60_000,
    retry,
  });
