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
