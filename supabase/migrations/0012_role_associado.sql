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
