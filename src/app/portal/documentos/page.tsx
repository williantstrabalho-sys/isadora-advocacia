import { FileText, Download } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatData, formatTamanho } from "@/lib/format";
import type { Documento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalDocumentos() {
  const { supabase } = await requireProfile("cliente");

  const { data } = await supabase
    .from("documentos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Documento[]>();
  const documentos = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Documentos"
        descricao="Documentos disponibilizados pelo escritório. Os links de download expiram em 1 hora."
      />

      {documentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          titulo="Nenhum documento"
          descricao="Os documentos disponibilizados pelo escritório aparecerão aqui."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-accent" />
                    {doc.nome}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {doc.tipo ?? "—"}
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
