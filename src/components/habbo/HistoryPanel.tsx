import { Link } from "@tanstack/react-router";
import { History, MessageSquareQuote, Shirt, UserMinus, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

import { HabboImage } from "@/components/habbo/HabboImage";
import { StatePanel } from "@/components/states/StatePanel";
import type { PlayerHistory } from "@/lib/habbo/history";
import { avatarUrl } from "@/lib/habbo/images";
import { useI18n } from "@/lib/i18n";

function Section({ icon: Icon, title, children }: { icon: typeof History; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Icon className="h-5 w-5 text-primary-soft" /> {title}
      </h3>
      {children}
    </section>
  );
}

export function HistoryPanel({ hotel, history, loading }: { hotel: string; history: PlayerHistory | null | undefined; loading: boolean }) {
  const { t, date } = useI18n();
  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;
  if (!history) return <StatePanel icon={History} title={t("histUnavailable")} description={t("histUnavailableDesc")} />;

  const removed = history.friendChanges.filter((c) => c.type === "removed");
  const added = history.friendChanges.filter((c) => c.type === "added");
  const pastMottos = history.mottos.slice(1);
  const empty = <p className="text-sm text-muted-foreground">{t("histNothingYet")}</p>;

  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/85">
        {history.trackedSince ? t("histTrackedSince", { date: date(history.trackedSince) ?? "" }) : t("histStartsNow")}
      </p>

      <Section icon={Shirt} title={t("histLooks")}>
        {history.looks.length === 0 ? empty : (
          <ul className="stagger grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {history.looks.map((l) => (
              <li key={l.figure} className="lift flex flex-col items-center rounded-lg border border-border bg-surface p-2">
                <HabboImage src={avatarUrl(hotel, { figure: l.figure, size: "m" })} alt={t("histLookAlt")} width={64} height={110} fallback="avatar" className="h-[110px] w-[64px] object-contain" />
                <span className="mt-1 text-[11px] text-muted-foreground">{date(l.firstSeenAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={MessageSquareQuote} title={t("histMottos")}>
        {pastMottos.length === 0 ? empty : (
          <ol className="space-y-2 border-l border-border pl-4">
            {pastMottos.map((m, i) => (
              <li key={i} className="text-sm">
                <p className="text-foreground">{m.motto ?? <span className="italic opacity-70">{t("noMottoShort")}</span>}</p>
                <p className="text-xs text-muted-foreground">{t("histPeriod", { a: date(m.from) ?? "", b: date(m.to) ?? "" })}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section icon={UserMinus} title={t("histRemoved")}>
        <p className="-mt-2 mb-3 text-xs text-muted-foreground">{t("histRemovedNote")}</p>
        {removed.length === 0 ? empty : <FriendList hotel={hotel} items={removed} />}
      </Section>

      <Section icon={UserPlus} title={t("histAdded")}>
        {added.length === 0 ? empty : <FriendList hotel={hotel} items={added} />}
      </Section>
    </div>
  );
}

function FriendList({ hotel, items }: { hotel: string; items: PlayerHistory["friendChanges"] }) {
  const { t, date } = useI18n();
  return (
    <ul className="stagger grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <li key={`${c.friend.id}-${i}`}>
          <Link to="/habbo/$hotel/$username" params={{ hotel, username: c.friend.name }} className="lift flex items-center gap-3 rounded-lg border border-border bg-surface p-2">
            <HabboImage src={avatarUrl(hotel, { figure: c.friend.figure, name: c.friend.name, size: "s", headOnly: true })} alt={t("avatarOf", { name: c.friend.name })} width={40} height={44} fallback="avatar" className="h-11 w-10 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{c.friend.name}</p>
              <p className="text-xs text-muted-foreground">{t("histBetween", { a: date(c.between) ?? "", b: date(c.and) ?? "" })}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HistorySummary({ hotel, history }: { hotel: string; history: PlayerHistory | null | undefined }) {
  const { t } = useI18n();
  if (!history) return null;
  const removed = history.friendChanges.filter((c) => c.type === "removed").length;
  const pastMottos = Math.max(0, history.mottos.length - 1);
  if (history.snapshotCount <= 1 && history.looks.length <= 1) {
    return <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"><History className="h-3 w-3" />{t("histStartedToday")}</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex -space-x-2">
        {history.looks.slice(0, 3).map((l) => (
          <HabboImage key={l.figure} src={avatarUrl(hotel, { figure: l.figure, size: "s", headOnly: true })} alt="" width={28} height={30} fallback="avatar" className="h-[30px] w-7 rounded-full border border-border bg-surface object-contain" />
        ))}
      </span>
      <span>{t("histSumLooks", { n: history.looks.length })}</span>
      <span>{t("histSumMottos", { n: pastMottos })}</span>
      <span>{t("histSumRemoved", { n: removed })}</span>
    </div>
  );
}
