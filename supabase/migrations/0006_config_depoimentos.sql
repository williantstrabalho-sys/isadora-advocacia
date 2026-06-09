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
