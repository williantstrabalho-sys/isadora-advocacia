import { FolderOpen, Download } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { DashboardDocUpload } from "./doc-upload";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatData, formatTamanho, formatCNJ } from "@/lib/format";
import type { Documento, Cliente, Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

type DocRow = Documento & {
  clientes: { nome: string } | null;
  processos: { numero_cnj: string } | null;
};

export default async function DashboardDocumentos() {
  const { supabase } = await requireProfile("advogada");

  const [{ data: docsData }, { data: cliData }, { data: procData }] =
    await Promise.all([
      supabase
        .from("documentos")
        .select("*, clientes(nome), processos(numero_cnj)")
        .order("created_at", { ascending: false })
        .returns<DocRow[]>(),
      supabase
        .from("clientes")
        .select("id, nome")
        .order("nome")
        .returns<Pick<Cliente, "id" | "nome">[]>(),
      supabase
        .from("processos")
        .select("id, numero_cnj, cliente_id")
        .returns<Pick<Processo, "id" | "numero_cnj" | "cliente_id">[]>(),
    ]);

  const documentos = docsData ?? [];
  const clientes = cliData ?? [];
  const processos = (procData ?? []).map((p) => ({
    id: p.id,
    nome: formatCNJ(p.numero_cnj),
    cliente_id: p.cliente_id,
  }));

  return (
    <>
      <PageHeader
        titulo="Documentos internos"
        descricao="Todos os documentos do escritório. Downloads usam URLs assinadas (1h)."
      />

      <div className="mb-6">
        <DashboardDocUpload clientes={clientes} processos={processos} />
      </div>

      {documentos.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          titulo="Nenhum documento"
          descricao="Envie documentos vinculados a um cliente."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-brand-accent" />
                    {doc.nome}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {doc.clientes?.nome ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-brand-muted">
                    {doc.processos ? formatCNJ(doc.processos.numero_cnj) : "—"}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {formatTamanho(doc.tamanho)}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {formatData(doc.created_at)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/api/documentos/${doc.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </a>
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
