import type { HotelId } from "./hotels";

export type HabboErrorKind =
  | "invalid_input"
  | "not_found"
  | "private"
  | "rate_limited"
  | "blocked"
  | "timeout"
  | "network"
  | "upstream"
  | "unsupported_hotel";

export interface HabboErrorInfo {
  kind: HabboErrorKind;
  message: string;
  status?: number | undefined;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: HabboErrorInfo };

export interface HabboBadge {
  code: string;
  name: string | null;
  description: string | null;
}

export interface HabboUser {
  hotel: HotelId;
  uniqueId: string;
  name: string;
  figureString: string | null;
  motto: string | null;
  online: boolean | null;
  lastAccessTime: string | null;
  memberSince: string | null;
  profileVisible: boolean;
  currentLevel: number | null;
  currentLevelCompletePercent: number | null;
  totalExperience: number | null;
  starGemCount: number | null;
  selectedBadges: (HabboBadge & { badgeIndex: number | null })[];
}

export interface HabboGroup {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  badgeCode: string | null;
  roomId: string | null;
  isAdmin: boolean | null;
}

export interface HabboRoom {
  id: number | string;
  name: string;
  description: string | null;
  creationTime: string | null;
  tags: string[];
  maximumVisitors: number | null;
  rating: number | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
}

export interface HabboFriend {
  uniqueId: string;
  name: string;
  motto: string | null;
  figureString: string | null;
}

export interface HabboProfile {
  user: HabboUser;
  /** null means the source did not return this section (e.g. private profile). */
  badges: HabboBadge[] | null;
  groups: HabboGroup[] | null;
  rooms: HabboRoom[] | null;
  friends: HabboFriend[] | null;
}

export interface CatalogBadge {
  code: string;
  name: string | null;
  description: string | null;
}

export interface BadgeCatalogPage {
  items: CatalogBadge[];
  total: number;
  page: number;
  pageSize: number;
  catalogSize: number;
}

export interface HabboPhoto {
  id: string;
  url: string;
  previewUrl: string | null;
  takenAt: string | null;
  likes: number | null;
}

export interface CommunityPhoto extends HabboPhoto {
  creatorName: string | null;
}
