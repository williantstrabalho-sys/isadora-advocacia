import { FileText, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCNJ } from "@/lib/format";
import { ModeloForm } from "./modelo-form";
import { GerarForm } from "./gerar-form";
import { excluirModelo } from "./actions";
import type { ModeloDocumento, Cliente, Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardModelos() {
  const { supabase } = await requireProfile("advogada");

  const [{ data: modData }, { data: cliData }, { data: procData }] =
    await Promise.all([
      supabase
        .from("modelos_documento")
        .select("*")
        .order("nome")
        .returns<ModeloDocumento[]>(),
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

  const modelos = modData ?? [];
  const clientes = cliData ?? [];
  const processos = (procData ?? []).map((p) => ({
    id: p.id,
    nome: formatCNJ(p.numero_cnj),
    cliente_id: p.cliente_id,
  }));

  return (
    <>
      <PageHeader
        titulo="Documentos modelo"
        descricao="Gere procurações, contratos e declarações preenchidos automaticamente com os dados do cliente e do processo."
        acao={<ModeloForm />}
      />

      {/* Gerar documento */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-accent" /> Gerar documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modelos.length === 0 ? (
            <p className="text-sm text-brand-muted">
              Crie um modelo primeiro para poder gerar documentos.
            </p>
          ) : (
            <GerarForm
              modelos={modelos.map((m) => ({ id: m.id, nome: m.nome }))}
              clientes={clientes}
              processos={processos}
            />
          )}
        </CardContent>
      </Card>

      {/* Modelos cadastrados */}
      <h2 className="mb-3 font-display text-lg font-semibold">Modelos disponíveis</h2>
      {modelos.length === 0 ? (
        <EmptyState
          icon={FileText}
          titulo="Nenhum modelo"
          descricao="Crie o primeiro modelo de documento do escritório."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modelos.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-medium">{m.nome}</p>
                  {m.categoria && (
                    <Badge className="border-brand-border bg-brand-elevated text-brand-muted">
                      {m.categoria}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-3 flex-1 whitespace-pre-wrap text-xs text-brand-muted">
                  {m.conteudo.slice(0, 180)}…
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <ModeloForm modelo={m} />
                  <form action={excluirModelo}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
