import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchBadgeOwners, fetchCommunityPhotos, fetchPhotos, fetchProfile, fetchUserByName, searchBadgeCatalog } from "./api";

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
  .handler(({ data }) => searchBadgeCatalog(data.hotel, { ...data, pageSize: 60 }));

export const getPhotosFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), uniqueId: z.string().max(100) }))
  .handler(({ data }) => fetchPhotos(data.hotel, data.uniqueId));

export const getBadgeOwnersFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8), code: z.string().max(64) }))
  .handler(({ data }) => fetchBadgeOwners(data.hotel, data.code));

export const getCommunityPhotosFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ hotel: z.string().max(8) }))
  .handler(({ data }) => fetchCommunityPhotos(data.hotel));
