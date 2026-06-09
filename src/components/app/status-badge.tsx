import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  STATUS_PROCESSO_LABEL,
  STATUS_PROCESSO_COLOR,
  STATUS_FINANCEIRO_LABEL,
  STATUS_FINANCEIRO_COLOR,
  TIPO_AGENDA_LABEL,
  TIPO_AGENDA_COLOR,
} from "@/lib/constants";
import type {
  StatusProcesso,
  StatusFinanceiro,
  TipoAgenda,
} from "@/lib/types";

export function StatusProcessoBadge({ status }: { status: StatusProcesso }) {
  return (
    <Badge className={cn(STATUS_PROCESSO_COLOR[status])}>
      {STATUS_PROCESSO_LABEL[status]}
    </Badge>
  );
}

export function StatusFinanceiroBadge({
  status,
}: {
  status: StatusFinanceiro;
}) {
  return (
    <Badge className={cn(STATUS_FINANCEIRO_COLOR[status])}>
      {STATUS_FINANCEIRO_LABEL[status]}
    </Badge>
  );
}

export function TipoAgendaBadge({ tipo }: { tipo: TipoAgenda }) {
  return (
    <Badge className={cn(TIPO_AGENDA_COLOR[tipo])}>
      {TIPO_AGENDA_LABEL[tipo]}
    </Badge>
  );
}
