-- ============================================================================
-- Adiciona o campo de telefone ao formulário de contato público.
-- ============================================================================
alter table public.contatos
  add column if not exists telefone text;
