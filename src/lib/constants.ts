import type {
  TipoAcaoTrabalhista,
  StatusProcesso,
  TipoLancamento,
  StatusFinanceiro,
  TipoAgenda,
  ResultadoProcesso,
} from "@/lib/types";

export const ESCRITORIO = {
  nome: "Isadora Gonçalves Advocacia e Consultoria Jurídica",
  nomeCurto: "Isadora Gonçalves Advocacia",
  advogada: "Isadora Gonçalves",
  oab: "OAB/DF 76.416",
  endereco: "QND 26, Lote 15, Taguatinga Norte, Brasília/DF",
  email: "contato@isadoragoncalves.adv.br",
  telefone: "(61) 9 8441-1723",
  cidade: "Brasília/DF",
} as const;

export const AVISO_OAB =
  "Este site não constitui captação de clientela. Publicidade regulamentada pelo Provimento 205/2021 do CFOAB.";

export const TIPO_ACAO_LABEL: Record<TipoAcaoTrabalhista, string> = {
  RECLAMACAO_TRABALHISTA: "Reclamação Trabalhista",
  RECURSO_ORDINARIO: "Recurso Ordinário",
  ACAO_RESCISORIA: "Ação Rescisória",
  MANDADO_SEGURANCA: "Mandado de Segurança",
  EXECUCAO: "Execução",
  DISSIDIO_COLETIVO: "Dissídio Coletivo",
  HABEAS_CORPUS_TRABALHISTA: "Habeas Corpus Trabalhista",
};

export const TIPO_ACAO_OPTIONS = Object.entries(TIPO_ACAO_LABEL).map(
  ([value, label]) => ({ value: value as TipoAcaoTrabalhista, label })
);

export const STATUS_PROCESSO_LABEL: Record<StatusProcesso, string> = {
  ATIVO: "Ativo",
  AGUARDANDO: "Aguardando",
  RECURSO: "Recurso",
  ENCERRADO: "Encerrado",
};

export const STATUS_PROCESSO_COLOR: Record<StatusProcesso, string> = {
  ATIVO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  AGUARDANDO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  RECURSO: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  ENCERRADO: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export const TIPO_LANCAMENTO_LABEL: Record<TipoLancamento, string> = {
  HONORARIO: "Honorário",
  DESPESA: "Despesa",
  REEMBOLSO: "Reembolso",
};

export const STATUS_FINANCEIRO_LABEL: Record<StatusFinanceiro, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
};

