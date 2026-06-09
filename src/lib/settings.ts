import { createClient } from "@/lib/supabase/server";
import { ESCRITORIO, DEPOIMENTOS } from "@/lib/constants";
import type { Configuracao, Depoimento } from "@/lib/types";

export type SiteConfig = {
  escritorio_nome: string;
  advogada_nome: string;
  oab: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
};

const FALLBACK: SiteConfig = {
  escritorio_nome: ESCRITORIO.nome,
  advogada_nome: ESCRITORIO.advogada,
  oab: ESCRITORIO.oab,
  email: ESCRITORIO.email,
  telefone: ESCRITORIO.telefone,
  endereco: ESCRITORIO.endereco,
  cidade: ESCRITORIO.cidade,
};

/**
 * Lê as configurações do escritório do banco (editáveis pela advogada).
 * Faz fallback para as constantes caso a tabela ainda não exista/esteja vazia,
 * garantindo que o site público nunca quebre.
 */
export async function getConfig(): Promise<SiteConfig> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("id", 1)
      .single<Configuracao>();
    if (!data) return FALLBACK;
    return {
      escritorio_nome: data.escritorio_nome || FALLBACK.escritorio_nome,
      advogada_nome: data.advogada_nome || FALLBACK.advogada_nome,
      oab: data.oab || FALLBACK.oab,
      email: data.email || FALLBACK.email,
      telefone: data.telefone || FALLBACK.telefone,
      endereco: data.endereco || FALLBACK.endereco,
      cidade: ESCRITORIO.cidade,
    };
  } catch {
    return FALLBACK;
  }
}

export async function getDepoimentos(): Promise<
  Pick<Depoimento, "autor" | "contexto" | "texto">[]
> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("depoimentos")
      .select("autor, contexto, texto, publicado, ordem")
      .eq("publicado", true)
      .order("ordem", { ascending: true })
      .returns<Depoimento[]>();
    if (data && data.length) {
      return data.map((d) => ({
        autor: d.autor,
        contexto: d.contexto,
        texto: d.texto,
      }));
    }
  } catch {
    /* fallback abaixo */
  }
  return DEPOIMENTOS.map((d) => ({
    autor: d.autor,
    contexto: d.contexto,
    texto: d.texto,
  }));
}
