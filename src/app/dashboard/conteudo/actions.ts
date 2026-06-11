"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

/**
 * Salva um bloco de conteúdo do site (CMS). `valor` é o JSON do bloco.
 * Revalida a landing e as páginas públicas para refletir na hora.
 */
export async function salvarConteudo(
  chave: string,
  valor: unknown
): Promise<{ ok?: true; error?: string }> {
  const { supabase } = await requireProfile("advogada");

  const { error } = await supabase
    .from("site_conteudo")
    .upsert(
      { chave, valor, atualizado_em: new Date().toISOString() },
      { onConflict: "chave" }
    );

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/conteudo");
  return { ok: true };
}