export const STATUS_FINANCEIRO_COLOR: Record<StatusFinanceiro, string> = {
  PAGO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDENTE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ATRASADO: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const RESULTADO_LABEL: Record<ResultadoProcesso, string> = {
  EM_ANDAMENTO: "Em andamento",
  FAVORAVEL: "Favorável",
  PARCIAL: "Parcialmente favorável",
  DESFAVORAVEL: "Desfavorável",
  ACORDO: "Acordo",
};

export const RESULTADO_COLOR: Record<ResultadoProcesso, string> = {
  EM_ANDAMENTO: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  FAVORAVEL: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PARCIAL: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DESFAVORAVEL: "bg-red-500/15 text-red-400 border-red-500/30",
  ACORDO: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

export const RESULTADO_OPTIONS = (
  Object.keys(RESULTADO_LABEL) as ResultadoProcesso[]
).map((value) => ({ value, label: RESULTADO_LABEL[value] }));

export const TIPO_AGENDA_LABEL: Record<TipoAgenda, string> = {
  AUDIENCIA: "Audiência",
  PRAZO: "Prazo Processual",
  REUNIAO: "Reunião",
  PERICIA: "Perícia",
};

export const TIPO_AGENDA_COLOR: Record<TipoAgenda, string> = {
  AUDIENCIA: "bg-brand-accent/15 text-brand-accent border-brand-accent/30",
  PRAZO: "bg-red-500/15 text-red-400 border-red-500/30",
  REUNIAO: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  PERICIA: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

// Tags permitidas no blog (conformidade temática)
export const BLOG_TAGS = [
  "CLT",
  "TST",
  "Súmulas",
  "NR",
  "Reforma Trabalhista",
] as const;

// Especialidades exibidas na landing
export const ESPECIALIDADES = [
  {
    titulo: "Rescisão indireta",
    descricao:
      "Reconhecimento da rescisão por falta grave do empregador, com pagamento das verbas como se demissão sem justa causa fosse.",
  },
  {
    titulo: "Horas extras e adicional noturno",
    descricao:
      "Apuração de jornada, horas extraordinárias, intervalos suprimidos e adicional noturno não pagos corretamente.",
  },
  {
    titulo: "Assédio moral e dano existencial",
    descricao:
      "Reparação por condutas abusivas, humilhações reiteradas e jornadas que comprometem a vida pessoal do trabalhador.",
  },
  {
    titulo: "FGTS e verbas rescisórias",
    descricao:
      "Conferência de depósitos do FGTS, multa de 40%, aviso prévio, férias, 13º e demais verbas da rescisão.",
  },
  {
    titulo: "Acidente de trabalho e doença ocupacional",
    descricao:
      "Estabilidade, indenizações e responsabilização do empregador em acidentes e doenças relacionadas ao trabalho.",
  },
  {
    titulo: "Negociações coletivas e sindicais",
    descricao:
      "Acompanhamento de acordos e convenções coletivas, dissídios e questões envolvendo entidades sindicais.",
  },
] as const;

// FAQ trabalhista — informativo, sem promessa de resultado (Provimento 205/2021)
export const FAQ = [
  {
    pergunta: "Qual o prazo para entrar com uma ação trabalhista?",
    resposta:
      "Em regra, o trabalhador pode reclamar verbas dos últimos 5 anos, observado o limite de 2 anos após o fim do contrato (art. 7º, XXIX, da Constituição). Cada caso deve ser analisado individualmente.",
  },
  {
    pergunta: "Preciso pagar para entrar com a ação?",
    resposta:
      "A Justiça do Trabalho admite a gratuidade de justiça para quem comprova insuficiência de recursos. Custas e honorários seguem as regras da CLT após a Reforma Trabalhista (Lei 13.467/2017).",
  },
  {
    pergunta: "O que é rescisão indireta?",
    resposta:
      "É a chamada 'justa causa do empregador': quando faltas graves da empresa (atraso de salário, assédio, descumprimento de obrigações) autorizam o empregado a romper o contrato mantendo seus direitos rescisórios (art. 483 da CLT).",
  },
  {
    pergunta: "Tenho direito a horas extras mesmo sem registro de ponto?",
    resposta:
      "A jornada pode ser comprovada por diversos meios de prova. Para empresas com mais de 20 empregados, a ausência de controle de ponto pode gerar presunção favorável ao trabalhador (Súmula 338 do TST).",
  },
  {
    pergunta: "Como funciona o atendimento do escritório?",
    resposta:
      "O atendimento é individualizado e inicia-se com a análise dos documentos do caso. Pelo portal do cliente é possível acompanhar processos, prazos e documentos com segurança.",
  },
];

// Depoimentos — sem identificação completa (LGPD)
export const DEPOIMENTOS = [
  {
    texto:
      "Fui orientada com clareza em cada etapa do processo. O acompanhamento pelo portal me deu tranquilidade.",
    autor: "M. S.",
    contexto: "Reclamação trabalhista",
  },
  {
    texto:
      "Atendimento técnico e humano. Entendi todos os meus direitos sem promessas vazias.",
    autor: "J. P.",
    contexto: "Rescisão indireta",
  },
  {
    texto:
      "Profissionalismo do início ao fim. Recomendo pela transparência nas informações.",
    autor: "A. R.",
    contexto: "Verbas rescisórias",
  },
];
