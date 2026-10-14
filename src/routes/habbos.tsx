import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, CornerDownLeft, Info, Loader2, Search, SearchX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { PixelScene } from "@/components/brand/PixelScene";
import { PlayerCard, PlayerCardSkeleton } from "@/components/habbo/PlayerCard";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { useHotel } from "@/lib/habbo/hotel-context";
import { getHotel } from "@/lib/habbo/hotels";
import { HabboError, userByNameQuery } from "@/lib/habbo/queries";

export const Route = createFileRoute("/habbos")({
  validateSearch: z.object({ q: z.string().max(64).optional() }),
  head: () => ({
    meta: [
      { title: "Habbos — Bobba Index" },
      { name: "description", content: "Pesquise jogadores do Habbo Brasil pelo nick e veja avatar, missão e perfil público." },
      { property: "og:title", content: "Explore o universo Habbo — Bobba Index" },
      { property: "og:description", content: "Jogadores, emblemas e histórias em um só lugar." },
    ],
  }),
  component: HabbosPage,
});

function HabbosPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/habbos" });
  const { hotel } = useHotel();
  const [value, setValue] = useState(q ?? "");
  const [touched, setTouched] = useState(false);

  useEffect(() => setValue(q ?? ""), [q]);

  const term = q?.trim() ?? "";
  const query = useQuery({ ...userByNameQuery(hotel, term), enabled: term.length > 0 });

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
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 font-pixel text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 bg-success" /> {getHotel(hotel)?.name}
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Explore o universo <span className="text-primary-soft">Habbo.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">Jogadores, emblemas e histórias em um só lugar.</p>

          <form onSubmit={submit} role="search" className="mx-auto mt-10 max-w-2xl" noValidate>
            <label htmlFor="nick" className="sr-only">Nick do jogador</label>
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-glow transition-colors focus-within:border-primary/70 ${emptyError ? "border-destructive/70" : "border-border"}`}
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="nick"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Digite o nick de um jogador..."
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
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="hidden sm:inline">{loading ? "Buscando" : "Pesquisar"}</span>
              </button>
            </div>
            <p id="nick-help" className={`mt-3 text-xs ${emptyError ? "text-destructive" : "text-muted-foreground"}`}>
              {emptyError
                ? "Digite um nick antes de pesquisar."
                : "A busca usa a API pública oficial e encontra o nick exato (maiúsculas não importam)."}
            </p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6" aria-live="polite">
        {!term && <InitialState />}
        {term && query.isPending && <PlayerCardSkeleton />}
        {term && query.isError &&
          (query.error instanceof HabboError && query.error.kind === "not_found" ? (
            <StatePanel
              icon={SearchX}
              title="Nenhum jogador encontrado"
              description={<>Não existe um jogador com o nick exato “{term}” em {getHotel(hotel)?.name}. Confira a grafia — buscas parciais não são suportadas pela API.</>}
            />
          ) : (
            <ErrorPanel error={query.error} onRetry={() => query.refetch()} />
          ))}
        {term && query.data && (
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">1 resultado exato</p>
            <PlayerCard user={query.data} />
          </div>
        )}
      </section>
    </div>
  );
}

function InitialState() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Como funciona</h2>
        <ol className="space-y-3 text-sm text-muted-foreground">
          {[
            "Digite o nick exato de um jogador do hotel selecionado.",
            "Consultamos a API pública do Habbo em tempo real — nada é inventado.",
            "Abra o perfil para ver emblemas, grupos e quartos públicos.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface font-pixel text-[10px] text-primary-soft">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/badges" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-primary/50">
            <Award className="h-4 w-4 text-primary-soft" /> Explorar emblemas
          </Link>
          <Link to="/about" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-primary/50">
            <Info className="h-4 w-4 text-primary-soft" /> Sobre os dados
          </Link>
        </div>
      </div>
      <div className="hidden justify-center md:flex"><PixelScene /></div>
    </div>
  );
}
