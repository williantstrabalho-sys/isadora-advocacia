-- ============================================================================
-- 0016 — Métricas: contagem de acessos ao site + uso do banco/storage
-- Acessos: registro anônimo (sem dados pessoais) para acompanhar visitas.
-- Uso: funções que leem o tamanho do banco e do storage (só a advogada).
-- ============================================================================

create table if not exists public.acessos (
  id         uuid primary key default gen_random_uuid(),
  path       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_acessos_created on public.acessos(created_at);

alter table public.acessos enable row level security;

-- Qualquer visitante (anon) pode REGISTRAR um acesso (só inserir).
drop policy if exists "acessos_insert_publico" on public.acessos;
create policy "acessos_insert_publico" on public.acessos
  for insert with check (true);

-- Só a advogada LÊ os acessos.
drop policy if exists "acessos_select_advogada" on public.acessos;
create policy "acessos_select_advogada" on public.acessos
  for select using (public.is_advogada());

-- Uso do projeto (tamanho do banco e do storage). Só a advogada.
create or replace function public.uso_projeto()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_advogada() then
    raise exception 'acesso negado';
  end if;
  return json_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', (
      select coalesce(sum((metadata->>'size')::bigint), 0)
      from storage.objects
    ),
    'acessos_total', (select count(*) from public.acessos)
  );
end;
$$;

grant execute on function public.uso_projeto() to authenticated;
