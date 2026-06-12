"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

export async function responderReuniao(formData: FormData) {
  const { supabase } = await requireProfile("cliente");
  const id = String(formData.get("id"));
  const acao = String(formData.get("acao")); // "acordo" | "ajuste"
  const ajuste = String(formData.get("ajuste") || "").trim();

  await supabase.rpc("agenda_feedback", {
    p_id: id,
    p_de_acordo: acao === "acordo",
    p_ajuste: acao === "ajuste" ? ajuste : null,
  });

  revalidatePath("/portal/reunioes");
}
