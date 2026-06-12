// ============================================================================
// Configuração das áreas do Direito (multi-área).
// Cada área define: rótulos das partes, tipos de ação e campos específicos
// (armazenados em processos.dados_area jsonb). Para adicionar uma área nova,
// basta acrescentar uma entrada aqui e o valor no enum `area_direito` (migração).
// ============================================================================

export type AreaDireito =
  | "TRABALHISTA"
  | "CIVEL"
  | "FAMILIA"
  | "PREVIDENCIARIO"
  | "PENAL";

export type CampoArea = {
  /** chave dentro de processos.dados_area */
  name: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  placeholder?: string;
  /** ocupa a linha inteira no grid de 2 colunas */
  full?: boolean;
};

export type AreaConfig = {
  label: string;
  /** como o sistema chama o cliente nesta área (polo ativo) */
  clienteLabel: string;
  /** como o sistema chama a parte contrária (polo passivo) */
  contrariaLabel: string;
  tiposAcao: { value: string; label: string }[];
  campos: CampoArea[];
};

export const AREAS: Record<AreaDireito, AreaConfig> = {
  TRABALHISTA: {
    label: "Trabalhista",
    clienteLabel: "Reclamante",
    contrariaLabel: "Reclamada",
    tiposAcao: [
      { value: "RECLAMACAO_TRABALHISTA", label: "Reclamação Trabalhista" },
      { value: "RECURSO_ORDINARIO", label: "Recurso Ordinário" },
      { value: "ACAO_RESCISORIA", label: "Ação Rescisória" },
      { value: "MANDADO_SEGURANCA", label: "Mandado de Segurança" },
      { value: "EXECUCAO", label: "Execução" },
      { value: "DISSIDIO_COLETIVO", label: "Dissídio Coletivo" },
      { value: "HABEAS_CORPUS_TRABALHISTA", label: "Habeas Corpus Trabalhista" },
    ],
    campos: [
      { name: "funcao", label: "Função/cargo", type: "text", placeholder: "Auxiliar administrativo" },
      { name: "salario", label: "Último salário (R$)", type: "number", placeholder: "1800.00" },
      { name: "ctps", label: "CTPS", type: "text", placeholder: "0000000 / 000-DF" },
      { name: "data_admissao", label: "Admissão", type: "date" },
      { name: "data_demissao", label: "Demissão", type: "date" },
      { name: "motivo_demissao", label: "Motivo da saída", type: "text", placeholder: "Dispensa sem justa causa" },
      { name: "jornada", label: "Jornada contratada", type: "text", placeholder: "44h semanais", full: true },
    ],
  },
  CIVEL: {
    label: "Cível",
    clienteLabel: "Autor",
    contrariaLabel: "Réu",
    tiposAcao: [
      { value: "ACAO_COBRANCA", label: "Ação de Cobrança" },
      { value: "ACAO_INDENIZATORIA", label: "Ação Indenizatória" },
      { value: "OBRIGACAO_FAZER", label: "Obrigação de Fazer/Não Fazer" },
      { value: "EXECUCAO_TITULO", label: "Execução de Título" },
      { value: "DESPEJO", label: "Ação de Despejo" },
      { value: "BUSCA_APREENSAO", label: "Busca e Apreensão" },
      { value: "USUCAPIAO", label: "Usucapião" },
      { value: "REVISIONAL", label: "Ação Revisional" },
    ],
    campos: [
      { name: "objeto", label: "Objeto da ação", type: "textarea", placeholder: "Descrição do bem/direito discutido", full: true },
      { name: "contrato", label: "Contrato/instrumento", type: "text", placeholder: "Nº ou referência do contrato" },
      { name: "data_fato", label: "Data do fato", type: "date" },
    ],
  },
  FAMILIA: {
    label: "Família",
    clienteLabel: "Requerente",
    contrariaLabel: "Requerido",
    tiposAcao: [
      { value: "DIVORCIO", label: "Divórcio" },
      { value: "GUARDA", label: "Guarda" },
      { value: "ALIMENTOS", label: "Alimentos (pensão)" },
      { value: "INVENTARIO", label: "Inventário/Partilha" },
      { value: "UNIAO_ESTAVEL", label: "Reconhecimento/Dissolução de União" },
      { value: "INVESTIGACAO_PATERNIDADE", label: "Investigação de Paternidade" },
    ],
    campos: [
      { name: "filhos", label: "Filhos (nº / idades)", type: "text", placeholder: "2 — 8 e 12 anos" },
      { name: "data_casamento", label: "Data do casamento/união", type: "date" },
      { name: "regime_bens", label: "Regime de bens", type: "text", placeholder: "Comunhão parcial" },
    ],
  },
  PREVIDENCIARIO: {
    label: "Previdenciário",
    clienteLabel: "Segurado",
    contrariaLabel: "INSS",
    tiposAcao: [
      { value: "CONCESSAO_BENEFICIO", label: "Concessão de Benefício" },
      { value: "REVISAO_BENEFICIO", label: "Revisão de Benefício" },
      { value: "APOSENTADORIA", label: "Aposentadoria" },
      { value: "AUXILIO_DOENCA", label: "Auxílio por Incapacidade" },
      { value: "BPC_LOAS", label: "BPC/LOAS" },
      { value: "PENSAO_MORTE", label: "Pensão por Morte" },
    ],
    campos: [
      { name: "nb", label: "Número do benefício (NB)", type: "text", placeholder: "123.456.789-0" },
      { name: "especie_beneficio", label: "Espécie do benefício", type: "text", placeholder: "B31 - Auxílio-doença" },
      { name: "der", label: "Data de entrada do requerimento (DER)", type: "date" },
    ],
  },
  PENAL: {
    label: "Penal",
    clienteLabel: "Acusado/Querelante",
    contrariaLabel: "Vítima/Querelado",
    tiposAcao: [
      { value: "ACAO_PENAL", label: "Ação Penal" },
      { value: "HABEAS_CORPUS", label: "Habeas Corpus" },
      { value: "QUEIXA_CRIME", label: "Queixa-crime" },
      { value: "REVISAO_CRIMINAL", label: "Revisão Criminal" },
      { value: "RELAXAMENTO_PRISAO", label: "Relaxamento de Prisão" },
      { value: "LIBERDADE_PROVISORIA", label: "Liberdade Provisória" },
    ],
    campos: [
      { name: "tipificacao", label: "Tipificação (artigo)", type: "text", placeholder: "Art. 155 do CP" },
      { name: "comarca", label: "Comarca", type: "text", placeholder: "Brasília/DF" },
      { name: "data_fato", label: "Data do fato", type: "date" },
      { name: "situacao_prisional", label: "Situação prisional", type: "text", placeholder: "Em liberdade", full: true },
    ],
  },
};

export const AREA_OPTIONS = (Object.keys(AREAS) as AreaDireito[]).map((value) => ({
  value,
  label: AREAS[value].label,
}));

export function areaLabel(area: string | null | undefined): string {
  if (!area) return "—";
  return AREAS[area as AreaDireito]?.label ?? area;
}

/** rótulo legível de um tipo de ação, procurando em todas as áreas */
export function tipoAcaoLabel(
  tipo: string | null | undefined,
  area?: string | null
): string {
  if (!tipo) return "—";
  const cfg = area ? AREAS[area as AreaDireito] : undefined;
  const inArea = cfg?.tiposAcao.find((t) => t.value === tipo);
  if (inArea) return inArea.label;
  for (const a of Object.values(AREAS)) {
    const found = a.tiposAcao.find((t) => t.value === tipo);
    if (found) return found.label;
  }
  // fallback: legível a partir do enum
  return tipo
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function areaConfig(area: string | null | undefined): AreaConfig {
  return AREAS[(area as AreaDireito) ?? "TRABALHISTA"] ?? AREAS.TRABALHISTA;
}
