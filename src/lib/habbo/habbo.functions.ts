import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchBadgeOwners, fetchCommunityPhotos, fetchPhotos, fetchProfile, fetchUserByName, searchBadgeCatalog, type CatalogStore } from "./api";
import type { CatalogBadge } from "./types";

// Requests go through the server so every hotel call shares one timeout/error policy
// and the 3.9 MB badge texts file is parsed once instead of in each browser.

export const getUserByNameFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), name: z.string().max(64) }))
  .handler(({ data }) => fetchUserByName(data.hotel, data.name));

export const getProfileFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), uniqueId: z.string().max(100) }))
  .handler(({ data }) => fetchProfile(data.hotel, data.uniqueId));

export const searchBadgesFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      hotel: z.string().max(8),
      q: z.string().max(80),
      prefix: z.enum(["all", "ach", "other"]),
      page: z.number().int().min(1).max(10000),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Server-only last-good copy of the public catalog (no user data).
    const store: CatalogStore = {
      async load(hotel) {
        const { data: row } = await supabaseAdmin.from("badge_catalog_snapshots").select("items, fetched_at").eq("hotel", hotel).maybeSingle();
        return row ? { items: row.items as unknown as CatalogBadge[], fetchedAt: row.fetched_at } : null;
      },
      async save(hotel, items) {
        await supabaseAdmin.from("badge_catalog_snapshots").upsert({ hotel, items: items as never, fetched_at: new Date().toISOString() });
      },
    };
    return searchBadgeCatalog(data.hotel, { ...data, pageSize: 60 }, store);
  });

export const getPhotosFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), uniqueId: z.string().max(100) }))
  .handler(({ data }) => fetchPhotos(data.hotel, data.uniqueId));

export const getBadgeOwnersFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), code: z.string().max(64) }))
  .handler(({ data }) => fetchBadgeOwners(data.hotel, data.code));

export const getCommunityPhotosFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8) }))
  .handler(({ data }) => fetchCommunityPhotos(data.hotel));
