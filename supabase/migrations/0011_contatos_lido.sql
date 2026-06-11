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
