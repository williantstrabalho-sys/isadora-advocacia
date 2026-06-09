-- ============================================================================
-- Triggers, Storage e funções LGPD
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Auto-criação de profile ao registrar usuário no Auth.
-- role e nome vêm de raw_user_meta_data (definidos no signUp / seed).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nome, email, oab_numero)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'cliente'),
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'oab_numero'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- STORAGE — bucket privado "documentos"
-- Acesso ao arquivo SEMPRE via URL assinada (gerada no server). RLS abaixo
-- garante que o cliente só acesse objetos sob o prefixo dos seus processos.
-- Convenção de path: documentos/<cliente_id>/<arquivo>
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

-- Advogada: acesso total ao bucket
drop policy if exists "storage_docs_advogada_all" on storage.objects;
create policy "storage_docs_advogada_all" on storage.objects
  for all
  using (bucket_id = 'documentos' and public.is_advogada())
  with check (bucket_id = 'documentos' and public.is_advogada());

-- Cliente: lê/escreve apenas objetos no prefixo de um cliente vinculado a ele
drop policy if exists "storage_docs_cliente_select" on storage.objects;
create policy "storage_docs_cliente_select" on storage.objects
  for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (select public.my_cliente_ids())
  );

drop policy if exists "storage_docs_cliente_insert" on storage.objects;
create policy "storage_docs_cliente_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (select public.my_cliente_ids())
  );

-- ----------------------------------------------------------------------------
-- Realtime — habilita o chat ao vivo na tabela de mensagens
-- ----------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.mensagens;
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- LGPD — Direito ao esquecimento
-- Exclui o usuário autenticado e todos os seus dados (cascade via FKs).
-- Chamada via RPC pelo próprio cliente no portal.
-- ----------------------------------------------------------------------------
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Não autenticado';
  end if;

  -- Desvincula registros de cliente (mantém histórico processual do escritório,
  -- mas remove o vínculo de acesso e anonimiza o profile).
  update public.clientes set profile_id = null where profile_id = uid;

  -- Remove o usuário do Auth (cascata remove o profile).
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.excluir_minha_conta() from public;
grant execute on function public.excluir_minha_conta() to authenticated;

-- ----------------------------------------------------------------------------
-- Views/RPC de leitura com descriptografia controlada (apenas advogada via RLS)
-- Retorna cliente com CPF/CTPS já descriptografados — só roda se o caller
-- passar pela RLS de clientes (advogada ou dono).
-- ----------------------------------------------------------------------------
create or replace function public.cliente_detalhe(p_cliente_id uuid)
returns table (
  id uuid,
  nome text,
  cpf text,
  email text,
  telefone text,
  data_nascimento date,
  endereco text,
  empresa_reclamada text,
  ctps text,
  data_admissao date,
  data_demissao date,
  motivo_demissao text,
  obs text
)
language sql
security invoker  -- respeita RLS de clientes
stable
as $$
  select
    c.id,
    c.nome,
    public.decrypt_sensitive(c.cpf_enc) as cpf,
    c.email,
    c.telefone,
    c.data_nascimento,
    c.endereco,
    c.empresa_reclamada,
    public.decrypt_sensitive(c.ctps_enc) as ctps,
    c.data_admissao,
    c.data_demissao,
    c.motivo_demissao,
    c.obs
  from public.clientes c
  where c.id = p_cliente_id;
$$;
