-- ============================================================================
-- SETUP COMPLETO — cole tudo no SQL Editor do Supabase e execute (Run).
-- Gerado automaticamente a partir de supabase/migrations/*.sql (UTF-8).
-- ============================================================================


-- >>> 0001_schema.sql >>>
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


-- >>> 0002_rls.sql >>>
-- ============================================================================
-- Row Level Security — TODAS as tabelas
-- Regra geral:
--   * advogada (public.is_advogada()) enxerga/gerencia tudo do escritório
--   * cliente só enxerga os próprios dados (via profile_id -> clientes)
-- ============================================================================

-- Helper: ids de clientes vinculados ao usuário autenticado
create or replace function public.my_cliente_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.clientes where profile_id = auth.uid();
$$;

-- Habilita RLS
alter table public.profiles       enable row level security;
alter table public.clientes       enable row level security;
alter table public.processos      enable row level security;
alter table public.movimentacoes  enable row level security;
alter table public.documentos     enable row level security;
alter table public.mensagens      enable row level security;
alter table public.financeiro     enable row level security;
alter table public.agenda         enable row level security;
alter table public.blog_posts     enable row level security;
alter table public.contatos       enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_self_or_advogada" on public.profiles;
create policy "profiles_select_self_or_advogada" on public.profiles
  for select using (id = auth.uid() or public.is_advogada());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- clientes
-- ----------------------------------------------------------------------------
drop policy if exists "clientes_advogada_all" on public.clientes;
create policy "clientes_advogada_all" on public.clientes
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "clientes_self_select" on public.clientes;
create policy "clientes_self_select" on public.clientes
  for select using (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- processos
-- ----------------------------------------------------------------------------
drop policy if exists "processos_advogada_all" on public.processos;
create policy "processos_advogada_all" on public.processos
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "processos_cliente_select" on public.processos;
create policy "processos_cliente_select" on public.processos
  for select using (cliente_id in (select public.my_cliente_ids()));

-- ----------------------------------------------------------------------------
-- movimentacoes
-- ----------------------------------------------------------------------------
drop policy if exists "mov_advogada_all" on public.movimentacoes;
create policy "mov_advogada_all" on public.movimentacoes
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "mov_cliente_select" on public.movimentacoes;
create policy "mov_cliente_select" on public.movimentacoes
  for select using (
    processo_id in (
      select id from public.processos
      where cliente_id in (select public.my_cliente_ids())
    )
  );

-- ----------------------------------------------------------------------------
-- documentos  (acesso a arquivo apenas via URL assinada — Storage RLS abaixo)
-- ----------------------------------------------------------------------------
drop policy if exists "docs_advogada_all" on public.documentos;
create policy "docs_advogada_all" on public.documentos
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "docs_cliente_select" on public.documentos;
create policy "docs_cliente_select" on public.documentos
  for select using (cliente_id in (select public.my_cliente_ids()));

-- Cliente pode subir documentos dos próprios processos
drop policy if exists "docs_cliente_insert" on public.documentos;
create policy "docs_cliente_insert" on public.documentos
  for insert with check (
    cliente_id in (select public.my_cliente_ids())
    and uploader_id = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- mensagens  (cliente vê apenas as suas; advogada vê todas)
-- ----------------------------------------------------------------------------
drop policy if exists "msg_advogada_all" on public.mensagens;
create policy "msg_advogada_all" on public.mensagens
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "msg_cliente_select" on public.mensagens;
create policy "msg_cliente_select" on public.mensagens
  for select using (
    remetente_id = auth.uid()
    or destinatario_id = auth.uid()
    or cliente_id in (select public.my_cliente_ids())
  );

drop policy if exists "msg_cliente_insert" on public.mensagens;
create policy "msg_cliente_insert" on public.mensagens
  for insert with check (remetente_id = auth.uid());

drop policy if exists "msg_update_lida" on public.mensagens;
create policy "msg_update_lida" on public.mensagens
  for update using (
    public.is_advogada()
    or destinatario_id = auth.uid()
    or cliente_id in (select public.my_cliente_ids())
  );

-- ----------------------------------------------------------------------------
-- financeiro
-- ----------------------------------------------------------------------------
drop policy if exists "fin_advogada_all" on public.financeiro;
create policy "fin_advogada_all" on public.financeiro
  for all using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "fin_cliente_select" on public.financeiro;
create policy "fin_cliente_select" on public.financeiro
  for select using (cliente_id in (select public.my_cliente_ids()));

-- ----------------------------------------------------------------------------
-- agenda  (apenas advogada)
-- ----------------------------------------------------------------------------
drop policy if exists "agenda_advogada_all" on public.agenda;
create policy "agenda_advogada_all" on public.agenda
  for all using (public.is_advogada()) with check (public.is_advogada());

-- ----------------------------------------------------------------------------
-- blog_posts  (leitura pública apenas se publicado; escrita só advogada)
-- ----------------------------------------------------------------------------
drop policy if exists "blog_public_select" on public.blog_posts;
create policy "blog_public_select" on public.blog_posts
  for select using (publicado = true or public.is_advogada());

drop policy if exists "blog_advogada_write" on public.blog_posts;
create policy "blog_advogada_write" on public.blog_posts
  for all using (public.is_advogada()) with check (public.is_advogada());

-- ----------------------------------------------------------------------------
-- contatos  (qualquer um insere com consentimento; só advogada lê)
-- ----------------------------------------------------------------------------
drop policy if exists "contatos_insert_public" on public.contatos;
create policy "contatos_insert_public" on public.contatos
  for insert with check (consentimento = true);

drop policy if exists "contatos_advogada_select" on public.contatos;
create policy "contatos_advogada_select" on public.contatos
  for select using (public.is_advogada());


-- >>> 0003_triggers_storage.sql >>>
-- ============================================================================
-- Triggers, Storage e funções LGPD
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Auto-criação de profile ao registrar usuário no Auth.
-- role e nome vêm de raw_user_meta_data (definidos no signUp / seed).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nome, email, oab_numero)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'cliente'),
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'oab_numero'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- STORAGE — bucket privado "documentos"
-- Acesso ao arquivo SEMPRE via URL assinada (gerada no server). RLS abaixo
-- garante que o cliente só acesse objetos sob o prefixo dos seus processos.
-- Convenção de path: documentos/<cliente_id>/<arquivo>
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

-- Advogada: acesso total ao bucket
drop policy if exists "storage_docs_advogada_all" on storage.objects;
create policy "storage_docs_advogada_all" on storage.objects
  for all
  using (bucket_id = 'documentos' and public.is_advogada())
  with check (bucket_id = 'documentos' and public.is_advogada());

-- Cliente: lê/escreve apenas objetos no prefixo de um cliente vinculado a ele
drop policy if exists "storage_docs_cliente_select" on storage.objects;
create policy "storage_docs_cliente_select" on storage.objects
  for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (select public.my_cliente_ids())
  );

drop policy if exists "storage_docs_cliente_insert" on storage.objects;
create policy "storage_docs_cliente_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (select public.my_cliente_ids())
  );

-- ----------------------------------------------------------------------------
-- Realtime — habilita o chat ao vivo na tabela de mensagens
-- ----------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.mensagens;
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- LGPD — Direito ao esquecimento
-- Exclui o usuário autenticado e todos os seus dados (cascade via FKs).
-- Chamada via RPC pelo próprio cliente no portal.
-- ----------------------------------------------------------------------------
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Não autenticado';
  end if;

  -- Desvincula registros de cliente (mantém histórico processual do escritório,
  -- mas remove o vínculo de acesso e anonimiza o profile).
  update public.clientes set profile_id = null where profile_id = uid;

  -- Remove o usuário do Auth (cascata remove o profile).
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.excluir_minha_conta() from public;
grant execute on function public.excluir_minha_conta() to authenticated;

-- ----------------------------------------------------------------------------
-- Views/RPC de leitura com descriptografia controlada (apenas advogada via RLS)
-- Retorna cliente com CPF/CTPS já descriptografados — só roda se o caller
-- passar pela RLS de clientes (advogada ou dono).
-- ----------------------------------------------------------------------------
create or replace function public.cliente_detalhe(p_cliente_id uuid)
returns table (
  id uuid,
  nome text,
  cpf text,
  email text,
  telefone text,
  data_nascimento date,
  endereco text,
  empresa_reclamada text,
  ctps text,
  data_admissao date,
  data_demissao date,
  motivo_demissao text,
  obs text
)
language sql
security invoker  -- respeita RLS de clientes
stable
as $$
  select
    c.id,
    c.nome,
    public.decrypt_sensitive(c.cpf_enc) as cpf,
    c.email,
    c.telefone,
    c.data_nascimento,
    c.endereco,
    c.empresa_reclamada,
    public.decrypt_sensitive(c.ctps_enc) as ctps,
    c.data_admissao,
    c.data_demissao,
    c.motivo_demissao,
    c.obs
  from public.clientes c
  where c.id = p_cliente_id;
$$;


-- >>> 0004_rpc_clientes.sql >>>
-- ============================================================================
-- RPC para salvar cliente com criptografia de dados sensíveis (CPF, CTPS).
-- A cifragem ocorre no banco (pgcrypto) — o plaintext nunca é persistido.
-- security invoker => respeita a RLS de `clientes` (apenas advogada escreve).
-- ============================================================================
create or replace function public.salvar_cliente(
  p_id              uuid,
  p_nome            text,
  p_cpf             text,
  p_email           text,
  p_telefone        text,
  p_data_nascimento date,
  p_endereco        text,
  p_empresa_reclamada text,
  p_ctps            text,
  p_data_admissao   date,
  p_data_demissao   date,
  p_motivo_demissao text,
  p_obs             text,
  p_profile_id      uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.clientes (
      advogada_id, profile_id, nome, cpf_enc, email, telefone,
      data_nascimento, endereco, empresa_reclamada, ctps_enc,
      data_admissao, data_demissao, motivo_demissao, obs
    ) values (
      auth.uid(), p_profile_id, p_nome,
      public.encrypt_sensitive(p_cpf), p_email, p_telefone,
      p_data_nascimento, p_endereco, p_empresa_reclamada,
      public.encrypt_sensitive(p_ctps),
      p_data_admissao, p_data_demissao, p_motivo_demissao, p_obs
    )
    returning id into v_id;
  else
    update public.clientes set
      nome = p_nome,
      cpf_enc = public.encrypt_sensitive(p_cpf),
      email = p_email,
      telefone = p_telefone,
      data_nascimento = p_data_nascimento,
      endereco = p_endereco,
      empresa_reclamada = p_empresa_reclamada,
      ctps_enc = public.encrypt_sensitive(p_ctps),
      data_admissao = p_data_admissao,
      data_demissao = p_data_demissao,
      motivo_demissao = p_motivo_demissao,
      obs = p_obs,
      profile_id = coalesce(p_profile_id, profile_id)
    where id = p_id
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function public.salvar_cliente(
  uuid, text, text, text, text, date, text, text, text, date, date, text, text, uuid
) to authenticated;


-- >>> 0005_contatos_telefone.sql >>>
-- ============================================================================
-- Adiciona o campo de telefone ao formulário de contato público.
-- ============================================================================
alter table public.contatos
  add column if not exists telefone text;


-- >>> 0006_config_depoimentos.sql >>>
-- ============================================================================
-- Conteúdo editável pela advogada (admin): configurações do escritório e
-- depoimentos de clientes. O site público lê dessas tabelas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- configuracoes — linha única (id = 1) com dados de contato/identificação
-- ----------------------------------------------------------------------------
create table if not exists public.configuracoes (
  id              int primary key default 1 check (id = 1),
  escritorio_nome text,
  advogada_nome   text,
  oab             text,
  email           text,
  telefone        text,
  endereco        text,
  atualizado_em   timestamptz not null default now()
);

alter table public.configuracoes enable row level security;

drop policy if exists "config_public_select" on public.configuracoes;
create policy "config_public_select" on public.configuracoes
  for select using (true);

drop policy if exists "config_advogada_write" on public.configuracoes;
create policy "config_advogada_write" on public.configuracoes
  for all using (public.is_advogada()) with check (public.is_advogada());

insert into public.configuracoes
  (id, escritorio_nome, advogada_nome, oab, email, telefone, endereco)
values (
  1,
  'Isadora Gonçalves Advocacia e Consultoria Jurídica',
  'Isadora Gonçalves',
  'OAB/DF 76.416',
  'contato@isadoragoncalves.adv.br',
  '(61) 9 8441-1723',
  'Brasília/DF'
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- depoimentos — relatos de clientes (sem identificação completa, LGPD)
-- ----------------------------------------------------------------------------
create table if not exists public.depoimentos (
  id          uuid primary key default uuid_generate_v4(),
  autor       text not null,
  contexto    text,
  texto       text not null,
  publicado   boolean not null default true,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.depoimentos enable row level security;

drop policy if exists "depoimentos_public_select" on public.depoimentos;
create policy "depoimentos_public_select" on public.depoimentos
  for select using (publicado = true or public.is_advogada());

drop policy if exists "depoimentos_advogada_write" on public.depoimentos;
create policy "depoimentos_advogada_write" on public.depoimentos
  for all using (public.is_advogada()) with check (public.is_advogada());

insert into public.depoimentos (autor, contexto, texto, ordem)
select * from (values
  ('M. S.', 'Reclamação trabalhista', 'Fui orientada com clareza em cada etapa do processo. O acompanhamento pelo portal me deu tranquilidade.', 1),
  ('J. P.', 'Rescisão indireta', 'Atendimento técnico e humano. Entendi todos os meus direitos sem promessas vazias.', 2),
  ('A. R.', 'Verbas rescisórias', 'Profissionalismo do início ao fim. Recomendo pela transparência nas informações.', 3)
) as v(autor, contexto, texto, ordem)
where not exists (select 1 from public.depoimentos);


-- >>> 0007_gestao_processo.sql >>>
-- ============================================================================
-- Gestão do processo (acesso EXCLUSIVO da advogada) e remoção das movimentações.
-- ============================================================================

-- Desfecho do processo
do $$ begin
  create type resultado_processo as enum (
    'EM_ANDAMENTO', 'FAVORAVEL', 'PARCIAL', 'DESFAVORAVEL', 'ACORDO'
  );
exception when duplicate_object then null; end $$;

-- Tabela 1:1 com processos — dados internos de gestão.
-- Fica em tabela separada (e não em `processos`) para que a RLS garanta que
-- o CLIENTE nunca acesse esses dados, nem via API (RLS é por linha; colunas
-- sensíveis ficam isoladas aqui, sem policy de cliente).
create table if not exists public.processo_gestao (
  processo_id          uuid primary key references public.processos(id) on delete cascade,
  valor_pedido         numeric(14,2),   -- valor pleiteado/exposto na ação
  valor_sentenca       numeric(14,2),   -- valor efetivamente decidido
  resultado            resultado_processo not null default 'EM_ANDAMENTO',
  data_encerramento    date,
  honorario_exito_pct  numeric(5,2),    -- % de honorário de êxito sobre a sentença
  licoes_aprendidas    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.processo_gestao enable row level security;

drop policy if exists "gestao_advogada_all" on public.processo_gestao;
create policy "gestao_advogada_all" on public.processo_gestao
  for all using (public.is_advogada()) with check (public.is_advogada());

-- Remove o módulo de movimentações por completo
drop table if exists public.movimentacoes cascade;


-- >>> 0008_somente_advogada_upload.sql >>>
-- ============================================================================
-- Apenas a advogada pode enviar documentos. O cliente continua podendo
-- VISUALIZAR/baixar (políticas de select permanecem), mas não inserir.
-- Removemos as políticas de INSERT do cliente (tabela e storage).
-- ============================================================================

drop policy if exists "docs_cliente_insert" on public.documentos;
drop policy if exists "storage_docs_cliente_insert" on storage.objects;


-- >>> 0009_fix_pgcrypto_schema.sql >>>
-- ============================================================================
-- Correção: no Supabase a extensão pgcrypto vive no schema `extensions`.
-- As funções de criptografia chamavam pgp_sym_encrypt/decrypt sem qualificar
-- o schema; dentro de salvar_cliente (search_path = public) isso falhava com
-- "function pgp_sym_encrypt(text, text) does not exist", impedindo o cadastro
-- de clientes. Recriamos com chamadas totalmente qualificadas.
-- ============================================================================

create or replace function public.encrypt_sensitive(plaintext text)
returns text
language sql
stable
as $$
  select case
    when plaintext is null or plaintext = '' then null
    else encode(
      extensions.pgp_sym_encrypt(plaintext, public.crypto_key()),
      'base64'
    )
  end;
$$;

create or replace function public.decrypt_sensitive(ciphertext text)
returns text
language sql
stable
as $$
  select case
    when ciphertext is null or ciphertext = '' then null
    else extensions.pgp_sym_decrypt(
      decode(ciphertext, 'base64'),
      public.crypto_key()
    )
  end;
$$;


-- >>> 0010_cms.sql >>>
-- ============================================================================
-- CMS: conteúdo da landing editável pelo admin (advogada).
-- Estrutura/layout permanecem fixos no código (a "espinha dorsal"); apenas o
-- conteúdo (textos, listas e imagens) vem do banco. Pensado para white-label.
-- ============================================================================

-- Conteúdo em blocos (key/value jsonb). Ex.: 'hero', 'sobre', 'faq', 'imagens'.
create table if not exists public.site_conteudo (
  chave         text primary key,
  valor         jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.site_conteudo enable row level security;

drop policy if exists "conteudo_public_select" on public.site_conteudo;
create policy "conteudo_public_select" on public.site_conteudo
  for select using (true);

drop policy if exists "conteudo_advogada_write" on public.site_conteudo;
create policy "conteudo_advogada_write" on public.site_conteudo
  for all using (public.is_advogada()) with check (public.is_advogada());

-- ----------------------------------------------------------------------------
-- Bucket PÚBLICO para imagens do site (logo, hero, sobre). Leitura pública
-- (servidas direto na landing); escrita apenas pela advogada.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('publico', 'publico', true)
on conflict (id) do nothing;

drop policy if exists "publico_read" on storage.objects;
create policy "publico_read" on storage.objects
  for select using (bucket_id = 'publico');

drop policy if exists "publico_advogada_write" on storage.objects;
create policy "publico_advogada_write" on storage.objects
  for all
  using (bucket_id = 'publico' and public.is_advogada())
  with check (bucket_id = 'publico' and public.is_advogada());


-- >>> 0011_contatos_lido.sql >>>
-- ============================================================================
-- Aba "Contatos recebidos": marca de leitura para os contatos do formulário.
-- ============================================================================
alter table public.contatos
  add column if not exists lido boolean not null default false;

-- A advogada pode marcar como lido / excluir contatos recebidos.
drop policy if exists "contatos_advogada_update" on public.contatos;
create policy "contatos_advogada_update" on public.contatos
  for update using (public.is_advogada()) with check (public.is_advogada());

drop policy if exists "contatos_advogada_delete" on public.contatos;
create policy "contatos_advogada_delete" on public.contatos
  for delete using (public.is_advogada());


-- >>> 0012_role_associado.sql >>>
-- ============================================================================
-- Perfil de advogado ASSOCIADO/contratado + "direcionamento" de processos.
-- (Apenas o enum e a coluna aqui; as políticas ficam em 0013 — o valor novo do
--  enum não pode ser usado na mesma transação em que é criado.)
-- ============================================================================

alter type user_role add value if not exists 'associado';

-- Responsável pelo processo (advogada ou associado). NULL = sob o admin.
alter table public.processos
  add column if not exists responsavel_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_processos_responsavel
  on public.processos(responsavel_id);


-- >>> 0013_associado_rls.sql >>>
-- ============================================================================
-- RLS do perfil ASSOCIADO: acesso restrito aos processos direcionados a ele
-- (responsavel_id = auth.uid()) e aos dados relacionados. A advogada (admin)
-- continua com acesso total (políticas existentes). Financeiro permanece
-- exclusivo do admin (nenhuma política de associado aqui).
-- ============================================================================

-- PROCESSOS — associado vê e edita os processos atribuídos a ele.
drop policy if exists "processos_associado_select" on public.processos;
create policy "processos_associado_select" on public.processos
  for select using (responsavel_id = auth.uid());

drop policy if exists "processos_associado_update" on public.processos;
create policy "processos_associado_update" on public.processos
  for update using (responsavel_id = auth.uid())
  with check (responsavel_id = auth.uid());

-- GESTÃO do processo — associado gerencia a dos seus processos.
drop policy if exists "gestao_associado_all" on public.processo_gestao;
create policy "gestao_associado_all" on public.processo_gestao
  for all
  using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  )
  with check (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- CLIENTES — somente leitura dos clientes dos processos do associado.
drop policy if exists "clientes_associado_select" on public.clientes;
create policy "clientes_associado_select" on public.clientes
  for select using (
    id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

-- DOCUMENTOS — ver e enviar dos processos do associado.
drop policy if exists "docs_associado_select" on public.documentos;
create policy "docs_associado_select" on public.documentos
  for select using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "docs_associado_insert" on public.documentos;
create policy "docs_associado_insert" on public.documentos
  for insert with check (
    uploader_id = auth.uid()
    and processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- AGENDA — eventos/prazos dos processos do associado.
drop policy if exists "agenda_associado_all" on public.agenda;
create policy "agenda_associado_all" on public.agenda
  for all
  using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  )
  with check (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- MENSAGENS — conversas com clientes dos processos do associado.
drop policy if exists "msg_associado_select" on public.mensagens;
create policy "msg_associado_select" on public.mensagens
  for select using (
    cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "msg_associado_insert" on public.mensagens;
create policy "msg_associado_insert" on public.mensagens
  for insert with check (
    remetente_id = auth.uid()
    and cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "msg_associado_update" on public.mensagens;
create policy "msg_associado_update" on public.mensagens
  for update using (
    cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

-- STORAGE (bucket documentos) — associado lê/envia arquivos dos clientes
-- vinculados aos seus processos (prefixo = cliente_id).
drop policy if exists "storage_docs_associado_select" on storage.objects;
create policy "storage_docs_associado_select" on storage.objects
  for select using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select cliente_id from public.processos where responsavel_id = auth.uid()
    )
  );

drop policy if exists "storage_docs_associado_insert" on storage.objects;
create policy "storage_docs_associado_insert" on storage.objects
  for insert with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select cliente_id from public.processos where responsavel_id = auth.uid()
    )
  );

