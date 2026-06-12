"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";

function nn(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  const s = v ? String(v).trim() : "";
  return s || null;
}

export async function salvarEvento(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const payload = {
    advogada_id: profile.id,
    cliente_id: nn(formData, "cliente_id"),
    processo_id: nn(formData, "processo_id"),
    tipo: String(formData.get("tipo") || "PRAZO"),
    titulo: String(formData.get("titulo") || "").trim(),
    data: String(formData.get("data")),
    hora: nn(formData, "hora"),
    local: nn(formData, "local"),
    pauta: nn(formData, "pauta"),
    obs: nn(formData, "obs"),
  };

  if (id) {
    await supabase.from("agenda").update(payload).eq("id", id);
  } else {
    await supabase.from("agenda").insert(payload);
  }
  revalidatePath("/dashboard/agenda");
}

export async function excluirEvento(formData: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("agenda").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/agenda");
}
