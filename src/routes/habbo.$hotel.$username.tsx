import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Award, Camera, Heart, Trophy, CalendarDays, Clock, Gem, Home, Link2, Lock, Sparkles, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { HabboImage } from "@/components/habbo/HabboImage";
import { ErrorPanel, StatePanel } from "@/components/states/StatePanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatNumber } from "@/lib/format";
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
        <div className="flex h-[150px] w-[110px] shrink-0 items-end justify-center rounded-xl border border-border bg-surface">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${user.online ? "bg-success" : "bg-muted-foreground/50"}`} />
                {user.online ? "Online" : "Offline"}
              </span>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">{user.motto ?? <span className="italic opacity-70">Sem missão pública</span>}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Home className="h-4 w-4" />{getHotel(user.hotel)?.name}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{since ? `Membro desde ${since}` : "Registro indisponível"}</span>
            {!user.profileVisible && <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" />Perfil privado</span>}
          </div>
        </div>
        <Button variant="outline" onClick={copy} className="shrink-0"><Link2 className="h-4 w-4" /> Copiar link</Button>
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
            <div className="grid gap-3 sm:grid-cols-2">
              {p.groups.map((g) => (
                <div key={g.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface">
                    {g.badgeCode ? <HabboImage src={groupBadgeUrl(user.hotel, g.badgeCode)} alt={`Emblema do grupo ${g.name}`} width={39} height={39} /> : <Users className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">{g.name}</h3>
                      {g.isAdmin && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-soft">Admin</span>}
                    </div>
                    {g.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.rooms.map((r) => (
                <article key={String(r.id)} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex aspect-[110/110] max-h-44 w-full items-center justify-center bg-surface">
                    {r.thumbnailUrl ? (
                      <HabboImage src={r.thumbnailUrl} alt={`Miniatura do quarto ${r.name}`} className="h-full w-full object-cover" />
                    ) : (
                      <Home className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate font-medium text-foreground">{r.name}</h3>
                    {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {r.rating != null && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{r.rating}</span>}
                      {r.maximumVisitors != null && <span className="flex items-center gap-1"><Users className="h-3 w-3" />até {r.maximumVisitors}</span>}
                      {formatDate(r.creationTime) && <span>Criado em {formatDate(r.creationTime)}</span>}
                    </div>
                    {r.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {r.tags.map((t) => <span key={t} className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-muted-foreground">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ),
        )}
      </TabsContent>

      <TabsContent value="friends" className="mt-6">
        {section((p) =>
          !p.friends ? <Unavailable what="amigos" /> : p.friends.length === 0 ? (
            <StatePanel icon={Users} title="Nenhum amigo público" description="A API não retornou amigos deste jogador." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {p.friends.map((f) => (
                <li key={f.uniqueId}>
                  <Link to="/habbo/$hotel/$username" params={{ hotel: user.hotel, username: f.name }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                      <HabboImage src={avatarUrl(user.hotel, { figure: f.figureString, name: f.name, size: "s", headOnly: true })} alt={`Avatar de ${f.name}`} width={27} height={30} fallback="avatar" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{f.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{f.motto ?? "Sem missão"}</p>
                    </div>
                  </Link>
                </li>
              ))}
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
    { label: "Nível", value: user.currentLevel != null ? String(user.currentLevel) : null, icon: Sparkles },
    { label: "Progresso do nível", value: user.currentLevelCompletePercent != null ? `${user.currentLevelCompletePercent}%` : null, icon: Sparkles },
    { label: "Experiência total", value: user.totalExperience != null ? formatNumber(user.totalExperience) : null, icon: Star },
    { label: "Estrelas de cristal", value: user.starGemCount != null ? formatNumber(user.starGemCount) : null, icon: Gem },
    { label: "Membro desde", value: formatDate(user.memberSince), icon: CalendarDays },
    { label: "Último acesso", value: formatDate(user.lastAccessTime, true), icon: Clock },
  ];
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
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
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
      {badges.map((b) => (
        <li key={b.code}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={b.name ?? b.code}>
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
        <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
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
