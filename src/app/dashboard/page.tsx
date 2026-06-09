import Link from "next/link";
import {
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle,
  CalendarDays,
  Target,
  Award,
  Timer,
  Trophy,
  FileDown,
  ShieldAlert,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, StatCard, EmptyState } from "@/components/app/ui-bits";
import { TipoAgendaBadge } from "@/components/app/status-badge";
import { BarChartBrand, LineChartBrand } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatData, diasAte } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TIPO_ACAO_LABEL, RESULTADO_LABEL } from "@/lib/constants";
import type {
  Processo,
  Cliente,
  Financeiro,
  AgendaEvento,
  TipoAcaoTrabalhista,
  ProcessoGestao,
  ResultadoProcesso,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const META_MENSAL = 30000; // meta de receita mensal (R$) — ajuste conforme o escritório

function ymKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default async function DashboardVisaoGeral() {
  const { supabase, profile } = await requireProfile("advogada");

  const [
    { data: processos },
    { data: clientes },
    { data: financeiro },
    { data: agenda },
  ] = await Promise.all([
    supabase.from("processos").select("*").returns<Processo[]>(),
    supabase
      .from("clientes")
      .select("id, nome, data_demissao")
      .returns<Pick<Cliente, "id" | "nome" | "data_demissao">[]>(),
    supabase.from("financeiro").select("*").returns<Financeiro[]>(),
    supabase
      .from("agenda")
      .select("*")
      .order("data", { ascending: true })
      .returns<AgendaEvento[]>(),
  ]);

  const { data: gestaoData } = await supabase
    .from("processo_gestao")
    .select("*")
    .returns<ProcessoGestao[]>();

  const procs = processos ?? [];
  const fins = financeiro ?? [];
  const eventos = agenda ?? [];
  const gestoes = gestaoData ?? [];

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const ativos = procs.filter((p) => p.status === "ATIVO").length;
  const encerradosMes = procs.filter(
    (p) =>
      p.status === "ENCERRADO" &&
      new Date(p.created_at) >= inicioMes
  ).length;

  // Receita do mês (honorários pagos no mês corrente)
  const receitaMes = fins
    .filter(
      (f) =>
        f.tipo === "HONORARIO" &&
        f.status === "PAGO" &&
        f.pagamento &&
        new Date(f.pagamento) >= inicioMes
    )
    .reduce((s, f) => s + Number(f.valor), 0);

  // Prazos críticos (próximos 7 dias)
  const prazosCriticos = eventos.filter((e) => {
    const d = diasAte(e.data);
    return d != null && d >= 0 && d <= 7;
  });

  // Agenda do dia
  const hojeKey = formatData(agora);
  const agendaHoje = eventos.filter((e) => formatData(e.data) === hojeKey);

  // Gráfico de barras: processos por tipo
  const porTipo = (Object.keys(TIPO_ACAO_LABEL) as TipoAcaoTrabalhista[])
    .map((tipo) => ({
      tipo: TIPO_ACAO_LABEL[tipo].replace("Trabalhista", "").trim(),
      total: procs.filter((p) => p.tipo_acao === tipo).length,
    }))
    .filter((d) => d.total > 0);

  // Gráfico de linha: receita mensal últimos 6 meses
  const receitaPorMes: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    receitaPorMes[ymKey(d)] = 0;
  }
  fins
    .filter((f) => f.tipo === "HONORARIO" && f.status === "PAGO" && f.pagamento)
    .forEach((f) => {
      const k = ymKey(new Date(f.pagamento!));
      if (k in receitaPorMes) receitaPorMes[k] += Number(f.valor);
    });
  const receitaLinha = Object.entries(receitaPorMes).map(([k, v]) => {
    const [, m] = k.split("-");
    return { mes: MESES[Number(m) - 1], receita: v };
  });

  const pctMeta = Math.min(100, Math.round((receitaMes / META_MENSAL) * 100));

  // ---- Indicadores de gestão (a partir de processo_gestao) ----
  const procById = new Map(procs.map((p) => [p.id, p]));
  const decididos = gestoes.filter((g) => g.resultado !== "EM_ANDAMENTO");
  const exitos = decididos.filter((g) =>
    ["FAVORAVEL", "PARCIAL", "ACORDO"].includes(g.resultado)
  ).length;
  const taxaExito = decididos.length
    ? Math.round((exitos / decididos.length) * 100)
    : null;

  const totalPedido = gestoes.reduce(
    (s, g) => s + (Number(g.valor_pedido) || 0),
    0
  );
  const totalObtido = gestoes.reduce(
    (s, g) => s + (Number(g.valor_sentenca) || 0),
    0
  );
  const aproveitamento =
    totalPedido > 0 ? Math.round((totalObtido / totalPedido) * 100) : null;

  const honorariosExito = gestoes.reduce((s, g) => {
    if (g.valor_sentenca != null && g.honorario_exito_pct != null) {
      return s + (Number(g.valor_sentenca) * Number(g.honorario_exito_pct)) / 100;
    }
    return s;
  }, 0);

  // Tempo médio de tramitação (distribuição → encerramento)
  const temposTramitacao = gestoes
    .filter((g) => g.data_encerramento)
    .map((g) => {
      const p = procById.get(g.processo_id);
      if (!p?.data_distribuicao) return null;
      const dias = Math.round(
        (new Date(g.data_encerramento!).getTime() -
          new Date(p.data_distribuicao).getTime()) /
          86400000
      );
      return dias >= 0 ? dias : null;
    })
    .filter((d): d is number => d != null);
  const tempoMedio = temposTramitacao.length
    ? Math.round(
        temposTramitacao.reduce((a, b) => a + b, 0) / temposTramitacao.length
      )
    : null;

  // Distribuição de desfechos (para o gráfico)
  const desfechos = (
    ["FAVORAVEL", "PARCIAL", "ACORDO", "DESFAVORAVEL"] as ResultadoProcesso[]
  )
    .map((r) => ({
      desfecho: RESULTADO_LABEL[r],
      total: decididos.filter((g) => g.resultado === r).length,
    }))
    .filter((d) => d.total > 0);

  // Aproveitamento por tipo de ação
  const aprovPorTipo = (Object.keys(TIPO_ACAO_LABEL) as TipoAcaoTrabalhista[])
    .map((tipo) => {
      const gs = gestoes.filter(
        (g) => procById.get(g.processo_id)?.tipo_acao === tipo
      );
      const dec = gs.filter((g) => g.resultado !== "EM_ANDAMENTO");
      const ex = dec.filter((g) =>
        ["FAVORAVEL", "PARCIAL", "ACORDO"].includes(g.resultado)
      ).length;
      const ped = gs.reduce((s, g) => s + (Number(g.valor_pedido) || 0), 0);
      const obt = gs.reduce((s, g) => s + (Number(g.valor_sentenca) || 0), 0);
      return {
        tipo,
        label: TIPO_ACAO_LABEL[tipo],
        total: gs.length,
        decididos: dec.length,
        exitoPct: dec.length ? Math.round((ex / dec.length) * 100) : null,
        aprovPct: ped > 0 ? Math.round((obt / ped) * 100) : null,
      };
    })
    .filter((t) => t.total > 0);

  // Alerta de prescrição bienal (art. 7º, XXIX, CF): 2 anos após o fim do contrato
  const PRESC_ALERTA_DIAS = 180;
  const prescricao = (clientes ?? [])
    .filter((c) => c.data_demissao)
    .map((c) => {
      const deadline = new Date(c.data_demissao!);
      deadline.setFullYear(deadline.getFullYear() + 2);
      return { nome: c.nome ?? "—", deadline, dias: diasAte(deadline) };
    })
    .filter((p) => p.dias != null && p.dias <= PRESC_ALERTA_DIAS)
    .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0));

  return (
    <>
      <PageHeader
        titulo={`Visão geral`}
        descricao={`Bem-vinda, ${profile.nome.split(" ")[0]}. Resumo do escritório.`}
        acao={
          <Button asChild variant="outline">
            <Link href="/relatorio/desempenho" target="_blank">
              <FileDown className="h-4 w-4" /> Exportar desempenho
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          titulo="Processos ativos"
          valor={ativos}
          icon={Briefcase}
          hint={`${encerradosMes} encerrado(s) este mês`}
        />
        <StatCard
          titulo="Clientes ativos"
          valor={(clientes ?? []).length}
          icon={Users}
        />
        <StatCard
          titulo="Receita do mês"
          valor={formatBRL(receitaMes)}
          icon={DollarSign}
          hint={`${pctMeta}% da meta (${formatBRL(META_MENSAL)})`}
        />
        <StatCard
          titulo="Prazos críticos (7d)"
          valor={prazosCriticos.length}
          icon={AlertTriangle}
          alerta={prazosCriticos.length > 0}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processos por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {porTipo.length === 0 ? (
              <EmptyState titulo="Sem processos cadastrados" />
            ) : (
              <BarChartBrand data={porTipo} xKey="tipo" barKey="total" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita mensal (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartBrand data={receitaLinha} xKey="mes" lineKey="receita" />
          </CardContent>
        </Card>
      </div>

      {/* ---- Aproveitamento e desfechos (gestão da advogada) ---- */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold">
          Aproveitamento dos processos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            titulo="Taxa de êxito"
            valor={taxaExito != null ? `${taxaExito}%` : "—"}
            icon={Trophy}
            hint={
              decididos.length
                ? `${exitos}/${decididos.length} processos decididos`
                : "Sem processos decididos"
            }
          />
          <StatCard
            titulo="Aproveitamento financeiro"
            valor={aproveitamento != null ? `${aproveitamento}%` : "—"}
            icon={Target}
            hint={`${formatBRL(totalObtido)} de ${formatBRL(totalPedido)}`}
          />
          <StatCard
            titulo="Tempo médio de tramitação"
            valor={tempoMedio != null ? `${tempoMedio} dias` : "—"}
            icon={Timer}
            hint="distribuição → encerramento"
          />
          <StatCard
            titulo="Honorários de êxito (estim.)"
            valor={formatBRL(honorariosExito)}
            icon={Award}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Desfechos dos processos</CardTitle>
            </CardHeader>
            <CardContent>
              {desfechos.length === 0 ? (
                <EmptyState
                  titulo="Sem desfechos registrados"
                  descricao="Registre o resultado dos processos na aba de gestão de cada processo."
                />
              ) : (
                <BarChartBrand data={desfechos} xKey="desfecho" barKey="total" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aproveitamento por tipo de ação</CardTitle>
            </CardHeader>
            <CardContent>
              {aprovPorTipo.length === 0 ? (
                <EmptyState titulo="Sem dados de gestão" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Casos</TableHead>
                      <TableHead>Êxito</TableHead>
                      <TableHead>Aproveit.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aprovPorTipo.map((t) => (
                      <TableRow key={t.tipo}>
                        <TableCell className="text-sm">{t.label}</TableCell>
                        <TableCell className="text-brand-muted">
                          {t.total}
                          {t.decididos > 0 ? ` (${t.decididos} dec.)` : ""}
                        </TableCell>
                        <TableCell>
                          {t.exitoPct != null ? `${t.exitoPct}%` : "—"}
                        </TableCell>
                        <TableCell>
                          {t.aprovPct != null ? `${t.aprovPct}%` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className={prazosCriticos.length ? "border-red-500/30" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Prazos críticos (próximos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prazosCriticos.length === 0 ? (
              <EmptyState titulo="Nenhum prazo crítico" />
            ) : (
              <ul className="space-y-3">
                {prazosCriticos.map((e) => {
                  const d = diasAte(e.data) ?? 0;
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/5 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{e.titulo}</p>
                        <p className="text-xs text-brand-muted">
                          {formatData(e.data)}
                          {e.hora ? ` · ${e.hora.slice(0, 5)}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-red-400">
                        {d === 0 ? "Hoje" : `${d}d`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-accent" />
              Agenda do dia
            </CardTitle>
            <Link
              href="/dashboard/agenda"
              className="text-xs text-brand-accent hover:underline"
            >
              Ver agenda
            </Link>
          </CardHeader>
          <CardContent>
            {agendaHoje.length === 0 ? (
              <EmptyState titulo="Nenhum compromisso hoje" />
            ) : (
              <ul className="space-y-3">
                {agendaHoje.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between border-b border-brand-border pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{e.titulo}</p>
                      <p className="text-xs text-brand-muted">
                        {e.hora ? e.hora.slice(0, 5) : "—"}
                        {e.local ? ` · ${e.local}` : ""}
                      </p>
                    </div>
                    <TipoAgendaBadge tipo={e.tipo} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerta de prescrição bienal */}
      <div className="mt-6">
        <Card
          className={
            prescricao.some((p) => (p.dias ?? 0) <= 60)
              ? "border-red-500/30"
              : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Alerta de prescrição (prazo bienal — art. 7º, XXIX, CF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescricao.length === 0 ? (
              <EmptyState
                titulo="Nenhum prazo de prescrição próximo"
                descricao="Clientes com demissão registrada cujo prazo de 2 anos esteja nos próximos 6 meses aparecerão aqui."
              />
            ) : (
              <ul className="space-y-2">
                {prescricao.map((p, i) => {
                  const vencido = (p.dias ?? 0) < 0;
                  const critico = !vencido && (p.dias ?? 0) <= 60;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center justify-between rounded-md border p-3",
                        vencido
                          ? "border-red-500/40 bg-red-500/10"
                          : critico
                            ? "border-red-500/20 bg-red-500/5"
                            : "border-amber-500/20 bg-amber-500/5"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">{p.nome}</p>
                        <p className="text-xs text-brand-muted">
                          Prazo até {formatData(p.deadline)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          vencido || critico
                            ? "text-red-400"
                            : "text-amber-400"
                        )}
                      >
                        {vencido
                          ? `Vencido há ${Math.abs(p.dias ?? 0)}d`
                          : `${p.dias}d restantes`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
