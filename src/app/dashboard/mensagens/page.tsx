import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { desde } from "@/lib/format";
import type { Cliente, Mensagem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardMensagens() {
  const { supabase, profile } = await requireProfile("advogada");

  const [{ data: cliData }, { data: msgData }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome")
      .order("nome")
      .returns<Pick<Cliente, "id" | "nome">[]>(),
    supabase
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Mensagem[]>(),
  ]);

  const clientes = cliData ?? [];
  const mensagens = msgData ?? [];

  const resumo = clientes
    .map((c) => {
      const doCliente = mensagens.filter((m) => m.cliente_id === c.id);
      const naoLidas = doCliente.filter(
        (m) => !m.lida && m.remetente_id !== profile.id
      ).length;
      const ultima = doCliente[0];
      return { cliente: c, naoLidas, ultima, total: doCliente.length };
    })
    .sort((a, b) => {
      if (b.naoLidas !== a.naoLidas) return b.naoLidas - a.naoLidas;
      const ta = a.ultima ? new Date(a.ultima.created_at).getTime() : 0;
      const tb = b.ultima ? new Date(b.ultima.created_at).getTime() : 0;
      return tb - ta;
    });

  return (
    <>
      <PageHeader
        titulo="Mensagens"
        descricao="Conversas com todos os clientes do escritório."
      />

      {resumo.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          titulo="Nenhum cliente"
          descricao="Cadastre clientes para iniciar conversas."
        />
      ) : (
        <Card className="divide-y divide-brand-border">
          {resumo.map(({ cliente, naoLidas, ultima }) => (
            <Link
              key={cliente.id}
              href={`/dashboard/mensagens/${cliente.id}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-brand-elevated/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-sm font-medium">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{cliente.nome}</p>
                  <p className="line-clamp-1 max-w-md text-xs text-brand-muted">
                    {ultima ? ultima.conteudo : "Sem mensagens"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {ultima && (
                  <span className="hidden text-xs text-brand-muted sm:block">
                    {desde(ultima.created_at)}
                  </span>
                )}
                {naoLidas > 0 && (
                  <Badge className="border-brand-accent bg-brand-accent text-black">
                    {naoLidas}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-brand-muted" />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
