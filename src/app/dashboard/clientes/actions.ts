"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

function str(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  const s = v ? String(v).trim() : "";
  return s || null;
}

export async function salvarCliente(
  formData: FormData
): Promise<{ ok?: true; error?: string }> {
  const { supabase } = await requireProfile("advogada");

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const cpfDigits = (str(formData, "cpf") ?? "").replace(/\D/g, "") || null;

  const { error } = await supabase.rpc("salvar_cliente", {
    p_id: id,
    p_nome: str(formData, "nome"),
    p_cpf: cpfDigits,
    p_email: str(formData, "email"),
    p_telefone: str(formData, "telefone"),
    p_data_nascimento: str(formData, "data_nascimento"),
    p_endereco: str(formData, "endereco"),
    p_empresa_reclamada: str(formData, "empresa_reclamada"),
    p_ctps: str(formData, "ctps"),
    p_data_admissao: str(formData, "data_admissao"),
    p_data_demissao: str(formData, "data_demissao"),
    p_motivo_demissao: str(formData, "motivo_demissao"),
    p_obs: str(formData, "obs"),
    p_profile_id: str(formData, "profile_id"),
  });

  if (error) {
    return {
      error:
        "Não foi possível salvar o cliente. Detalhe técnico: " + error.message,
    };
  }

  revalidatePath("/dashboard/clientes");
  return { ok: true };
}

export async function excluirCliente(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = String(formData.get("id"));
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/dashboard/clientes");
}
