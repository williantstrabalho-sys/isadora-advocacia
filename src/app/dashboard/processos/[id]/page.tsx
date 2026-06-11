import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, Lock } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { PageHeader, Field } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { ProcessoForm } from "../processo-form";
import { excluirProcesso, salvarGestao } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCNJ,
  formatData,
  formatDataHora,
  formatBRL,
  diasAte,
} from "@/lib/format";
import {
  TIPO_ACAO_LABEL,
  RESULTADO_LABEL,
  RESULTADO_COLOR,
  RESULTADO_OPTIONS,
} from "@/lib/constants";
import type { Processo, Cliente, ProcessoGestao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardProcessoDetalhe({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, profile } = await requireStaff();
  const isAdmin = profile.role === "advogada";

  const { data: processo } = await supabase
    .from("processos")
    .select("*, clientes(nome)")
    .eq("id", params.id)
    .single<Processo & { clientes: { nome: string } | null }>();

  if (!processo) notFound();

  const { data: gestaoData } = await supabase
    .from("processo_gestao")
    .select("*")
    .eq("processo_id", processo.id)
    .single<ProcessoGestao>();
  const g = gestaoData;

  // Listas de cliente/equipe só para o admin (atribuição).
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

  // Relação pedido x sentença
  const aproveitamento =
    g?.valor_pedido && g.valor_pedido !== 0 && g.valor_sentenca != null
      ? (g.valor_sentenca / g.valor_pedido) * 100
      : null;

  // Honorário de êxito estimado
  const honorarioExito =
    g?.valor_sentenca != null && g.honorario_exito_pct != null
      ? (g.valor_sentenca * g.honorario_exito_pct) / 100
      : null;

  // Tempo de tramitação
  const tramitacaoDias =
    processo.data_distribuicao && g?.data_encerramento
      ? Math.max(
          0,
          Math.round(
            (new Date(g.data_encerramento).getTime() -
              new Date(processo.data_distribuicao).getTime()) /
              86400000
          )
        )
      : processo.data_distribuicao
        ? -(diasAte(processo.data_distribuicao) ?? 0)
        : null;

  return (
    <>
      <Link
        href="/dashboard/processos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <PageHeader
        titulo={TIPO_ACAO_LABEL[processo.tipo_acao]}
        descricao={`${formatCNJ(processo.numero_cnj)} · ${
          processo.clientes?.nome ?? ""
        }`}
        acao={
          <div className="flex items-center gap-2">
            <StatusProcessoBadge status={processo.status} />
            <ProcessoForm
              clientes={clientes}
              processo={processo}
              staff={staff}
              isAdmin={isAdmin}
            />
            {isAdmin && (
              <form action={excluirProcesso}>
                <input type="hidden" name="id" value={processo.id} />
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Cliente">{processo.clientes?.nome ?? "—"}</Field>
              <Field label="Vara">{processo.vara ?? "—"}</Field>
              <Field label="Fase">{processo.fase ?? "—"}</Field>
              <Field label="Distribuição">
                {formatData(processo.data_distribuicao)}
              </Field>
              <Field label="Audiência">
                {processo.data_audiencia
                  ? formatDataHora(processo.data_audiencia)
                  : "—"}
              </Field>
              <Field label="Valor da causa">
                {formatBRL(processo.valor_causa)}
              </Field>
            </dl>
            {processo.pedidos?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-brand-muted">
                  Pedidos
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {processo.pedidos.map((p, i) => (
                    <Badge
                      key={i}
                      className="border-brand-border bg-brand-elevated text-brand-text"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {processo.obs && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-brand-muted">
                  Observações
                </p>
                <p className="mt-1 text-sm text-brand-muted">{processo.obs}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GESTÃO — visível apenas para a advogada */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Gestão do processo
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-border px-2 py-0.5 text-[10px] font-normal text-brand-muted">
                <Lock className="h-3 w-3" /> só você vê
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Resumo */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Valor pedido">{formatBRL(g?.valor_pedido)}</Field>
              <Field label="Valor da sentença">
                {formatBRL(g?.valor_sentenca)}
              </Field>
              <Field label="Aproveitamento">
                {aproveitamento != null ? `${aproveitamento.toFixed(0)}%` : "—"}
              </Field>
              <div>
                <dt className="text-xs uppercase tracking-wider text-brand-muted">
                  Desfecho
                </dt>
                <dd className="mt-1">
                  <Badge
                    className={cn(
                      RESULTADO_COLOR[g?.resultado ?? "EM_ANDAMENTO"]
                    )}
                  >
                    {RESULTADO_LABEL[g?.resultado ?? "EM_ANDAMENTO"]}
                  </Badge>
                </dd>
              </div>
              <Field label="Honorário de êxito estimado">
                {formatBRL(honorarioExito)}
              </Field>
              <Field label="Tempo de tramitação">
                {tramitacaoDias != null ? `${tramitacaoDias} dia(s)` : "—"}
              </Field>
              <Field label="Encerramento">
                {formatData(g?.data_encerramento)}
              </Field>
            </div>

            {/* Formulário de gestão */}
            <form
              action={salvarGestao}
              className="space-y-4 border-t border-brand-border pt-6"
            >
              <input type="hidden" name="processo_id" value={processo.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="valor_pedido">Valor pedido na ação (R$)</Label>
                  <Input
                    id="valor_pedido"
                    name="valor_pedido"
                    type="number"
                    step="0.01"
                    defaultValue={g?.valor_pedido ?? ""}
                    placeholder="Ex.: 45000.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="valor_sentenca">Valor da sentença (R$)</Label>
                  <Input
                    id="valor_sentenca"
                    name="valor_sentenca"
                    type="number"
                    step="0.01"
                    defaultValue={g?.valor_sentenca ?? ""}
                    placeholder="Valor efetivamente decidido"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="resultado">Desfecho</Label>
                  <Select
                    name="resultado"
                    defaultValue={g?.resultado ?? "EM_ANDAMENTO"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESULTADO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data_encerramento">Data de encerramento</Label>
                  <Input
                    id="data_encerramento"
                    name="data_encerramento"
                    type="date"
                    defaultValue={g?.data_encerramento ?? ""}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="honorario_exito_pct">
                    Honorário de êxito (%)
                  </Label>
                  <Input
                    id="honorario_exito_pct"
                    name="honorario_exito_pct"
                    type="number"
                    step="0.1"
                    defaultValue={g?.honorario_exito_pct ?? ""}
                    placeholder="Ex.: 30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="licoes_aprendidas">Lições aprendidas</Label>
                <Textarea
                  id="licoes_aprendidas"
                  name="licoes_aprendidas"
                  rows={4}
                  defaultValue={g?.licoes_aprendidas ?? ""}
                  placeholder="Anotações para ter cuidado em ações futuras (estratégias, provas, riscos)."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Salvar gestão</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
