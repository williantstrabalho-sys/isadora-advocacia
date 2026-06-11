// Tipos do banco (espelham o schema Supabase). Mantenha em sincronia com
// supabase/migrations. Para regenerar via CLI:
//   supabase gen types typescript --project-id <ref> > src/lib/types.ts
//
// NOTE: as entidades são `type` (não `interface`) de propósito: o client
// Supabase exige que cada Row satisfaça `Record<string, unknown>`, o que
// aliases de tipo atendem mas interfaces não (quirk do TypeScript).

export type UserRole = "cliente" | "advogada";

export type TipoAcaoTrabalhista =
  | "RECLAMACAO_TRABALHISTA"
  | "RECURSO_ORDINARIO"
  | "ACAO_RESCISORIA"
  | "MANDADO_SEGURANCA"
  | "EXECUCAO"
  | "DISSIDIO_COLETIVO"
  | "HABEAS_CORPUS_TRABALHISTA";

export type StatusProcesso = "ATIVO" | "AGUARDANDO" | "RECURSO" | "ENCERRADO";
export type TipoLancamento = "HONORARIO" | "DESPESA" | "REEMBOLSO";
export type StatusFinanceiro = "PAGO" | "PENDENTE" | "ATRASADO";
export type TipoAgenda = "AUDIENCIA" | "PRAZO" | "REUNIAO" | "PERICIA";

export type Profile = {
  id: string;
  role: UserRole;
  nome: string;
  email: string;
  oab_numero: string | null;
  created_at: string;
};

export type Cliente = {
  id: string;
  advogada_id: string;
  profile_id: string | null;
  nome: string;
  cpf_enc: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  empresa_reclamada: string | null;
  ctps_enc: string | null;
  data_admissao: string | null;
  data_demissao: string | null;
  motivo_demissao: string | null;
  obs: string | null;
  created_at: string;
};

export type ClienteDetalhe = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  empresa_reclamada: string | null;
  ctps: string | null;
  data_admissao: string | null;
  data_demissao: string | null;
  motivo_demissao: string | null;
  obs: string | null;
};

export type Processo = {
  id: string;
  cliente_id: string;
  advogada_id: string;
  numero_cnj: string;
  tipo_acao: TipoAcaoTrabalhista;
  vara: string | null;
  fase: string | null;
  status: StatusProcesso;
  valor_causa: number | null;
  data_distribuicao: string | null;
  data_audiencia: string | null;
  pedidos: string[];
  partes: { nome: string; papel: string }[];
  obs: string | null;
  created_at: string;
};

export type ResultadoProcesso =
  | "EM_ANDAMENTO"
  | "FAVORAVEL"
  | "PARCIAL"
  | "DESFAVORAVEL"
  | "ACORDO";

export type ProcessoGestao = {
  processo_id: string;
  valor_pedido: number | null;
  valor_sentenca: number | null;
  resultado: ResultadoProcesso;
  data_encerramento: string | null;
  honorario_exito_pct: number | null;
  licoes_aprendidas: string | null;
  created_at: string;
  updated_at: string;
};

export type Documento = {
  id: string;
  processo_id: string | null;
  cliente_id: string | null;
  uploader_id: string | null;
  nome: string;
  storage_path: string;
  tipo: string | null;
  tamanho: number | null;
  created_at: string;
};

export type Mensagem = {
  id: string;
  remetente_id: string;
  destinatario_id: string | null;
  cliente_id: string | null;
  conteudo: string;
  lida: boolean;
  created_at: string;
};

export type Financeiro = {
  id: string;
  advogada_id: string;
  cliente_id: string | null;
  processo_id: string | null;
  descricao: string;
  tipo: TipoLancamento;
  valor: number;
  vencimento: string | null;
  pagamento: string | null;
  status: StatusFinanceiro;
  created_at: string;
};

export type AgendaEvento = {
  id: string;
  advogada_id: string;
  processo_id: string | null;
  tipo: TipoAgenda;
  titulo: string;
  data: string;
  hora: string | null;
  local: string | null;
  obs: string | null;
  created_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  autor: string | null;
  tags: string[];
  publicado: boolean;
  created_at: string;
};

export type Configuracao = {
  id: number;
  escritorio_nome: string | null;
  advogada_nome: string | null;
  oab: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  atualizado_em: string;
};

export type Depoimento = {
  id: string;
  autor: string;
  contexto: string | null;
  texto: string;
  publicado: boolean;
  ordem: number;
  created_at: string;
};

export type Contato = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  consentimento: boolean;
  lido: boolean;
  created_at: string;
};

// Tipagem mínima do client Supabase. Para projetos grandes, gere via CLI.
type TableDef<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      clientes: TableDef<Cliente>;
      processos: TableDef<Processo>;
      processo_gestao: TableDef<ProcessoGestao>;
      documentos: TableDef<Documento>;
      mensagens: TableDef<Mensagem>;
      financeiro: TableDef<Financeiro>;
      agenda: TableDef<AgendaEvento>;
      blog_posts: TableDef<BlogPost>;
      contatos: TableDef<Contato>;
      configuracoes: TableDef<Configuracao>;
      depoimentos: TableDef<Depoimento>;
    };
    Views: { [key: string]: never };
    Functions: {
      is_advogada: { Args: Record<string, never>; Returns: boolean };
      excluir_minha_conta: { Args: Record<string, never>; Returns: undefined };
      cliente_detalhe: {
        Args: { p_cliente_id: string };
        Returns: ClienteDetalhe[];
      };
    };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
};
