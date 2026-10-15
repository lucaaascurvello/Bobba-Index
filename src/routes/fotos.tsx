import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Camera, Heart, RefreshCw } from "lucide-react";

import { HabboImage } from "@/components/habbo/HabboImage";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useHotel } from "@/lib/habbo/hotel-context";
import { getHotel } from "@/lib/habbo/hotels";
import { communityPhotosQuery } from "@/lib/habbo/queries";

export const Route = createFileRoute("/fotos")({
  head: () => ({
    meta: [
      { title: "Fotos da comunidade — Bobba Index" },
      { name: "description", content: "As fotos públicas mais recentes tiradas pelos jogadores do Habbo." },
      { property: "og:title", content: "Fotos da comunidade Habbo — Bobba Index" },
      { property: "og:description", content: "Feed ao vivo das fotos públicas do hotel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FotosPage,
});

function FotosPage() {
  const { hotel } = useHotel();
  const q = useQuery(communityPhotosQuery(hotel));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Fotos da comunidade</h1>
          <p className="mt-1 text-sm text-muted-foreground">Últimas fotos públicas tiradas em {getHotel(hotel)?.name}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => q.refetch()} disabled={q.isFetching}>
          <RefreshCw className={`h-4 w-4 ${q.isFetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>
      <div className="mt-8">
        {q.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-card" />)}
          </div>
        ) : q.isError ? (
          <ErrorPanel error={q.error} onRetry={() => q.refetch()} />
        ) : q.data.length === 0 ? (
          <StatePanel icon={Camera} title="Nenhuma foto" description="A API não retornou fotos no momento." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <a href={p.url} target="_blank" rel="noreferrer">
                  <HabboImage src={p.previewUrl ?? p.url} alt={`Foto de ${p.creatorName ?? "jogador"}`} className="aspect-[4/3] w-full bg-surface object-cover" />
                </a>
                <div className="flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground">
                  {p.creatorName ? (
                    <Link to="/habbo/$hotel/$username" params={{ hotel, username: p.creatorName }} className="truncate font-medium text-foreground hover:text-primary-soft">{p.creatorName}</Link>
                  ) : <span>Autor indisponível</span>}
                  <span className="flex shrink-0 items-center gap-3">
                    {formatDate(p.takenAt, true) ?? "Data indisponível"}
                    {p.likes != null && <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</span>}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
