import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { Chat } from "@/components/app/chat";
import type { Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalMensagens() {
  const { supabase, profile } = await requireProfile("cliente");

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id")
    .returns<Pick<Cliente, "id">[]>();
  const clienteId = clientes?.[0]?.id ?? null;

  return (
    <>
      <PageHeader
        titulo="Mensagens"
        descricao="Canal direto com o escritório. Evite incluir dados sensíveis no corpo das mensagens."
      />
      {clienteId ? (
        <Chat clienteId={clienteId} meuId={profile.id} />
      ) : (
        <EmptyState
          titulo="Conversa indisponível"
          descricao="Sua conta ainda não está vinculada a um cadastro de cliente."
        />
      )}
    </>
  );
}
