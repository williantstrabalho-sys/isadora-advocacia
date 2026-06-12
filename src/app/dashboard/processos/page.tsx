import Link from "next/link";
import { Briefcase, FileDown, ChevronRight } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { ProcessoForm } from "./processo-form";
import { ProcessoFiltros } from "./filtros";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCNJ, formatBRL } from "@/lib/format";
import { tipoAcaoLabel, areaLabel } from "@/lib/areas-config";
import type { Processo, Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProcessoComCliente = Processo & { clientes: { nome: string } | null };

export default async function DashboardProcessos({
  searchParams,
}: {
  searchParams: { status?: string; area?: string; cliente?: string };
}) {
  const { supabase, profile } = await requireStaff();
  const isAdmin = profile.role === "advogada";

  let query = supabase
    .from("processos")
    .select("*, clientes(nome)")
    .order("created_at", { ascending: false });

  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.area) query = query.eq("area", searchParams.area);
  if (searchParams.cliente)
    query = query.eq("cliente_id", searchParams.cliente);

  const { data } = await query.returns<ProcessoComCliente[]>();
  const processos = data ?? [];

  // Clientes e equipe só fazem sentido para o admin (cadastro/atribuição).
  const clientes = isAdmin
    ? (
        await supabase
          .from("clientes")
          .select("id, nome")
          .order("nome")
          .returns<Pick<Cliente, "id" | "nome">[]>()
      ).data ?? []
    : [];
  const staff = isAdmin
    ? (
        await supabase
          .from("profiles")
          .select("id, nome")
          .in("role", ["advogada", "associado"])
          .order("nome")
          .returns<{ id: string; nome: string }[]>()
      ).data ?? []
    : [];

  return (
    <>
      <PageHeader
        titulo={isAdmin ? "Gestão de processos" : "Meus processos"}
        descricao={
          isAdmin
            ? "Cadastro e acompanhamento dos processos do escritório."
            : "Processos direcionados a você."
        }
        acao={
          isAdmin ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/relatorio/processos" target="_blank">
                  <FileDown className="h-4 w-4" /> Exportar PDF
                </Link>
              </Button>
              <ProcessoForm clientes={clientes} staff={staff} isAdmin />
            </div>
          ) : undefined
        }
      />

      {isAdmin && <ProcessoFiltros clientes={clientes} />}

      {processos.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          titulo="Nenhum processo"
          descricao="Cadastre o primeiro processo ou ajuste os filtros."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número CNJ</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vara</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/dashboard/processos/${p.id}`}>
                      {formatCNJ(p.numero_cnj)}
                    </Link>
                  </TableCell>
                  <TableCell>{p.clientes?.nome ?? "—"}</TableCell>
                  <TableCell className="text-brand-muted">
                    {areaLabel(p.area)}
                  </TableCell>
                  <TableCell>{tipoAcaoLabel(p.tipo_acao, p.area)}</TableCell>
                  <TableCell className="text-brand-muted">
                    {p.vara ?? "—"}
                  </TableCell>
                  <TableCell>{formatBRL(p.valor_causa)}</TableCell>
                  <TableCell>
                    <StatusProcessoBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/processos/${p.id}`}>
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
