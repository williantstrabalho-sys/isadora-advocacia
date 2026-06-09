import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Field, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCNJ, formatData, formatDataHora, formatBRL, formatTamanho } from "@/lib/format";
import { TIPO_ACAO_LABEL } from "@/lib/constants";
import type { Processo, Documento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProcessoDetalhe({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireProfile("cliente");

  const { data: processo } = await supabase
    .from("processos")
    .select("*")
    .eq("id", params.id)
    .single<Processo>();

  if (!processo) notFound();

  const { data: docsData } = await supabase
    .from("documentos")
    .select("*")
    .eq("processo_id", processo.id)
    .order("created_at", { ascending: false })
    .returns<Documento[]>();
  const documentos = docsData ?? [];

  return (
    <>
      <Link
        href="/portal/processos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos processos
      </Link>

      <PageHeader
        titulo={TIPO_ACAO_LABEL[processo.tipo_acao]}
        descricao={formatCNJ(processo.numero_cnj)}
        acao={<StatusProcessoBadge status={processo.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dados do processo</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Vara">{processo.vara ?? "—"}</Field>
              <Field label="Fase">{processo.fase ?? "—"}</Field>
              <Field label="Status">
                <StatusProcessoBadge status={processo.status} />
              </Field>
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
                  {processo.pedidos.map((pedido, i) => (
                    <Badge
                      key={i}
                      className="border-brand-border bg-brand-elevated text-brand-text"
                    >
                      {pedido}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {processo.partes?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-brand-muted">
                  Partes
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {processo.partes.map((parte, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{parte.nome}</span>
                      <span className="text-brand-muted">{parte.papel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documentos do processo</CardTitle>
          </CardHeader>
          <CardContent>
            {documentos.length === 0 ? (
              <EmptyState
                titulo="Sem documentos"
                descricao="Os documentos vinculados a este processo aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-brand-border">
                {documentos.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-2 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-brand-accent" />
                      <div className="min-w-0">
                        <p className="truncate text-sm">{d.nome}</p>
                        <p className="text-xs text-brand-muted">
                          {formatData(d.created_at)} · {formatTamanho(d.tamanho)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/api/documentos/${d.id}`}
                      className="shrink-0 text-brand-accent hover:text-brand-accent-hover"
                      aria-label="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
