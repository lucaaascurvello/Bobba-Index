import { AlertTriangle, Ban, Clock, Lock, SearchX, ServerCrash, WifiOff, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { HabboError } from "@/lib/habbo/queries";
import type { HabboErrorKind } from "@/lib/habbo/types";
import { cn } from "@/lib/utils";

const META: Record<HabboErrorKind, { icon: LucideIcon; title: string }> = {
  invalid_input: { icon: AlertTriangle, title: "Entrada inválida" },
  not_found: { icon: SearchX, title: "Nada encontrado" },
  private: { icon: Lock, title: "Perfil privado" },
  rate_limited: { icon: Clock, title: "Limite de consultas atingido" },
  blocked: { icon: Ban, title: "Consulta recusada" },
  timeout: { icon: Clock, title: "Tempo esgotado" },
  network: { icon: WifiOff, title: "Falha de conexão" },
  upstream: { icon: ServerCrash, title: "O Habbo está instável" },
  unsupported_hotel: { icon: Ban, title: "Hotel não suportado" },
};

export function StatePanel({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
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

export function ErrorPanel({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const kind: HabboErrorKind = error instanceof HabboError ? error.kind : "network";
  const meta = META[kind];
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  const retryable = !["not_found", "private", "invalid_input", "unsupported_hotel"].includes(kind);
  return (
    <StatePanel
      icon={meta.icon}
      title={meta.title}
      description={message}
      className={className}
      action={retryable && onRetry ? <Button variant="outline" onClick={onRetry}>Tentar novamente</Button> : undefined}
    />
  );
}
