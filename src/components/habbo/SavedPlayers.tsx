import { Link } from "@tanstack/react-router";
import { History, Star, Trash2, X } from "lucide-react";

import { HabboImage } from "@/components/habbo/HabboImage";
import { avatarUrl } from "@/lib/habbo/images";
import { useFavorites, useRecentSearches, type SavedPlayer } from "@/lib/local-store";

function Chip({ p, onRemove }: { p: SavedPlayer; onRemove?: () => void }) {
  return (
    <li className="flex items-center gap-1 rounded-full border border-border bg-card pr-1 transition-colors hover:border-primary/50">
      <Link to="/habbo/$hotel/$username" params={{ hotel: p.hotel, username: p.name }} className="flex items-center gap-2 py-1 pl-1 pr-2 text-sm text-foreground">
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-surface">
          <HabboImage src={avatarUrl(p.hotel, { figure: p.figure ?? null, name: p.name, size: "s", headOnly: true })} alt="" width={27} height={30} fallback="avatar" />
        </span>
        {p.name}
      </Link>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remover ${p.name}`} className="rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
    </li>
  );
}

export function SavedPlayers() {
  const recent = useRecentSearches();
  const fav = useFavorites();
  if (recent.items.length === 0 && fav.items.length === 0) return null;
  return (
    <div className="mb-10 space-y-6">
      {fav.items.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Star className="h-3.5 w-3.5 text-primary-soft" /> Favoritos</h2>
          <ul className="flex flex-wrap gap-2">{fav.items.map((p) => <Chip key={p.hotel + p.name} p={p} onRemove={() => fav.remove(p.hotel, p.name)} />)}</ul>
        </div>
      )}
      {recent.items.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><History className="h-3.5 w-3.5" /> Buscas recentes</h2>
            <button onClick={recent.clear} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Trash2 className="h-3 w-3" /> Limpar</button>
          </div>
          <ul className="flex flex-wrap gap-2">{recent.items.map((p) => <Chip key={p.hotel + p.name} p={p} />)}</ul>
        </div>
      )}
    </div>
  );
}
