-- ============================================================================
-- 0017 — Acessos por página (top páginas, últimos 90 dias). Só a advogada.
-- ============================================================================

create or replace function public.acessos_por_pagina()
returns table(path text, total bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_advogada() then
    raise exception 'acesso negado';
  end if;
  return query
    select coalesce(a.path, '(desconhecido)') as path, count(*)::bigint as total
    from public.acessos a
    where a.created_at >= now() - interval '90 days'
    group by 1
    order by 2 desc
    limit 8;
end;
$$;

grant execute on function public.acessos_por_pagina() to authenticated;
