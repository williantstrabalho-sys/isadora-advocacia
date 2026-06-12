-- ============================================================================
-- 0014 — Multi-área do Direito
-- Generaliza o sistema (antes só trabalhista) para Cível, Família,
-- Previdenciário e Penal. Preserva os dados trabalhistas existentes.
-- ============================================================================

-- 1) Enum das áreas (tipo novo => pode ser usado na mesma transação)
do $$ begin
  create type area_direito as enum (
    'TRABALHISTA', 'CIVEL', 'FAMILIA', 'PREVIDENCIARIO', 'PENAL'
  );
exception when duplicate_object then null; end $$;

-- 2) processos: área, parte contrária e dados específicos por área
alter table public.processos
  add column if not exists area area_direito not null default 'TRABALHISTA',
  add column if not exists parte_contraria_nome text,
  add column if not exists parte_contraria_doc  text,   -- CNPJ (PJ) ou CPF (PF)
  add column if not exists parte_contraria_tipo text,   -- 'PF' | 'PJ'
  add column if not exists dados_area jsonb not null default '{}'::jsonb;

-- tipo_acao deixa de ser enum fixo de trabalhista -> texto livre por área
alter table public.processos
  alter column tipo_acao type text using tipo_acao::text;

-- 3) clientes: pessoa física ou jurídica (documento genérico cpf_enc)
alter table public.clientes
  add column if not exists tipo_pessoa text not null default 'PF';

-- 4) Migração dos dados trabalhistas existentes (cliente -> processo)
--    empresa_reclamada vira a parte contrária do processo
update public.processos p
set parte_contraria_nome = c.empresa_reclamada,
    parte_contraria_tipo = 'PJ'
from public.clientes c
where p.cliente_id = c.id
  and coalesce(p.parte_contraria_nome, '') = ''
  and coalesce(c.empresa_reclamada, '') <> '';

--    vínculo de emprego (datas/motivo) vai para dados_area do processo trabalhista
update public.processos p
set dados_area = p.dados_area || jsonb_strip_nulls(jsonb_build_object(
      'data_admissao',   c.data_admissao,
      'data_demissao',   c.data_demissao,
      'motivo_demissao', nullif(c.motivo_demissao, '')
    ))
from public.clientes c
where p.cliente_id = c.id
  and p.area = 'TRABALHISTA';

-- 5) RPC de cliente genérico (PF/PJ). CPF/CNPJ guardado criptografado em cpf_enc.
--    Mantém security invoker (respeita RLS de clientes).
create or replace function public.salvar_cliente_v2(
  p_id              uuid,
  p_nome            text,
  p_tipo_pessoa     text,
  p_doc             text,          -- CPF ou CNPJ conforme tipo_pessoa
  p_email           text,
  p_telefone        text,
  p_data_nascimento date,
  p_endereco        text,
  p_obs             text,
  p_profile_id      uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.clientes (
      advogada_id, profile_id, nome, tipo_pessoa, cpf_enc,
      email, telefone, data_nascimento, endereco, obs
    ) values (
      auth.uid(), p_profile_id, p_nome, coalesce(p_tipo_pessoa, 'PF'),
      public.encrypt_sensitive(p_doc),
      p_email, p_telefone, p_data_nascimento, p_endereco, p_obs
    )
    returning id into v_id;
  else
    update public.clientes set
      nome = p_nome,
      tipo_pessoa = coalesce(p_tipo_pessoa, 'PF'),
      cpf_enc = public.encrypt_sensitive(p_doc),
      email = p_email,
      telefone = p_telefone,
      data_nascimento = p_data_nascimento,
      endereco = p_endereco,
      obs = p_obs,
      profile_id = coalesce(p_profile_id, profile_id)
    where id = p_id
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

grant execute on function public.salvar_cliente_v2(
  uuid, text, text, text, text, text, date, text, text, uuid
) to authenticated;

-- 6) cliente_detalhe passa a expor tipo_pessoa
--    (drop necessário: alteração do tipo de retorno não é permitida em replace)
drop function if exists public.cliente_detalhe(uuid);
create or replace function public.cliente_detalhe(p_cliente_id uuid)
returns table (
  id uuid, nome text, tipo_pessoa text, cpf text, email text, telefone text,
  data_nascimento date, endereco text, empresa_reclamada text, ctps text,
  data_admissao date, data_demissao date, motivo_demissao text, obs text
)
language sql
security invoker
set search_path = public
stable
as $$
  select
    c.id, c.nome, c.tipo_pessoa,
    public.decrypt_sensitive(c.cpf_enc),
    c.email, c.telefone, c.data_nascimento, c.endereco,
    c.empresa_reclamada,
    public.decrypt_sensitive(c.ctps_enc),
    c.data_admissao, c.data_demissao, c.motivo_demissao, c.obs
  from public.clientes c
  where c.id = p_cliente_id;
$$;

grant execute on function public.cliente_detalhe(uuid) to authenticated;
