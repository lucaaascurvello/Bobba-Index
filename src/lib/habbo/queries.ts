import { queryOptions } from "@tanstack/react-query";

import { getBadgeOwnersFn, getCommunityPhotosFn, getPhotosFn, getProfileFn, getUserByNameFn, searchBadgesFn } from "./habbo.functions";
import * as direct from "./api";
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

/** Browser first (Habbo allows CORS from any origin); server fallback on network/blocked. */
export async function viaBrowserThenServer<T>(
  browser: () => Promise<ApiResult<T>>,
  server: () => Promise<ApiResult<T>>,
  isBrowser = typeof window !== "undefined",
): Promise<ApiResult<T>> {
  if (!isBrowser) return server();
  const r = await browser();
  if (!r.ok && (r.error.kind === "network" || r.error.kind === "blocked")) return server();
  return r;
}

const retry = (count: number, err: unknown) =>
  count < 1 && err instanceof HabboError && (err.kind === "network" || err.kind === "timeout");

export const userByNameQuery = (hotel: string, name: string) =>
  queryOptions({
    queryKey: ["habbo", "user", hotel, name.trim().toLowerCase()],
    queryFn: async () => unwrap(await viaBrowserThenServer(() => direct.fetchUserByName(hotel, name), () => getUserByNameFn({ data: { hotel, name } }))),
    staleTime: 5 * 60_000,
    retry,
  });

export const profileQuery = (hotel: string, uniqueId: string) =>
  queryOptions({
    queryKey: ["habbo", "profile", hotel, uniqueId],
    queryFn: async () => unwrap(await viaBrowserThenServer(() => direct.fetchProfile(hotel, uniqueId), () => getProfileFn({ data: { hotel, uniqueId } }))),
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

export const photosQuery = (hotel: string, uniqueId: string) =>
  queryOptions({
    queryKey: ["habbo", "photos", hotel, uniqueId],
    queryFn: async () => unwrap(await viaBrowserThenServer(() => direct.fetchPhotos(hotel, uniqueId), () => getPhotosFn({ data: { hotel, uniqueId } }))),
    staleTime: 10 * 60_000,
    retry,
  });

export const badgeOwnersQuery = (hotel: string, code: string) =>
  queryOptions({
    queryKey: ["badges", "owners", hotel, code],
    queryFn: async () => unwrap(await viaBrowserThenServer(() => direct.fetchBadgeOwners(hotel, code), () => getBadgeOwnersFn({ data: { hotel, code } }))),
    staleTime: 30 * 60_000,
    retry,
  });

export const communityPhotosQuery = (hotel: string) =>
  queryOptions({
    queryKey: ["habbo", "community-photos", hotel],
    queryFn: async () => unwrap(await viaBrowserThenServer(() => direct.fetchCommunityPhotos(hotel), () => getCommunityPhotosFn({ data: { hotel } }))),
    staleTime: 2 * 60_000,
    retry,
  });
