import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { HabboImage } from "@/components/habbo/HabboImage";
import { StatePanel } from "@/components/states/StatePanel";
import { Button } from "@/components/ui/button";
import { accountAgeDays, formatAccountAge, formatNumber } from "@/lib/format";
import { useHotel } from "@/lib/habbo/hotel-context";
import { avatarUrl } from "@/lib/habbo/images";
import { HabboError, profileQuery, userByNameQuery } from "@/lib/habbo/queries";

export const Route = createFileRoute("/comparar")({
  validateSearch: z.object({ a: z.string().max(64).optional(), b: z.string().max(64).optional() }),
  head: () => ({
    meta: [
      { title: "Comparar jogadores — Bobba Index" },
      { name: "description", content: "Compare dois jogadores do Habbo lado a lado: nível, XP, idade da conta, emblemas, amigos, grupos e quartos." },
      { property: "og:title", content: "Comparador de jogadores Habbo — Bobba Index" },
      { property: "og:description", content: "Dois nicks, lado a lado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComparePage,
});

type Row = { label: string; value: number | null; display: string | null };

function usePlayer(hotel: string, name: string) {
  const u = useQuery({ ...userByNameQuery(hotel, name), enabled: !!name });
  const p = useQuery({ ...profileQuery(hotel, u.data?.uniqueId ?? ""), enabled: !!u.data?.profileVisible });
  const user = u.data;
  const prof = p.data;
  const n = (v: number | null | undefined) => (v == null ? null : v);
  const rows: Row[] = user
    ? [
        { label: "Nível", value: n(user.currentLevel), display: user.currentLevel != null ? String(user.currentLevel) : null },
        { label: "XP total", value: n(user.totalExperience), display: user.totalExperience != null ? formatNumber(user.totalExperience) : null },
        { label: "Idade da conta", value: accountAgeDays(user.memberSince), display: formatAccountAge(user.memberSince) },
        { label: "Emblemas", value: n(prof?.badges?.length), display: prof?.badges ? formatNumber(prof.badges.length) : null },
        { label: "Amigos", value: n(prof?.friends?.length), display: prof?.friends ? formatNumber(prof.friends.length) : null },
        { label: "Grupos", value: n(prof?.groups?.length), display: prof?.groups ? formatNumber(prof.groups.length) : null },
        { label: "Quartos", value: n(prof?.rooms?.length), display: prof?.rooms ? formatNumber(prof.rooms.length) : null },
      ]
    : [];
  return { u, user, rows, profLoading: !!user?.profileVisible && p.isPending };
}

function ComparePage() {
  const { a = "", b = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/comparar" });
  const { hotel } = useHotel();
  const [va, setA] = useState(a);
  const [vb, setB] = useState(b);
  useEffect(() => { setA(a); setB(b); }, [a, b]);
  const A = usePlayer(hotel, a);
  const B = usePlayer(hotel, b);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ search: { a: va.trim() || undefined, b: vb.trim() || undefined } });
  };
  const input = "h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground/70 focus:border-primary/70 focus:outline-none";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Comparar jogadores</h1>
      <p className="mt-1 text-sm text-muted-foreground">Digite dois nicks exatos para ver os dados lado a lado.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input aria-label="Primeiro nick" value={va} onChange={(e) => setA(e.target.value)} placeholder="Primeiro nick" maxLength={32} className={input} />
        <input aria-label="Segundo nick" value={vb} onChange={(e) => setB(e.target.value)} placeholder="Segundo nick" maxLength={32} className={input} />
        <Button type="submit" className="h-11"><Scale className="h-4 w-4" /> Comparar</Button>
      </form>

      {!a || !b ? (
        <div className="mt-10"><StatePanel icon={Scale} title="Escolha dois jogadores" description="Os dados vêm da API pública do Habbo. Perfis privados mostram apenas nível, XP e idade." /></div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border">
            <div />
            <Head p={A} name={a} hotel={hotel} />
            <Head p={B} name={b} hotel={hotel} />
          </div>
          {(A.rows.length ? A.rows : B.rows).map((r, i) => {
            const ra = A.rows[i];
            const rb = B.rows[i];
            const win = (x?: Row, y?: Row) => x?.value != null && y?.value != null && x.value > y.value;
            return (
              <div key={r.label} className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/60 text-sm last:border-0">
                <div className="p-3 text-muted-foreground">{r.label}</div>
                <Cell row={ra} win={win(ra, rb)} loading={A.profLoading && i >= 3} />
                <Cell row={rb} win={win(rb, ra)} loading={B.profLoading && i >= 3} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Head({ p, name, hotel }: { p: ReturnType<typeof usePlayer>; name: string; hotel: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 text-center">
      <div className="flex h-[110px] w-[64px] items-end justify-center">
        {p.user && <HabboImage src={avatarUrl(hotel, { figure: p.user.figureString, name: p.user.name, size: "m" })} alt={`Avatar de ${p.user.name}`} width={64} height={110} fallback="avatar" />}
      </div>
      {p.user ? (
        <Link to="/habbo/$hotel/$username" params={{ hotel, username: p.user.name }} className="font-display font-semibold text-foreground hover:text-primary-soft">{p.user.name}</Link>
      ) : p.u.isPending ? (
        <span className="h-4 w-20 animate-pulse rounded bg-surface" />
      ) : (
        <span className="text-xs text-destructive">{p.u.error instanceof HabboError && p.u.error.kind === "not_found" ? `“${name}” não encontrado` : "Erro ao carregar"}</span>
      )}
    </div>
  );
}

function Cell({ row, win, loading }: { row: Row | undefined; win: boolean; loading: boolean }) {
  if (loading) return <div className="p-3"><span className="inline-block h-4 w-12 animate-pulse rounded bg-surface" /></div>;
  return (
    <div className={`p-3 text-center ${win ? "font-semibold text-success" : row?.display ? "text-foreground" : "text-muted-foreground/60"}`}>
      {row?.display ?? "Indisponível"}
    </div>
  );
}
