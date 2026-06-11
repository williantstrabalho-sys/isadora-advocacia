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
