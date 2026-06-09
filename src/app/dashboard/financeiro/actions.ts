"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

function nn(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  const s = v ? String(v).trim() : "";
  return s || null;
}

export async function salvarLancamento(formData: FormData) {
  const { supabase, profile } = await requireProfile("advogada");
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const payload = {
    advogada_id: profile.id,
    cliente_id: nn(formData, "cliente_id"),
    processo_id: nn(formData, "processo_id"),
    descricao: String(formData.get("descricao") || "").trim(),
    tipo: String(formData.get("tipo") || "HONORARIO"),
    valor: Number(formData.get("valor") || 0),
    vencimento: nn(formData, "vencimento"),
    pagamento: nn(formData, "pagamento"),
    status: String(formData.get("status") || "PENDENTE"),
  };

  if (id) {
    await supabase.from("financeiro").update(payload).eq("id", id);
  } else {
    await supabase.from("financeiro").insert(payload);
  }
  revalidatePath("/dashboard/financeiro");
}

export async function excluirLancamento(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  await supabase
    .from("financeiro")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/financeiro");
}
