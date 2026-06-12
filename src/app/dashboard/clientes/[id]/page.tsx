import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, Download, FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Field, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { ClienteForm } from "../cliente-form";
import { ProcessoForm } from "../../processos/processo-form";
import { DashboardDocUpload } from "../../documentos/doc-upload";
import { excluirCliente } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mascararCPF, formatData, formatCNJ, formatTamanho } from "@/lib/format";
import { tipoAcaoLabel, areaLabel } from "@/lib/areas-config";
import type { ClienteDetalhe, Processo, Documento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireProfile("advogada");

  // RPC com descriptografia (respeita RLS)
  const { data: detalheRaw } = await supabase.rpc("cliente_detalhe", {
    p_cliente_id: params.id,
  });
  const detalhe = (detalheRaw ?? []) as ClienteDetalhe[];
  const cliente = detalhe[0];

  if (!cliente) notFound();

  const pj = cliente.tipo_pessoa === "PJ";

  const { data: procs } = await supabase
    .from("processos")
    .select("*")
    .eq("cliente_id", params.id)
    .order("created_at", { ascending: false })
    .returns<Processo[]>();
  const processos = procs ?? [];

  const { data: staffData } = await supabase
    .from("profiles")
    .select("id, nome")
    .in("role", ["advogada", "associado"])
    .order("nome")
    .returns<{ id: string; nome: string }[]>();
  const staff = staffData ?? [];

  const { data: docsData } = await supabase
    .from("documentos")
    .select("*, processos(numero_cnj)")
    .eq("cliente_id", params.id)
    .order("created_at", { ascending: false })
    .returns<(Documento & { processos: { numero_cnj: string } | null })[]>();
  const documentos = docsData ?? [];

  // processos no formato esperado pelo upload (id, nome, cliente_id)
  const processosUpload = processos.map((p) => ({
    id: p.id,
    nome: formatCNJ(p.numero_cnj),
    cliente_id: p.cliente_id,
  }));

  return (
    <>
      <Link
        href="/dashboard/clientes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <PageHeader
        titulo={cliente.nome}
        descricao={pj ? "Pessoa jurídica" : "Pessoa física"}
        acao={
          <div className="flex items-center gap-2">
            <ClienteForm cliente={cliente} />
            <form action={excluirCliente}>
              <input type="hidden" name="id" value={cliente.id} />
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label={pj ? "CNPJ" : "CPF"}>
                {mascararCPF(cliente.cpf)}
              </Field>
              <Field label="E-mail">{cliente.email ?? "—"}</Field>
              <Field label="Telefone">{cliente.telefone ?? "—"}</Field>
              {!pj && (
                <Field label="Nascimento">
                  {formatData(cliente.data_nascimento)}
                </Field>
              )}
              <Field label="Endereço">{cliente.endereco ?? "—"}</Field>
            </dl>
            {cliente.obs && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-brand-muted">
                  Observações
                </p>
                <p className="mt-1 text-sm text-brand-muted">{cliente.obs}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Processos</CardTitle>
            <ProcessoForm
              clientes={[{ id: cliente.id, nome: cliente.nome }]}
              clienteFixoId={cliente.id}
              staff={staff}
              isAdmin
            />
          </CardHeader>
          <CardContent>
            {processos.length === 0 ? (
              <EmptyState titulo="Nenhum processo" descricao="Cadastre o primeiro processo deste cliente." />
            ) : (
              <ul className="divide-y divide-brand-border">
                {processos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/processos/${p.id}`}
                      className="flex items-center justify-between gap-2 py-3 hover:text-brand-accent"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {tipoAcaoLabel(p.tipo_acao, p.area)}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {areaLabel(p.area)} · {formatCNJ(p.numero_cnj)}
                        </p>
                      </div>
                      <StatusProcessoBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Documentos</CardTitle>
          <DashboardDocUpload
            clientes={[{ id: cliente.id, nome: cliente.nome }]}
            processos={processosUpload}
            clienteFixoId={cliente.id}
          />
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <EmptyState
              titulo="Sem documentos"
              descricao="Envie PDFs e, se quiser, vincule a um processo deste cliente."
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
                        {d.processos?.numero_cnj
                          ? ` · ${formatCNJ(d.processos.numero_cnj)}`
                          : ""}
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
    </>
  );
}
