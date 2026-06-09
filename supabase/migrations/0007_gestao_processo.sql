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
