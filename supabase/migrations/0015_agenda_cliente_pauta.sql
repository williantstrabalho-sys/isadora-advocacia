-- ============================================================================
-- 0015 — Agenda: vínculo a cliente, pauta de reunião e retorno do cliente
-- O cliente passa a ver reuniões/pautas no portal e pode marcar "de acordo"
-- ou solicitar ajuste na ata.
-- ============================================================================

alter table public.agenda
  add column if not exists cliente_id uuid references public.clientes(id) on delete set null,
  add column if not exists pauta text,
  add column if not exists cliente_lido boolean not null default false,
  add column if not exists cliente_de_acordo boolean not null default false,
  add column if not exists cliente_ajuste text;

create index if not exists idx_agenda_cliente on public.agenda(cliente_id);

-- Cliente pode LER os eventos vinculados a ele (via clientes.profile_id).
drop policy if exists "agenda_cliente_select" on public.agenda;
create policy "agenda_cliente_select" on public.agenda
  for select using (
    cliente_id in (
      select id from public.clientes where profile_id = auth.uid()
    )
  );

-- Retorno do cliente sobre uma reunião — atualiza apenas os campos de feedback,
-- validando que o evento pertence a um cliente do próprio usuário.
create or replace function public.agenda_feedback(
  p_id uuid,
  p_de_acordo boolean,
  p_ajuste text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.agenda a set
    cliente_lido = true,
    cliente_de_acordo = coalesce(p_de_acordo, false),
    cliente_ajuste = nullif(btrim(coalesce(p_ajuste, '')), '')
  where a.id = p_id
    and a.cliente_id in (
      select id from public.clientes where profile_id = auth.uid()
    );
end;
$$;

grant execute on function public.agenda_feedback(uuid, boolean, text) to authenticated;
