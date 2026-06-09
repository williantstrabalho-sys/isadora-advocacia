"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function parseList(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function nullableDate(raw: FormDataEntryValue | null): string | null {
  const v = raw ? String(raw).trim() : "";
  return v || null;
}

export async function salvarProcesso(formData: FormData) {
  const { supabase, profile } = await requireProfile("advogada");

  const id = formData.get("id") ? String(formData.get("id")) : null;

  const payload = {
    advogada_id: profile.id,
    cliente_id: String(formData.get("cliente_id")),
    numero_cnj: String(formData.get("numero_cnj") || "").trim(),
    tipo_acao: String(formData.get("tipo_acao")),
    vara: String(formData.get("vara") || "").trim() || null,
    fase: String(formData.get("fase") || "").trim() || null,
    status: String(formData.get("status") || "ATIVO"),
    valor_causa: formData.get("valor_causa")
      ? Number(formData.get("valor_causa"))
      : null,
    data_distribuicao: nullableDate(formData.get("data_distribuicao")),
    data_audiencia: nullableDate(formData.get("data_audiencia")),
    pedidos: parseList(formData.get("pedidos")),
    obs: String(formData.get("obs") || "").trim() || null,
  };

  if (id) {
    await supabase.from("processos").update(payload).eq("id", id);
  } else {
    await supabase.from("processos").insert(payload);
  }

  revalidatePath("/dashboard/processos");
}

export async function excluirProcesso(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = String(formData.get("id"));
  await supabase.from("processos").delete().eq("id", id);
  revalidatePath("/dashboard/processos");
}

export async function salvarGestao(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const processoId = String(formData.get("processo_id"));

  const numero = (k: string): number | null => {
    const v = formData.get(k);
    const s = v ? String(v).trim() : "";
    return s ? Number(s) : null;
  };

  await supabase.from("processo_gestao").upsert(
    {
      processo_id: processoId,
      valor_pedido: numero("valor_pedido"),
      valor_sentenca: numero("valor_sentenca"),
      resultado: String(formData.get("resultado") || "EM_ANDAMENTO"),
      data_encerramento:
        String(formData.get("data_encerramento") || "").trim() || null,
      honorario_exito_pct: numero("honorario_exito_pct"),
      licoes_aprendidas:
        String(formData.get("licoes_aprendidas") || "").trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "processo_id" }
  );

  revalidatePath(`/dashboard/processos/${processoId}`);
  revalidatePath("/dashboard");
}
