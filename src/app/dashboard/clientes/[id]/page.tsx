import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Field, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { ClienteForm } from "../cliente-form";
import { excluirCliente } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mascararCPF, formatData, formatCNJ } from "@/lib/format";
import { TIPO_ACAO_LABEL } from "@/lib/constants";
import type { ClienteDetalhe, Processo } from "@/lib/types";

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

  const { data: procs } = await supabase
    .from("processos")
    .select("*")
    .eq("cliente_id", params.id)
    .order("created_at", { ascending: false })
    .returns<Processo[]>();
  const processos = procs ?? [];

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
        descricao={cliente.email ?? undefined}
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
              <Field label="CPF">{mascararCPF(cliente.cpf)}</Field>
              <Field label="Telefone">{cliente.telefone ?? "—"}</Field>
              <Field label="Nascimento">
                {formatData(cliente.data_nascimento)}
              </Field>
              <Field label="CTPS">{cliente.ctps ?? "—"}</Field>
              <Field label="Empresa reclamada">
                {cliente.empresa_reclamada ?? "—"}
              </Field>
              <Field label="Admissão">
                {formatData(cliente.data_admissao)}
              </Field>
              <Field label="Demissão">
                {formatData(cliente.data_demissao)}
              </Field>
              <Field label="Motivo da demissão">
                {cliente.motivo_demissao ?? "—"}
              </Field>
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
          <CardHeader>
            <CardTitle>Processos vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            {processos.length === 0 ? (
              <EmptyState titulo="Nenhum processo" />
            ) : (
              <ul className="divide-y divide-brand-border">
                {processos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/processos/${p.id}`}
                      className="flex items-center justify-between py-3 hover:text-brand-accent"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {TIPO_ACAO_LABEL[p.tipo_acao]}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {formatCNJ(p.numero_cnj)}
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
    </>
  );
}
