-- ============================================================================
-- Isadora Gonçalves Advocacia — Schema principal
-- Direito Trabalhista | Brasília/DF
-- ============================================================================
-- Extensões necessárias
create extension if not exists "pgcrypto" with schema public;        -- criptografia de dados sensíveis (CPF, CTPS)
create extension if not exists "uuid-ossp" with schema public;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('cliente', 'advogada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_acao_trabalhista as enum (
    'RECLAMACAO_TRABALHISTA',
    'RECURSO_ORDINARIO',
    'ACAO_RESCISORIA',
    'MANDADO_SEGURANCA',
    'EXECUCAO',
    'DISSIDIO_COLETIVO',
    'HABEAS_CORPUS_TRABALHISTA'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_processo as enum ('ATIVO', 'AGUARDANDO', 'RECURSO', 'ENCERRADO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_lancamento as enum ('HONORARIO', 'DESPESA', 'REEMBOLSO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_financeiro as enum ('PAGO', 'PENDENTE', 'ATRASADO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_agenda as enum ('AUDIENCIA', 'PRAZO', 'REUNIAO', 'PERICIA');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- CHAVE DE CRIPTOGRAFIA (pgcrypto)
-- Em produção, defina app.settings.crypto_key via:
--   alter database postgres set app.crypto_key = 'CHAVE_FORTE_AQUI';
-- Aqui usamos uma função que lê o GUC com fallback para desenvolvimento.
-- ----------------------------------------------------------------------------
create or replace function public.crypto_key()
returns text
language sql
stable
as $$
  select coalesce(
    current_setting('app.crypto_key', true),
    'dev-only-change-me-32bytes-key!!'  -- fallback DEV — troque em produção
  );
$$;

create or replace function public.encrypt_sensitive(plaintext text)
returns text
language sql
stable
as $$
  select case
    when plaintext is null or plaintext = '' then null
    else encode(pgp_sym_encrypt(plaintext, public.crypto_key()), 'base64')
  end;
$$;

create or replace function public.decrypt_sensitive(ciphertext text)
returns text
language sql
stable
as $$
  select case
    when ciphertext is null or ciphertext = '' then null
    else pgp_sym_decrypt(decode(ciphertext, 'base64'), public.crypto_key())
  end;
$$;

-- ----------------------------------------------------------------------------
-- TABELA: profiles  (1:1 com auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'cliente',
  nome        text not null,
  email       text not null,
  oab_numero  text,                       -- preenchido apenas para advogada
  created_at  timestamptz not null default now()
);

-- Função helper: verdadeira se o usuário autenticado é advogada
create or replace function public.is_advogada()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'advogada'
  );
$$;

-- ----------------------------------------------------------------------------
-- TABELA: clientes
-- cpf e ctps armazenados criptografados (colunas *_enc)
-- ----------------------------------------------------------------------------
create table if not exists public.clientes (
  id                uuid primary key default uuid_generate_v4(),
  advogada_id       uuid not null references public.profiles(id) on delete cascade,
  profile_id        uuid references public.profiles(id) on delete set null, -- vínculo p/ login do cliente
  nome              text not null,
  cpf_enc           text,                  -- criptografado (pgcrypto)
  email             text,
  telefone          text,
  data_nascimento   date,
  endereco          text,
  empresa_reclamada text,
  ctps_enc          text,                  -- criptografado (pgcrypto)
  data_admissao     date,
  data_demissao     date,
  motivo_demissao   text,
  obs               text,
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: processos
-- ----------------------------------------------------------------------------
create table if not exists public.processos (
  id                 uuid primary key default uuid_generate_v4(),
  cliente_id         uuid not null references public.clientes(id) on delete cascade,
  advogada_id        uuid not null references public.profiles(id) on delete cascade,
  numero_cnj         text not null,
  tipo_acao          tipo_acao_trabalhista not null,
  vara               text,
  fase               text,
  status             status_processo not null default 'ATIVO',
  valor_causa        numeric(14,2),
  data_distribuicao  date,
  data_audiencia     timestamptz,
  pedidos            jsonb default '[]'::jsonb,
  partes             jsonb default '[]'::jsonb,
  obs                text,
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: movimentacoes
-- ----------------------------------------------------------------------------
create table if not exists public.movimentacoes (
  id           uuid primary key default uuid_generate_v4(),
  processo_id  uuid not null references public.processos(id) on delete cascade,
  descricao    text not null,
  data         timestamptz not null default now(),
  tipo         text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: documentos
-- ----------------------------------------------------------------------------
create table if not exists public.documentos (
  id            uuid primary key default uuid_generate_v4(),
  processo_id   uuid references public.processos(id) on delete cascade,
  cliente_id    uuid references public.clientes(id) on delete cascade,
  uploader_id   uuid references public.profiles(id) on delete set null,
  nome          text not null,
  storage_path  text not null,
  tipo          text,
  tamanho       bigint,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: mensagens
-- ----------------------------------------------------------------------------
create table if not exists public.mensagens (
  id              uuid primary key default uuid_generate_v4(),
  remetente_id    uuid not null references public.profiles(id) on delete cascade,
  destinatario_id uuid references public.profiles(id) on delete set null,
  cliente_id      uuid references public.clientes(id) on delete cascade,
  conteudo        text not null,
  lida            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: financeiro
-- ----------------------------------------------------------------------------
create table if not exists public.financeiro (
  id           uuid primary key default uuid_generate_v4(),
  advogada_id  uuid not null references public.profiles(id) on delete cascade,
  cliente_id   uuid references public.clientes(id) on delete set null,
  processo_id  uuid references public.processos(id) on delete set null,
  descricao    text not null,
  tipo         tipo_lancamento not null,
  valor        numeric(14,2) not null,
  vencimento   date,
  pagamento    date,
  status       status_financeiro not null default 'PENDENTE',
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: agenda
-- ----------------------------------------------------------------------------
create table if not exists public.agenda (
  id           uuid primary key default uuid_generate_v4(),
  advogada_id  uuid not null references public.profiles(id) on delete cascade,
  processo_id  uuid references public.processos(id) on delete set null,
  tipo         tipo_agenda not null,
  titulo       text not null,
  data         date not null,
  hora         time,
  local        text,
  obs          text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: blog_posts  (público quando publicado = true)
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  titulo      text not null,
  resumo      text,
  conteudo    text,                 -- markdown
  autor       text,
  tags        text[] default '{}',  -- "CLT","TST","Súmulas","NR","Reforma Trabalhista"
  publicado   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: contatos  (formulário público — com consentimento LGPD)
-- ----------------------------------------------------------------------------
create table if not exists public.contatos (
  id            uuid primary key default uuid_generate_v4(),
  nome          text not null,
  email         text not null,
  assunto       text,
  mensagem      text not null,
  consentimento boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ÍNDICES
-- ----------------------------------------------------------------------------
create index if not exists idx_clientes_advogada   on public.clientes(advogada_id);
create index if not exists idx_clientes_profile     on public.clientes(profile_id);
create index if not exists idx_processos_cliente     on public.processos(cliente_id);
create index if not exists idx_processos_advogada    on public.processos(advogada_id);
create index if not exists idx_mov_processo          on public.movimentacoes(processo_id);
create index if not exists idx_docs_cliente          on public.documentos(cliente_id);
create index if not exists idx_docs_processo         on public.documentos(processo_id);
create index if not exists idx_msg_cliente           on public.mensagens(cliente_id);
create index if not exists idx_fin_advogada          on public.financeiro(advogada_id);
create index if not exists idx_agenda_advogada       on public.agenda(advogada_id);
create index if not exists idx_blog_slug             on public.blog_posts(slug);
