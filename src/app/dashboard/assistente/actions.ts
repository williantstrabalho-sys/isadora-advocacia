"use server";

import { requireStaff } from "@/lib/auth";
import { iaDisponivel, chamarIA, type ModeloIA } from "@/lib/ia";

type Tipo = "resumir" | "melhorar" | "redigir";

const CONFIG: Record<Tipo, { system: string; modelo: ModeloIA; max: number }> = {
  resumir: {
    system:
      "Você é um assistente jurídico brasileiro. Resuma o texto a seguir de forma clara e objetiva, destacando partes, prazos, pedidos e as providências necessárias. Responda em português, em tópicos quando fizer sentido.",
    modelo: "economico",
    max: 900,
  },
  melhorar: {
    system:
      "Você é um revisor jurídico brasileiro. Melhore a clareza, a coesão e a correção gramatical do texto, mantendo o sentido e o tom formal. Responda apenas com o texto revisado, em português.",
    modelo: "economico",
    max: 1500,
  },
  redigir: {
    system:
      "Você é um(a) advogado(a) brasileiro(a). Redija um texto jurídico formal a partir das instruções, em português, pronto para revisão humana. Não invente fatos: use [colchetes] para os dados que faltarem.",
    modelo: "avancado",
    max: 2000,
  },
};

export async function assistenteIA(
  formData: FormData
): Promise<{ texto?: string; erro?: string }> {
  await requireStaff();

  // Trava: se IA desligada ou sem chave, não chama a API (custo zero).
  if (!(await iaDisponivel())) {
    return {
      erro:
        "O Assistente de IA está desativado. Ative em Configurações (requer chave de API).",
    };
  }

  const tipo = (String(formData.get("tipo") || "resumir") as Tipo);
  let entrada = String(formData.get("texto") || "").trim();
  if (!entrada) return { erro: "Cole ou escreva um texto primeiro." };

  // Cap de tamanho para controlar custo.
  if (entrada.length > 8000) entrada = entrada.slice(0, 8000);

  const c = CONFIG[tipo] ?? CONFIG.resumir;
  try {
    const texto = await chamarIA({
      system: c.system,
      prompt: entrada,
      modelo: c.modelo,
      maxTokens: c.max,
    });
    return { texto };
  } catch {
    return { erro: "Não foi possível gerar agora. Tente novamente em instantes." };
  }
}
