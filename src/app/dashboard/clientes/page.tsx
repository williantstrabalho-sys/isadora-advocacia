import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { ClienteForm } from "./cliente-form";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardClientes() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone, tipo_pessoa")
    .order("nome")
    .returns<
      Pick<Cliente, "id" | "nome" | "email" | "telefone" | "tipo_pessoa">[]
    >();
  const clientes = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descricao="Cadastro de clientes. CPF/CNPJ é armazenado criptografado. Os processos de cada cliente ficam na ficha dele."
        acao={<ClienteForm />}
      />

      {clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          titulo="Nenhum cliente"
          descricao="Cadastre o primeiro cliente do escritório."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/clientes/${c.id}`}>{c.nome}</Link>
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {c.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {c.telefone ?? "—"}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {c.tipo_pessoa === "PJ" ? "Pessoa jurídica" : "Pessoa física"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/clientes/${c.id}`}>
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
