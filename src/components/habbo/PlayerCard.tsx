import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Lock } from "lucide-react";

import { HabboImage } from "@/components/habbo/HabboImage";
import { getHotel } from "@/lib/habbo/hotels";
import { avatarUrl } from "@/lib/habbo/images";
import type { HabboUser } from "@/lib/habbo/types";
import { useI18n } from "@/lib/i18n";

export function PlayerCard({ user }: { user: HabboUser }) {
  const { t, date } = useI18n();
  const since = date(user.memberSince);
  return (
    <Link
      to="/habbo/$hotel/$username"
      params={{ hotel: user.hotel, username: user.name }}
      className="group relative flex items-center gap-5 overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative flex h-[110px] w-[64px] shrink-0 items-end justify-center overflow-hidden rounded-lg bg-surface">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[image:var(--tile-floor)] opacity-70" aria-hidden />
        <HabboImage
          src={avatarUrl(user.hotel, { figure: user.figureString, name: user.name, size: "m" })}
          alt={t("avatarOf", { name: user.name })}
          width={64}
          height={110}
          eager
          fallback="avatar"
          className="relative h-[110px] w-[64px] object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-xl font-semibold text-foreground">{user.name}</h3>
          <span className="rounded border border-border px-1.5 py-0.5 font-pixel text-[10px] uppercase text-muted-foreground">
            {user.hotel}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {user.motto ?? <span className="italic opacity-70">{t("noMotto")}</span>}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {since ? t("memberSince", { date: since }) : t("noSince")}
          </span>
          <span>{getHotel(user.hotel)?.name}</span>
          {!user.profileVisible && (
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> {t("privateProfile")}</span>
          )}
        </div>
      </div>
      <span className="hidden items-center gap-1 text-sm font-medium text-primary-soft sm:flex">
        {t("openProfile")} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5" aria-hidden>
      <div className="h-[110px] w-[64px] animate-pulse rounded-lg bg-surface" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-surface" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded bg-surface" />
        <div className="h-3 w-48 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}
