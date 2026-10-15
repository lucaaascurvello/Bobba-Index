import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { HabboImage } from "@/components/habbo/HabboImage";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHotel } from "@/lib/habbo/hotel-context";
import { badgeImageUrl } from "@/lib/habbo/images";
import { badgeCatalogQuery, badgeOwnersQuery } from "@/lib/habbo/queries";
import type { CatalogBadge } from "@/lib/habbo/types";
import { useI18n, type TKey } from "@/lib/i18n";

const searchSchema = z.object({
  q: z.string().max(80).optional(),
  type: z.enum(["all", "ach", "other"]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/badges")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Emblemas — Bobba Index" },
      { name: "description", content: "Pesquise emblemas do hotel Habbo selecionado por nome ou código, com imagem e descrição oficiais." },
      { property: "og:title", content: "Explorador de emblemas — Bobba Index" },
      { property: "og:description", content: "Milhares de emblemas do Habbo, indexados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BadgesPage,
});

const TYPES: { id: "all" | "ach" | "other"; key: TKey }[] = [
  { id: "all", key: "typeAll" },
  { id: "ach", key: "typeAch" },
  { id: "other", key: "typeOther" },
];

function BadgesPage() {
  const { q = "", type = "all", page = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/badges" });
  const { hotel } = useHotel();
  const { t, num, date } = useI18n();
  const [input, setInput] = useState(q);
  const [selected, setSelected] = useState<CatalogBadge | null>(null);

  useEffect(() => setInput(q), [q]);
  // Debounced: the catalog supports partial matching, so live search is useful here.
  useEffect(() => {
    if (input === q) return;
    const tm = setTimeout(() => navigate({ search: (s) => ({ ...s, q: input || undefined, page: undefined }), replace: true }), 300);
    return () => clearTimeout(tm);
  }, [input, q, navigate]);

  const query = useQuery({ ...badgeCatalogQuery(hotel, q, type, page), placeholderData: keepPreviousData });
  const data = query.data;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const go = (p: number) => navigate({ search: (s) => ({ ...s, page: p === 1 ? undefined : p }) });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{t("badgesTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("badgesDesc")}</p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="badge-q" className="sr-only">{t("badgesSearch")}</label>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary/60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input id="badge-q" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("badgesPlaceholder")} className="h-11 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none" />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1" role="radiogroup" aria-label={t("codeType")}>
          {TYPES.map((tp) => (
            <button
              key={tp.id}
              role="radio"
              aria-checked={type === tp.id}
              onClick={() => navigate({ search: (s) => ({ ...s, type: tp.id === "all" ? undefined : tp.id, page: undefined }) })}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${type === tp.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t(tp.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-5 text-xs text-muted-foreground">
        {data && t("countOf", { a: num(data.total), b: num(data.catalogSize) })}
        {data?.snapshotAt && <span className="ml-2 text-primary/80">· {t("catalogSnapshot", { date: date(data.snapshotAt) ?? "" })}</span>}
      </div>

      <div className="mt-3">
        {query.isPending ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {Array.from({ length: 18 }).map((_, i) => <div key={i} className="h-[132px] animate-pulse rounded-xl bg-card" />)}
          </div>
        ) : query.isError ? (
          <ErrorPanel error={query.error} onRetry={() => query.refetch()} />
        ) : data && data.items.length === 0 ? (
          <StatePanel icon={Award} title={t("noBadgeFound")} description={t("noBadgeFoundDesc")} />
        ) : data ? (
          <>
            <ul className={`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
              {data.items.map((b) => (
                <li key={b.code}>
                  <button onClick={() => setSelected(b)} className="flex h-full w-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="flex h-12 w-12 items-center justify-center"><HabboImage src={badgeImageUrl(b.code)} alt={b.name ?? b.code} width={40} height={40} /></span>
                    <span className="line-clamp-2 text-xs font-medium text-foreground">{b.name ?? t("noName")}</span>
                    <span className="max-w-full truncate font-mono text-[10px] text-muted-foreground">{b.code}</span>
                  </button>
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-3" aria-label={t("pagination")}>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft className="h-4 w-4" /> {t("prev")}</Button>
                <span className="text-sm text-muted-foreground">{t("pageOf", { a: page, b: num(pages) })}</span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => go(page + 1)}>{t("next")} <ChevronRight className="h-4 w-4" /></Button>
              </nav>
            )}
          </>
        ) : null}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="border-border bg-card">
          {selected && (
            <>
              <DialogHeader>
                <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-surface">
                  <HabboImage src={badgeImageUrl(selected.code)} alt={selected.name ?? selected.code} width={40} height={40} className="scale-150" />
                </div>
                <DialogTitle className="font-display">{selected.name ?? t("noName")}</DialogTitle>
                <DialogDescription>{selected.description ?? t("noDescReg")}</DialogDescription>
              </DialogHeader>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">{t("code")}</dt><dd className="font-mono text-foreground">{selected.code}</dd>
                <Owners hotel={hotel} code={selected.code} />
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Owners({ hotel, code }: { hotel: string; code: string }) {
  const { t, num } = useI18n();
  const q = useQuery(badgeOwnersQuery(hotel, code));
  return (
    <>
      <dt className="text-muted-foreground">{t("owners")}</dt>
      <dd className="text-foreground">
        {q.isPending ? <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface" /> : q.isError ? <span className="text-muted-foreground">{t("unavailable")}</span> : q.data.ownerCount != null ? t("players", { n: num(q.data.ownerCount) }) : <span className="text-muted-foreground">{t("unavailable")}</span>}
      </dd>
    </>
  );
}
