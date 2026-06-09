"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

function s(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  const t = v ? String(v).trim() : "";
  return t || null;
}

export async function salvarConfig(formData: FormData) {
  const { supabase } = await requireProfile("advogada");

  await supabase.from("configuracoes").upsert(
    {
      id: 1,
      escritorio_nome: s(formData, "escritorio_nome"),
      advogada_nome: s(formData, "advogada_nome"),
      oab: s(formData, "oab"),
      email: s(formData, "email"),
      telefone: s(formData, "telefone"),
      endereco: s(formData, "endereco"),
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  // Atualiza o site público (rodapé, contato, política, etc.)
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/configuracoes");
}
