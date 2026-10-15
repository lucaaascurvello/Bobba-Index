import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Award, Camera, Heart, Trophy, CalendarDays, Clock, Gem, Home, Link2, Lock, Sparkles, Star, Users, ExternalLink, Crown, Hourglass } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { HabboImage } from "@/components/habbo/HabboImage";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatAccountAge, formatDate, formatNumber } from "@/lib/format";
import { useFavorites } from "@/lib/local-store";
import { getHotel, isSupportedHotel } from "@/lib/habbo/hotels";
import { avatarUrl, badgeImageUrl, groupBadgeUrl } from "@/lib/habbo/images";
import { HabboError, photosQuery, profileQuery, userByNameQuery } from "@/lib/habbo/queries";
import type { HabboBadge, HabboProfile, HabboUser } from "@/lib/habbo/types";

export const Route = createFileRoute("/habbo/$hotel/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — Bobba Index` },
      { name: "description", content: `Perfil público de ${params.username} no Habbo: avatar, emblemas, grupos e quartos.` },
      { property: "og:title", content: `${params.username} no Bobba Index` },
      { property: "og:description", content: "Perfil público do Habbo, indexado." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { hotel, username } = Route.useParams();
  const router = useRouter();
  const supported = isSupportedHotel(hotel);
  const userQ = useQuery({ ...userByNameQuery(hotel, username), enabled: supported });
  const user = userQ.data;
  const profQ = useQuery({ ...profileQuery(hotel, user?.uniqueId ?? ""), enabled: !!user && user.profileVisible });

  const back = () => {
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/habbos", search: { q: username } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <button onClick={back} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar aos resultados
      </button>

      {!supported ? (
        <StatePanel title="Hotel não suportado" description={`O hotel “${hotel}” ainda não está disponível no Bobba Index.`} />
      ) : userQ.isPending ? (
        <HeaderSkeleton />
      ) : userQ.isError ? (
        userQ.error instanceof HabboError && userQ.error.kind === "not_found" ? (
          <StatePanel
            title="Perfil inexistente"
            description={`Nenhum jogador chamado “${username}” em ${getHotel(hotel)?.name}.`}
            action={<Button asChild variant="outline"><Link to="/habbos">Nova pesquisa</Link></Button>}
          />
        ) : (
          <ErrorPanel error={userQ.error} onRetry={() => userQ.refetch()} />
        )
      ) : user ? (
        <>
          <ProfileHeader user={user} />
          <ProfileTabs user={user} profile={profQ.data} loading={profQ.isPending && user.profileVisible} error={profQ.error} retry={() => profQ.refetch()} />
        </>
      ) : null}
    </div>
  );
}

function ProfileHeader({ user }: { user: HabboUser }) {
  const since = formatDate(user.memberSince);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link do perfil copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
        <div className="relative flex h-[150px] w-[110px] shrink-0 items-end justify-center rounded-xl border border-border bg-surface">
          {user.online !== null && (
            <span title={user.online ? "Online" : "Offline"} className={`absolute right-2 top-2 h-3.5 w-3.5 rounded-full border-2 border-card ${user.online ? "bg-success shadow-[0_0_10px_var(--color-success)]" : "bg-muted-foreground/50"}`} />
          )}
          {user.currentLevel != null && (
            <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 font-pixel text-[10px] text-primary-foreground">Nv {user.currentLevel}</span>
          )}
          <HabboImage
            src={avatarUrl(user.hotel, { figure: user.figureString, name: user.name, size: "l" })}
            alt={`Avatar de ${user.name}`}
            width={64 * 1.5}
            height={110 * 1.25}
            eager
            fallback="avatar"
            className="h-[138px] w-[96px] object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-3xl font-semibold text-foreground sm:text-4xl">{user.name}</h1>
            {user.online !== null && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${user.online ? "border-success/50 bg-success/10 text-success" : "border-border text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.online ? "bg-success" : "bg-muted-foreground/50"}`} />
                {user.online ? "Online" : "Offline"}
              </span>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">{user.motto ?? <span className="italic opacity-70">Sem missão pública</span>}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Home className="h-4 w-4" />{getHotel(user.hotel)?.name}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{since ? `Membro desde ${since}` : "Registro indisponível"}</span>
            {formatAccountAge(user.memberSince) && <span className="flex items-center gap-1.5"><Hourglass className="h-4 w-4" />{formatAccountAge(user.memberSince)}</span>}
            {!user.profileVisible && <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" />Perfil privado</span>}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <FavButton user={user} />
          <Button variant="outline" onClick={copy}><Link2 className="h-4 w-4" /> Copiar link</Button>
        </div>
      </div>
    </section>
  );
}

function HeaderSkeleton() {
  return <div className="h-[214px] animate-pulse rounded-2xl border border-border bg-card" aria-label="Carregando perfil" />;
}

function ProfileTabs({ user, profile, loading, error, retry }: { user: HabboUser; profile: HabboProfile | undefined; loading: boolean; error: unknown; retry: () => void }) {
  const section = (render: (p: HabboProfile) => ReactNode) => {
    if (!user.profileVisible || (error instanceof HabboError && error.kind === "private"))
      return <StatePanel icon={Lock} title="Perfil privado" description="Este jogador ocultou o perfil. A API pública não fornece estes dados." />;
    if (loading) return <GridSkeleton />;
    if (error) return <ErrorPanel error={error} onRetry={retry} />;
    if (!profile) return null;
    return render(profile);
  };
  const count = (n?: number | null) => (n == null ? "" : ` (${n})`);
  return (
    <Tabs defaultValue="overview" className="mt-8">
      <TabsList className="h-auto w-full justify-start overflow-x-auto bg-surface p-1">
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="badges">Emblemas{count(profile?.badges?.length)}</TabsTrigger>
        <TabsTrigger value="groups">Grupos{count(profile?.groups?.length)}</TabsTrigger>
        <TabsTrigger value="rooms">Quartos{count(profile?.rooms?.length)}</TabsTrigger>
        <TabsTrigger value="friends">Amigos{count(profile?.friends?.length)}</TabsTrigger>
        <TabsTrigger value="achievements">Conquistas{count(profile?.badges?.filter((b) => b.code.startsWith("ACH_")).length)}</TabsTrigger>
        <TabsTrigger value="photos">Fotos</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        <Overview user={user} />
      </TabsContent>

      <TabsContent value="badges" className="mt-6">
        {section((p) =>
          !p.badges ? <Unavailable what="emblemas" /> : p.badges.length === 0 ? (
            <StatePanel icon={Award} title="Sem emblemas" description="A API não retornou emblemas para este jogador." />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">Coleção pública de emblemas retornada pelo perfil.</p>
              <BadgeGrid badges={p.badges} />
            </>
          ),
        )}
      </TabsContent>

      <TabsContent value="groups" className="mt-6">
        {section((p) =>
          !p.groups ? <Unavailable what="grupos" /> : p.groups.length === 0 ? (
            <StatePanel icon={Users} title="Nenhum grupo" description="Este jogador não participa de grupos públicos." />
          ) : (
            <div className="stagger grid gap-3 sm:grid-cols-2">
              {p.groups.map((g) => (
                <div key={g.id} className="lift flex gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface">
                    {g.badgeCode ? <HabboImage src={groupBadgeUrl(user.hotel, g.badgeCode)} alt={`Emblema do grupo ${g.name}`} width={39} height={39} /> : <Users className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">{g.name}</h3>
                      {g.isAdmin && <span className="flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-soft"><Crown className="h-3 w-3" />Admin / dono</span>}
                    </div>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{g.description ?? <span className="italic opacity-70">Sem descrição</span>}</p>
                    {g.type && <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground/70">{g.type.toLowerCase()}</p>}
                  </div>
                </div>
              ))}
            </div>
          ),
        )}
      </TabsContent>

      <TabsContent value="rooms" className="mt-6">
        {section((p) =>
          !p.rooms ? <Unavailable what="quartos" /> : p.rooms.length === 0 ? (
            <StatePanel icon={Home} title="Nenhum quarto público" description="A API não retornou quartos deste jogador." />
          ) : (
            <RoomList hotel={user.hotel} rooms={p.rooms} />
          ),
        )}
      </TabsContent>

      <TabsContent value="friends" className="mt-6">
        {section((p) =>
          !p.friends ? <Unavailable what="amigos" /> : p.friends.length === 0 ? (
            <StatePanel icon={Users} title="Nenhum amigo público" description="A API não retornou amigos deste jogador." />
          ) : (
            <ul className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {p.friends.map((f) => <FriendCard key={f.uniqueId} hotel={user.hotel} friend={f} />)}
            </ul>
          ),
        )}
      </TabsContent>

      <TabsContent value="achievements" className="mt-6">
        {section((p) => {
          const ach = (p.badges ?? []).filter((b) => b.code.startsWith("ACH_"));
          return ach.length === 0 ? (
            <StatePanel icon={Trophy} title="Sem conquistas" description="Nenhum emblema de conquista (ACH_) na coleção pública." />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">Emblemas de conquista encontrados na coleção pública.</p>
              <BadgeGrid badges={ach} />
            </>
          );
        })}
      </TabsContent>

      <TabsContent value="photos" className="mt-6">
        <Photos user={user} />
      </TabsContent>
    </Tabs>
  );
}

function Overview({ user }: { user: HabboUser }) {
  const stats: { label: string; value: string | null; icon: typeof Star }[] = [
    { label: "Experiência total", value: user.totalExperience != null ? formatNumber(user.totalExperience) : null, icon: Star },
    { label: "Estrelas de cristal", value: user.starGemCount != null ? formatNumber(user.starGemCount) : null, icon: Gem },
    { label: "Membro desde", value: formatDate(user.memberSince), icon: CalendarDays },
    { label: "Idade da conta", value: formatAccountAge(user.memberSince), icon: Hourglass },
    { label: "Último acesso", value: formatDate(user.lastAccessTime, true), icon: Clock },
  ];
  const pct = user.currentLevelCompletePercent;
  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-[10px] uppercase opacity-80">Nível</span>
            <span className="font-display text-xl font-bold leading-none">{user.currentLevel ?? "?"}</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Progresso até o nível {user.currentLevel != null ? user.currentLevel + 1 : "seguinte"}</span>
              <span className="font-medium text-foreground">{pct != null ? `${pct}%` : "Indisponível"}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={pct ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="shimmer animate-fill h-full rounded-full bg-gradient-to-r from-primary to-primary-soft" style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="lift rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</p>
            <p className={`mt-2 font-display text-xl font-semibold ${s.value ? "text-foreground" : "text-muted-foreground/60"}`}>{s.value ?? "Indisponível"}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-1 font-display text-base font-semibold text-foreground">Emblemas equipados</h2>
        <p className="mb-4 text-xs text-muted-foreground">Os emblemas que o jogador escolheu exibir — não é a coleção completa.</p>
        {user.selectedBadges.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum emblema equipado.</p>
        ) : (
          <BadgeGrid badges={user.selectedBadges} />
        )}
      </div>
    </>
  );
}

function BadgeGrid({ badges }: { badges: HabboBadge[] }) {
  return (
    <ul className="stagger grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
      {badges.map((b) => (
        <li key={b.code}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-card lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={b.name ?? b.code}>
                <HabboImage src={badgeImageUrl(b.code)} alt={b.name ?? b.code} width={40} height={40} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-60">
              <p className="font-medium">{b.name ?? "Sem nome"}</p>
              {b.description && <p className="mt-0.5 text-xs opacity-80">{b.description}</p>}
              <p className="mt-1 font-mono text-[10px] opacity-60">{b.code}</p>
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2" aria-label="Carregando">
      {Array.from({ length: 16 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-card" />)}
    </div>
  );
}

const Unavailable = ({ what }: { what: string }) => (
  <StatePanel title="Dados indisponíveis" description={`A fonte de dados não retornou ${what} para este perfil.`} />
);

function Photos({ user }: { user: HabboUser }) {
  const q = useQuery(photosQuery(user.hotel, user.uniqueId));
  if (q.isPending) return <GridSkeleton />;
  if (q.isError) return <ErrorPanel error={q.error} onRetry={() => q.refetch()} />;
  if (q.data.length === 0) return <StatePanel icon={Camera} title="Nenhuma foto pública" description="Este jogador não tem fotos publicadas." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {q.data.map((p) => (
        <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-border bg-card lift">
          <HabboImage src={p.previewUrl ?? p.url} alt={`Foto de ${user.name}`} className="aspect-[4/3] w-full bg-surface object-cover" />
          <div className="flex justify-between p-3 text-xs text-muted-foreground">
            <span>{formatDate(p.takenAt) ?? "Data indisponível"}</span>
            {p.likes != null && <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</span>}
          </div>
        </a>
      ))}
    </div>
  );
}

function FavButton({ user }: { user: HabboUser }) {
  const fav = useFavorites();
  const on = fav.is(user.hotel, user.name);
  return (
    <Button
      variant="outline"
      aria-pressed={on}
      onClick={() => {
        fav.toggle({ hotel: user.hotel, name: user.name, figure: user.figureString });
        toast.success(on ? "Removido dos favoritos" : "Adicionado aos favoritos");
      }}
    >
      <Star className={`h-4 w-4 ${on ? "fill-primary-soft text-primary-soft" : ""}`} /> {on ? "Favorito" : "Favoritar"}
    </Button>
  );
}

function RoomList({ hotel, rooms }: { hotel: string; rooms: HabboProfile["rooms"] & object }) {
  const [tag, setTag] = useState<string | null>(null);
  const domain = getHotel(hotel)?.domain ?? "www.habbo.com.br";
  const shown = tag ? rooms.filter((r) => r.tags.includes(tag)) : rooms;
  return (
    <>
      {tag && (
        <p className="mb-4 text-sm text-muted-foreground">
          Filtrando por <span className="text-foreground">#{tag}</span> · <button className="text-primary-soft hover:underline" onClick={() => setTag(null)}>limpar</button>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <article key={String(r.id)} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex aspect-[110/110] max-h-44 w-full items-center justify-center bg-surface">
              {r.thumbnailUrl ? <HabboImage src={r.thumbnailUrl} alt={`Miniatura do quarto ${r.name}`} className="h-full w-full object-cover" /> : <Home className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="truncate font-medium text-foreground">{r.name}</h3>
              {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1" title="Avaliação"><Star className="h-3 w-3 fill-primary-soft text-primary-soft" />{r.rating != null ? formatNumber(r.rating) : "—"}</span>
                <span className="flex items-center gap-1" title="Capacidade máxima"><Users className="h-3 w-3" />{r.maximumVisitors != null ? `até ${r.maximumVisitors} visitantes` : "capacidade indisponível"}</span>
                {formatDate(r.creationTime) && <span>Criado em {formatDate(r.creationTime)}</span>}
              </div>
              {r.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <button key={t} onClick={() => setTag(t)} className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${tag === t ? "bg-primary/20 text-primary-soft" : "bg-surface text-muted-foreground hover:text-foreground"}`}>#{t}</button>
                  ))}
                </div>
              )}
              <a href={`https://${domain}/room/${r.id}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary-soft hover:underline">
                Visitar no Habbo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function FriendCard({ hotel, friend: f }: { hotel: string; friend: NonNullable<HabboProfile["friends"]>[number] }) {
  return (
    <li>
      <Link
        to="/habbo/$hotel/$username"
        params={{ hotel, username: f.name }}
        className="lift group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative flex h-32 items-end justify-center overflow-hidden bg-surface">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[image:var(--tile-floor)] opacity-70" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,color-mix(in_oklab,var(--primary)_30%,transparent),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
          <HabboImage
            src={avatarUrl(hotel, { figure: f.figureString, name: f.name, size: "m" })}
            alt={`Avatar de ${f.name}`}
            width={64}
            height={110}
            fallback="avatar"
            className="relative -mb-1 h-[110px] w-[64px] object-contain transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 border-t border-border p-3">
          <p className="truncate font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary-soft">{f.name}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{f.motto ?? <span className="italic opacity-70">Sem missão</span>}</p>
        </div>
      </Link>
    </li>
  );
}
