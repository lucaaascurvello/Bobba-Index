import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, CornerDownLeft, Info, Loader2, Search, SearchX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import hotelImage from "@/assets/complexo-urbano-futurista.webp.asset.json";
import { Button } from "@/components/ui/button";
import { PlayerCard, PlayerCardSkeleton } from "@/components/habbo/PlayerCard";
import { SavedPlayers } from "@/components/habbo/SavedPlayers";
import { HotelMarquee } from "@/components/habbo/HotelMarquee";
import { useRecentSearches } from "@/lib/local-store";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { useHotel } from "@/lib/habbo/hotel-context";
import { getHotel } from "@/lib/habbo/hotels";
import { HabboError, userByNameQuery } from "@/lib/habbo/queries";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/habbos")({
  validateSearch: z.object({ q: z.string().max(64).optional() }),
  head: () => ({
    meta: [
      { title: "Habbos — Bobba Index" },
      { name: "description", content: "Pesquise jogadores dos hotéis Habbo pelo nick e veja avatar, missão e perfil público." },
      { property: "og:title", content: "Explore o universo Habbo — Bobba Index" },
      { property: "og:description", content: "Jogadores, emblemas e histórias em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HabbosPage,
});

function HabbosPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/habbos" });
  const { hotel } = useHotel();
  const { t } = useI18n();
  const [value, setValue] = useState(q ?? "");
  const [touched, setTouched] = useState(false);

  useEffect(() => setValue(q ?? ""), [q]);

  const term = q?.trim() ?? "";
  const query = useQuery({ ...userByNameQuery(hotel, term), enabled: term.length > 0 });
  const recent = useRecentSearches();
  const found = query.data;
  useEffect(() => {
    if (found) recent.add({ hotel: found.hotel, name: found.name, figure: found.figureString });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found?.uniqueId]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const v = value.trim();
    if (!v) return;
    navigate({ search: { q: v } });
  };

  const emptyError = touched && !value.trim();
  const loading = query.isFetching;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <h1 className="font-display text-4xl font-semibold text-foreground sm:text-6xl">
            {t("heroTitle")} <span className="text-primary-soft">Habbo.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t("heroSub")}</p>

          <form onSubmit={submit} role="search" className="mx-auto mt-10 max-w-2xl" noValidate>
            <label htmlFor="nick" className="sr-only">{t("searchLabel")}</label>
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50 ${emptyError ? "border-destructive/70" : "border-border"}`}
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="nick"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                spellCheck={false}
                maxLength={32}
                aria-invalid={emptyError}
                aria-describedby="nick-help"
                className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-lg"
              />
              <kbd className="hidden items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground sm:flex">
                <CornerDownLeft className="h-3 w-3" /> Enter
              </kbd>
              <Button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="hidden sm:inline">{loading ? t("searching") : t("search")}</span>
              </Button>
            </div>
            <p id="nick-help" className={`mt-3 text-xs ${emptyError ? "text-destructive" : "text-muted-foreground"}`}>
              {emptyError ? t("searchEmpty") : t("searchHelp")}
            </p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6" aria-live="polite">
        {!term && <><SavedPlayers /><InitialState /></>}
        {term && query.isPending && <PlayerCardSkeleton />}
        {term && query.isError &&
          (query.error instanceof HabboError && query.error.kind === "not_found" ? (
            <StatePanel
              icon={SearchX}
              title={t("notFoundTitle")}
              description={t("notFoundDesc", { term, hotel: getHotel(hotel)?.name ?? hotel })}
            />
          ) : (
            <ErrorPanel error={query.error} onRetry={() => query.refetch()} />
          ))}
        {term && query.data && (
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">{t("oneResult")}</p>
            <PlayerCard user={query.data} />
          </div>
        )}
      </section>
    </div>
  );
}

function InitialState() {
  const { t } = useI18n();
  return (
    <div>
      <div className="grid items-center gap-10 md:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">{t("howTitle")}</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[t("how1"), t("how2"), t("how3")].map((text, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface font-pixel text-[10px] text-primary-soft">{i + 1}</span>
                {text}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild className="h-auto min-h-10 whitespace-normal py-3">
              <Link to="/about">
                <Info /> {t("howCta")} <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <img src={hotelImage.url} alt={t("howImgAlt")} width={700} height={885} className="animate-drift h-auto w-64 max-w-full" loading="lazy" />
        </div>
      </div>
      <HotelMarquee />
    </div>
  );
}
