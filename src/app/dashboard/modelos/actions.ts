"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function salvarModelo(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const payload = {
    nome: String(formData.get("nome") || "").trim(),
    categoria: String(formData.get("categoria") || "").trim() || null,
    conteudo: String(formData.get("conteudo") || ""),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("modelos_documento").update(payload).eq("id", id);
  } else {
    await supabase.from("modelos_documento").insert(payload);
  }
  revalidatePath("/dashboard/modelos");
}

export async function excluirModelo(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  await supabase
    .from("modelos_documento")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/modelos");
}
