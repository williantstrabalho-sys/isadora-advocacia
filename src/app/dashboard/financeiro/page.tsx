import Link from "next/link";
import { DollarSign, TrendingDown, TrendingUp, Clock, FileDown, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, StatCard, EmptyState } from "@/components/app/ui-bits";
import { StatusFinanceiroBadge } from "@/components/app/status-badge";
import { BarChartBrand } from "@/components/charts/charts";
import { LancamentoForm } from "./lancamento-form";
import { excluirLancamento } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL, formatData, formatCNJ } from "@/lib/format";
import { TIPO_LANCAMENTO_LABEL } from "@/lib/constants";
import { tipoAcaoLabel } from "@/lib/areas-config";
import type { AreaDireito } from "@/lib/areas-config";
import type { Financeiro, Cliente, Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

type LancComProc = Financeiro & {
  processos: { tipo_acao: string; area: AreaDireito } | null;
};

export default async function DashboardFinanceiro() {
  const { supabase } = await requireProfile("advogada");

  const [{ data: lancData }, { data: cliData }, { data: procData }] =
    await Promise.all([
      supabase
        .from("financeiro")
        .select("*, processos(tipo_acao, area)")
        .order("vencimento", { ascending: false })
        .returns<LancComProc[]>(),
      supabase
        .from("clientes")
        .select("id, nome")
        .order("nome")
        .returns<Pick<Cliente, "id" | "nome">[]>(),
      supabase
        .from("processos")
        .select("id, numero_cnj, cliente_id")
        .order("created_at", { ascending: false })
        .returns<Pick<Processo, "id" | "numero_cnj" | "cliente_id">[]>(),
    ]);

  const lancamentos = lancData ?? [];
  const clientes = cliData ?? [];
  const processos = (procData ?? []).map((p) => ({
    id: p.id,
    nome: formatCNJ(p.numero_cnj),
    cliente_id: p.cliente_id,
  }));

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const noMes = (d: string | null) => d != null && new Date(d) >= inicioMes;

  const receitaMes = lancamentos
    .filter((l) => l.tipo === "HONORARIO" && l.status === "PAGO" && noMes(l.pagamento))
    .reduce((s, l) => s + Number(l.valor), 0);
  const despesasMes = lancamentos
    .filter((l) => l.tipo === "DESPESA" && noMes(l.pagamento ?? l.vencimento))
    .reduce((s, l) => s + Number(l.valor), 0);
  const aReceber = lancamentos
    .filter((l) => l.tipo === "HONORARIO" && l.status !== "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const resultado = receitaMes - despesasMes;

  // Receita por tipo de ação (honorários pagos)
  const porTipoMap: Record<string, number> = {};
  lancamentos
    .filter((l) => l.tipo === "HONORARIO" && l.status === "PAGO" && l.processos)
    .forEach((l) => {
      const t = tipoAcaoLabel(l.processos!.tipo_acao, l.processos!.area);
      porTipoMap[t] = (porTipoMap[t] ?? 0) + Number(l.valor);
    });
  const porTipo = Object.entries(porTipoMap).map(([tipo, total]) => ({
    tipo,
    total,
  }));

  return (
    <>
      <PageHeader
        titulo="Financeiro"
        descricao="Lançamentos de honorários, despesas e reembolsos."
        acao={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/relatorio/financeiro" target="_blank">
                <FileDown className="h-4 w-4" /> Extrato PDF
              </Link>
            </Button>
            <LancamentoForm clientes={clientes} processos={processos} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Receita do mês" valor={formatBRL(receitaMes)} icon={TrendingUp} />
        <StatCard titulo="Despesas do mês" valor={formatBRL(despesasMes)} icon={TrendingDown} />
        <StatCard
          titulo="Resultado"
          valor={formatBRL(resultado)}
          icon={DollarSign}
          alerta={resultado < 0}
        />
        <StatCard titulo="A receber" valor={formatBRL(aReceber)} icon={Clock} />
      </div>

      {porTipo.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Receita por tipo de ação</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartBrand data={porTipo} xKey="tipo" barKey="total" />
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        {lancamentos.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            titulo="Nenhum lançamento"
            descricao="Registre o primeiro lançamento financeiro."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.descricao}</TableCell>
                    <TableCell className="text-brand-muted">
                      {TIPO_LANCAMENTO_LABEL[l.tipo]}
                    </TableCell>
                    <TableCell className="text-brand-muted">
                      {formatData(l.vencimento)}
                    </TableCell>
                    <TableCell>{formatBRL(l.valor)}</TableCell>
                    <TableCell>
                      <StatusFinanceiroBadge status={l.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <LancamentoForm
                          clientes={clientes}
                          processos={processos}
                          lancamento={l}
                        />
                        <form action={excluirLancamento}>
                          <input type="hidden" name="id" value={l.id} />
                          <Button type="submit" variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  );
}
