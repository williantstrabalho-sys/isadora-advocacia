// Conteúdo padrão da landing (fallback do CMS). Tudo aqui é editável pelo
// admin em /dashboard/conteudo; estes valores são usados quando ainda não há
// conteúdo salvo no banco — garantindo que o site nunca fique vazio.

import { TEMA_PADRAO, type Tema } from "@/lib/cores";

export type ConteudoSite = {
  tema: Tema;
  hero: {
    titulo: string;
    destaque: string;
    subtitulo: string;
    cta1_label: string;
    cta1_href: string;
    cta2_label: string;
    cta2_href: string;
  };
  especialidades: {
    titulo: string;
    subtitulo: string;
    itens: { titulo: string; descricao: string }[];
  };
  sobre: {
    titulo: string;
    paragrafos: string[];
    formacoes: { rotulo: string; valor: string }[];
  };
  faq: {
    titulo: string;
    subtitulo: string;
    itens: { pergunta: string; resposta: string }[];
  };
  depoimentos: { titulo: string; subtitulo: string };
  contato: { titulo: string; subtitulo: string };
  imagens: {
    logo: string;
    hero: string;
    sobre: string;
    /** object-position (ex.: "50% 30%") para enquadrar sem cortar */
    hero_pos?: string;
    sobre_pos?: string;
    /** zoom (scale) ancorado no ponto focal; 1 = sem zoom */
    hero_zoom?: number;
    sobre_zoom?: number;
  };
};

export const CONTEUDO_PADRAO: ConteudoSite = {
  tema: TEMA_PADRAO,
  hero: {
    titulo: "Defesa técnica dos seus",
    destaque: "direitos trabalhistas",
    subtitulo:
      "Atuação dedicada em questões da relação de emprego — da análise do caso ao acompanhamento processual. Orientação clara, sem promessas: apenas trabalho técnico e transparente.",
    cta1_label: "Agendar uma consulta",
    cta1_href: "#contato",
    cta2_label: "Ver áreas de atuação",
    cta2_href: "#especialidades",
  },
  especialidades: {
    titulo: "Especialidades trabalhistas",
    subtitulo:
      "Áreas de atuação na Justiça do Trabalho, com foco na proteção do trabalhador e na correta aplicação da legislação.",
    itens: [
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
    ],
  },
  sobre: {
    titulo: "Sobre a advogada",
    paragrafos: [
      "Isadora Gonçalves é advogada inscrita na OAB/DF 76.416, dedicada exclusivamente ao Direito do Trabalho. Atua na orientação de trabalhadores e no acompanhamento de processos perante a Justiça do Trabalho, com atenção especial às varas do Distrito Federal e ao TRT da 10ª Região.",
      "O escritório preza por um atendimento individualizado, informação clara sobre cada etapa e respeito integral aos deveres éticos da advocacia.",
    ],
    formacoes: [
      {
        rotulo: "Pós-graduação",
        valor: "Direito e Processo do Trabalho e Direito Previdenciário",
      },
      { rotulo: "Pós-graduação", valor: "Arbitragem e Mediação de Conflitos" },
    ],
  },
  faq: {
    titulo: "Dúvidas frequentes",
    subtitulo:
      "Informações de caráter geral sobre Direito Trabalhista. Não substituem a análise individual do seu caso.",
    itens: [
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
    ],
  },
  depoimentos: {
    titulo: "O que dizem os clientes",
    subtitulo:
      "Depoimentos sem identificação completa, em respeito à privacidade (LGPD).",
  },
  contato: {
    titulo: "Entre em contato",
    subtitulo:
      "Envie sua dúvida pelo formulário. O preenchimento não constitui contratação de serviços nem garante resultado — trata-se apenas de um canal de comunicação.",
  },
  imagens: {
    logo: "/logo.png",
    hero: "/isadora-hero.png",
    sobre: "/isadora-sobre.png",
    hero_pos: "50% 20%",
    sobre_pos: "50% 50%",
    hero_zoom: 1,
    sobre_zoom: 1,
  },
};
