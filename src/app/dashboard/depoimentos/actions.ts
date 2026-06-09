"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function salvarDepoimento(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const payload = {
    autor: String(formData.get("autor") || "").trim(),
    contexto: String(formData.get("contexto") || "").trim() || null,
    texto: String(formData.get("texto") || "").trim(),
    publicado: formData.get("publicado") === "on",
    ordem: Number(formData.get("ordem") || 0),
  };

  if (id) {
    await supabase.from("depoimentos").update(payload).eq("id", id);
  } else {
    await supabase.from("depoimentos").insert(payload);
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/depoimentos");
}

export async function excluirDepoimento(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  await supabase
    .from("depoimentos")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/depoimentos");
}
