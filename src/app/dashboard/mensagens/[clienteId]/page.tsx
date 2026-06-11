import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/app/ui-bits";
import { Chat } from "@/components/app/chat";
import type { Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConversaCliente({
  params,
}: {
  params: { clienteId: string };
}) {
  const { supabase, profile } = await requireStaff();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("id", params.clienteId)
    .single<Pick<Cliente, "id" | "nome">>();

  if (!cliente) notFound();

  return (
    <>
      <Link
        href="/dashboard/mensagens"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="h-4 w-4" /> Todas as conversas
      </Link>

      <PageHeader titulo={cliente.nome} descricao="Conversa com o cliente" />

      <Chat clienteId={cliente.id} meuId={profile.id} souAdvogada />
    </>
  );
}
