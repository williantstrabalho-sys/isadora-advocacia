import { createPublicClient } from "@/lib/supabase/public";
import { ESCRITORIO, DEPOIMENTOS } from "@/lib/constants";
import { CONTEUDO_PADRAO, type ConteudoSite } from "@/lib/cms-defaults";
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
    const supabase = createPublicClient();
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

/**
 * Conteúdo da landing (CMS). Mescla os blocos salvos no banco sobre o
 * conteúdo padrão (fallback), por bloco. Nunca lança — sempre retorna algo.
 */
export async function getConteudo(): Promise<ConteudoSite> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_conteudo")
      .select("chave, valor")
      .returns<{ chave: string; valor: Record<string, unknown> }[]>();
    if (!data || data.length === 0) return CONTEUDO_PADRAO;

    const merged: ConteudoSite = structuredClone(CONTEUDO_PADRAO);
    for (const row of data) {
      const chave = row.chave as keyof ConteudoSite;
      if (chave in merged && row.valor && typeof row.valor === "object") {
        // mescla raso: o bloco salvo sobrescreve o padrão
        (merged as Record<string, unknown>)[chave] = {
          ...(merged[chave] as Record<string, unknown>),
          ...(row.valor as Record<string, unknown>),
        };
      }
    }
    return merged;
  } catch {
    return CONTEUDO_PADRAO;
  }
}

export async function getDepoimentos(): Promise<
  Pick<Depoimento, "autor" | "contexto" | "texto">[]
> {
  try {
    const supabase = createPublicClient();
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
