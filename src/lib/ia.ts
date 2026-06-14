// ============================================================================
// Assistente de IA (Claude API). TRAVADO por padrão:
// só funciona se houver ANTHROPIC_API_KEY no ambiente E a flag estiver ativada.
// Sem isso, nenhuma chamada é feita — custo zero.
// ============================================================================

import { createPublicClient } from "@/lib/supabase/public";

export const MODELOS_IA = {
  economico: "claude-haiku-4-5-20251001", // tarefas simples (resumir/melhorar)
  avancado: "claude-sonnet-4-6", // redação mais elaborada
} as const;

export type ModeloIA = keyof typeof MODELOS_IA;

/** Lê a flag de ativação (guardada no CMS, chave "ia"). Não é segredo. */
export async function getIAHabilitada(): Promise<boolean> {
  try {
    const sb = createPublicClient();
    const { data } = await sb
      .from("site_conteudo")
      .select("valor")
      .eq("chave", "ia")
      .maybeSingle<{ valor: { habilitada?: boolean } }>();
    return Boolean(data?.valor?.habilitada);
  } catch {
    return false;
  }
}

/** Existe chave de API configurada no servidor? */
export function temChaveIA(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** IA só está disponível se houver chave E a flag estiver ligada (trava dupla). */
export async function iaDisponivel(): Promise<boolean> {
  return temChaveIA() && (await getIAHabilitada());
}

/** Chamada direta à API da Claude. Lança erro se não houver chave. */
export async function chamarIA(opts: {
  system: string;
  prompt: string;
  modelo?: ModeloIA;
  maxTokens?: number;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("IA não configurada");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODELOS_IA[opts.modelo ?? "economico"],
      max_tokens: opts.maxTokens ?? 1200,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha na IA (${res.status})`);
  }
  const data = await res.json();
  return String(data?.content?.[0]?.text ?? "").trim();
}
