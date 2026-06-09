import { Wallet } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState, StatCard } from "@/components/app/ui-bits";
import { StatusFinanceiroBadge } from "@/components/app/status-badge";
import { DeleteAccount } from "@/components/app/delete-account";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatData } from "@/lib/format";
import type { Financeiro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalHonorarios() {
  const { supabase } = await requireProfile("cliente");

  const { data } = await supabase
    .from("financeiro")
    .select("*")
    .order("vencimento", { ascending: true })
    .returns<Financeiro[]>();
  const lancamentos = data ?? [];

  const pendente = lancamentos
    .filter((l) => l.status !== "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const pago = lancamentos
    .filter((l) => l.status === "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);

  return (
    <>
      <PageHeader
        titulo="Honorários e pagamentos"
        descricao="Extrato das cobranças vinculadas aos seus processos."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard titulo="Em aberto" valor={formatBRL(pendente)} icon={Wallet} />
        <StatCard titulo="Total pago" valor={formatBRL(pago)} icon={Wallet} />
      </div>

      <div className="mt-8">
        {lancamentos.length === 0 ? (
          <EmptyState
            icon={Wallet}
            titulo="Nenhuma cobrança"
            descricao="Não há lançamentos financeiros vinculados à sua conta."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.descricao}</TableCell>
                    <TableCell className="text-brand-muted">
                      {formatData(l.vencimento)}
                    </TableCell>
                    <TableCell>{formatBRL(l.valor)}</TableCell>
                    <TableCell>
                      <StatusFinanceiroBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Privacidade — direito ao esquecimento (LGPD) */}
      <Card className="mt-10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Privacidade e dados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-brand-muted">
            Você pode solicitar a exclusão da sua conta e a desvinculação dos
            seus dados pessoais a qualquer momento, conforme a LGPD.
          </p>
          <DeleteAccount />
        </CardContent>
      </Card>
    </>
  );
}
