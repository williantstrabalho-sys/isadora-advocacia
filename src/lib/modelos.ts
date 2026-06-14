// ============================================================================
// Motor de preenchimento de modelos de documento.
// Substitui {{variaveis}} pelos dados do cliente/processo/escritório.
// Variáveis desconhecidas ou vazias viram uma linha em branco para preencher.
// ============================================================================

import { areaLabel, tipoAcaoLabel } from "@/lib/areas-config";
import type { ClienteDetalhe, Processo } from "@/lib/types";
import type { SiteConfig } from "@/lib/settings";

export const BLANK = "____________";

/** Lista de variáveis disponíveis (mostrada no editor de modelos). */
export const VARIAVEIS: { token: string; descricao: string }[] = [
  { token: "{{cliente.nome}}", descricao: "Nome / razão social do cliente" },
  { token: "{{cliente.documento}}", descricao: "CPF ou CNPJ do cliente" },
  { token: "{{cliente.endereco}}", descricao: "Endereço do cliente" },
  { token: "{{cliente.email}}", descricao: "E-mail do cliente" },
  { token: "{{cliente.telefone}}", descricao: "Telefone do cliente" },
  { token: "{{processo.numero}}", descricao: "Número CNJ do processo" },
  { token: "{{processo.area}}", descricao: "Área do Direito" },
  { token: "{{processo.tipo}}", descricao: "Tipo de ação" },
  { token: "{{processo.vara}}", descricao: "Vara / juízo" },
  { token: "{{processo.parte_contraria}}", descricao: "Parte contrária" },
  { token: "{{processo.valor_causa}}", descricao: "Valor da causa" },
  { token: "{{advogada.nome}}", descricao: "Nome do(a) advogado(a)" },
  { token: "{{advogada.oab}}", descricao: "OAB do(a) advogado(a)" },
  { token: "{{escritorio.nome}}", descricao: "Nome do escritório" },
  { token: "{{escritorio.endereco}}", descricao: "Endereço do escritório" },
  { token: "{{escritorio.cidade}}", descricao: "Cidade do escritório" },
  { token: "{{data.hoje}}", descricao: "Data por extenso (ex.: Brasília, 13 de junho de 2026)" },
];

function brl(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataPorExtenso(cidade: string): string {
  const d = new Date();
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const local = cidade ? `${cidade.split("/")[0]}, ` : "";
  return `${local}${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

/** Monta o mapa de variáveis a partir dos dados já carregados. */
export function montarContexto(opts: {
  cliente?: ClienteDetalhe | null;
  processo?: Processo | null;
  config: SiteConfig;
}): Record<string, string> {
  const { cliente, processo, config } = opts;
  return {
    "cliente.nome": cliente?.nome ?? "",
    "cliente.documento": cliente?.cpf ?? "",
    "cliente.endereco": cliente?.endereco ?? "",
    "cliente.email": cliente?.email ?? "",
    "cliente.telefone": cliente?.telefone ?? "",
    "processo.numero": processo?.numero_cnj ?? "",
    "processo.area": processo ? areaLabel(processo.area) : "",
    "processo.tipo": processo ? tipoAcaoLabel(processo.tipo_acao, processo.area) : "",
    "processo.vara": processo?.vara ?? "",
    "processo.parte_contraria": processo?.parte_contraria_nome ?? "",
    "processo.valor_causa": brl(processo?.valor_causa),
    "advogada.nome": config.advogada_nome ?? "",
    "advogada.oab": config.oab ?? "",
    "escritorio.nome": config.escritorio_nome ?? "",
    "escritorio.endereco": config.endereco ?? "",
    "escritorio.cidade": config.cidade ?? "",
    "data.hoje": dataPorExtenso(config.cidade ?? ""),
  };
}

/** Substitui as {{variaveis}} no conteúdo; vazias/desconhecidas viram linha em branco. */
export function preencherModelo(conteudo: string, ctx: Record<string, string>): string {
  return conteudo.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, chave: string) => {
    const v = ctx[chave];
    return v && v.trim() ? v : BLANK;
  });
}
