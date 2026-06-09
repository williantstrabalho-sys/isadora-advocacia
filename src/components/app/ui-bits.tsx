import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-1 text-sm text-brand-muted">{descricao}</p>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

export function StatCard({
  titulo,
  valor,
  icon: Icon,
  hint,
  alerta,
}: {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  hint?: string;
  alerta?: boolean;
}) {
  return (
    <Card className={cn(alerta && "border-red-500/40")}>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-brand-muted">{titulo}</p>
          <p
            className={cn(
              "mt-2 font-display text-2xl font-bold",
              alerta ? "text-red-400" : "text-brand-text"
            )}
          >
            {valor}
          </p>
          {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md border",
            alerta
              ? "border-red-500/40 text-red-400"
              : "border-brand-border text-brand-accent"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  titulo,
  descricao,
  icon: Icon,
}: {
  titulo: string;
  descricao?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-surface/50 px-6 py-16 text-center">
      {Icon && <Icon className="h-8 w-8 text-brand-muted" />}
      <p className="mt-3 font-medium text-brand-text">{titulo}</p>
      {descricao && (
        <p className="mt-1 max-w-sm text-sm text-brand-muted">{descricao}</p>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-brand-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-brand-text">{children}</dd>
    </div>
  );
}
