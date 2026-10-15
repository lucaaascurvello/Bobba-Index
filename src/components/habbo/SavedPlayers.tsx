import { Link } from "@tanstack/react-router";
import { History, Star, Trash2, X } from "lucide-react";
import { useState } from "react";

import { HabboImage } from "@/components/habbo/HabboImage";
import { avatarUrl } from "@/lib/habbo/images";
import { useFavorites, useRecentSearches, type SavedPlayer } from "@/lib/local-store";
import { cn } from "@/lib/utils";

function timeAgo(at: number) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}

function SavedCard({ p, favorite, onRemove }: { p: SavedPlayer; favorite?: boolean; onRemove?: () => void }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <li className={cn("transition-all duration-300 ease-out", leaving && "scale-90 opacity-0")}>
      <div className="lift group relative overflow-hidden rounded-xl border border-border bg-card">
        <Link to="/habbo/$hotel/$username" params={{ hotel: p.hotel, username: p.name }} className="flex items-center gap-3 p-2.5 pr-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="relative flex h-16 w-12 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-surface">
            <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[image:var(--tile-floor)] opacity-70" aria-hidden />
            <HabboImage
              src={avatarUrl(p.hotel, { figure: p.figure ?? null, name: p.name, size: "m", headOnly: true })}
              alt={`Avatar de ${p.name}`}
              width={54}
              height={62}
              fallback="avatar"
              className="relative h-[62px] w-[54px] object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              {favorite && <Star className="h-3 w-3 shrink-0 fill-primary-soft text-primary-soft" />}
              <span className="truncate font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary-soft">{p.name}</span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="rounded border border-border px-1 font-pixel uppercase">{p.hotel}</span>
              {timeAgo(p.at)}
            </span>
          </span>
        </Link>
        {onRemove && (
          <button
            onClick={() => { setLeaving(true); setTimeout(onRemove, 250); }}
            aria-label={`Remover ${p.name}`}
            className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground opacity-60 transition-all hover:bg-surface hover:text-foreground group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

const grid = "stagger grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4";

export function SavedPlayers() {
  const recent = useRecentSearches();
  const fav = useFavorites();
  const [clearing, setClearing] = useState(false);
  if (recent.items.length === 0 && fav.items.length === 0) return null;
  return (
    <div className="animate-fade-up mb-10 space-y-8">
      {fav.items.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-primary-soft" /> Favoritos <span className="text-muted-foreground/60">{fav.items.length}</span>
          </h2>
          <ul className={grid}>{fav.items.map((p) => <SavedCard key={p.hotel + p.name} p={p} favorite onRemove={() => fav.remove(p.hotel, p.name)} />)}</ul>
        </section>
      )}
      {recent.items.length > 0 && (
        <section className={cn("transition-opacity duration-300", clearing && "opacity-0")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"><History className="h-3.5 w-3.5" /> Buscas recentes</h2>
            <button
              onClick={() => { setClearing(true); setTimeout(() => { recent.clear(); setClearing(false); }, 300); }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          </div>
          <ul className={grid}>{recent.items.map((p) => <SavedCard key={p.hotel + p.name} p={p} />)}</ul>
        </section>
      )}
    </div>
  );
}
