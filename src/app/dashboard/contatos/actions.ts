"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function marcarLido(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = String(formData.get("id"));
  const lido = formData.get("lido") === "true";
  await supabase.from("contatos").update({ lido }).eq("id", id);
  revalidatePath("/dashboard/contatos");
}

export async function excluirContato(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  await supabase
    .from("contatos")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/contatos");
}
