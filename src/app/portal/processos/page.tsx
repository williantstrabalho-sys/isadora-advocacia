import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatCNJ } from "@/lib/format";
import { tipoAcaoLabel, areaLabel } from "@/lib/areas-config";
import type { Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalProcessos() {
  const { supabase } = await requireProfile("cliente");

  const { data } = await supabase
    .from("processos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Processo[]>();
  const processos = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Meus processos"
        descricao="Relação dos seus processos em acompanhamento."
      />

      {processos.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          titulo="Nenhum processo encontrado"
          descricao="Você ainda não possui processos vinculados à sua conta."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número CNJ</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo de ação</TableHead>
                <TableHead>Vara</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processos.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-xs">
                    <Link href={`/portal/processos/${p.id}`}>
                      {formatCNJ(p.numero_cnj)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    <Link href={`/portal/processos/${p.id}`}>
                      {areaLabel(p.area)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/portal/processos/${p.id}`}>
                      {tipoAcaoLabel(p.tipo_acao, p.area)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {p.vara ?? "—"}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {p.fase ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusProcessoBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/portal/processos/${p.id}`}>
                      <ChevronRight className="h-4 w-4 text-brand-muted" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
