import { AlertTriangle, Ban, Clock, Lock, SearchX, ServerCrash, WifiOff, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { HabboError } from "@/lib/habbo/queries";
import type { HabboErrorKind } from "@/lib/habbo/types";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const META: Record<HabboErrorKind, { icon: LucideIcon; title: TKey }> = {
  invalid_input: { icon: AlertTriangle, title: "errInvalid" },
  not_found: { icon: SearchX, title: "errNotFound" },
  private: { icon: Lock, title: "privateProfile" },
  rate_limited: { icon: Clock, title: "errRate" },
  blocked: { icon: Ban, title: "errBlocked" },
  timeout: { icon: Clock, title: "errTimeout" },
  network: { icon: WifiOff, title: "errNetwork" },
  upstream: { icon: ServerCrash, title: "errUpstream" },
  unsupported_hotel: { icon: Ban, title: "errUnsupported" },
};

export function StatePanel({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon | undefined;
  title: string;
  description?: ReactNode | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center", className)} role="status">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary-soft">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorPanel({ error, onRetry, className }: { error: unknown; onRetry?: (() => void) | undefined; className?: string | undefined }) {
  const { t } = useI18n();
  const kind: HabboErrorKind = error instanceof HabboError ? error.kind : "network";
  const meta = META[kind];
  const message = error instanceof Error ? error.message : t("unexpected");
  const retryable = !["not_found", "private", "invalid_input", "unsupported_hotel"].includes(kind);
  return (
    <StatePanel
      icon={meta.icon}
      title={t(meta.title)}
      description={message}
      className={className}
      action={retryable && onRetry ? <Button variant="outline" onClick={onRetry}>{t("retry")}</Button> : undefined}
    />
  );
}
