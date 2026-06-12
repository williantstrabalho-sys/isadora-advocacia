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
  const tipoPessoa = str(formData, "tipo_pessoa") === "PJ" ? "PJ" : "PF";
  // documento: CPF (PF) ou CNPJ (PJ) — guardado criptografado
  const docDigits = (str(formData, "doc") ?? "").replace(/\D/g, "") || null;

  const { error } = await supabase.rpc("salvar_cliente_v2", {
    p_id: id,
    p_nome: str(formData, "nome"),
    p_tipo_pessoa: tipoPessoa,
    p_doc: docDigits,
    p_email: str(formData, "email"),
    p_telefone: str(formData, "telefone"),
    p_data_nascimento: str(formData, "data_nascimento"),
    p_endereco: str(formData, "endereco"),
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
