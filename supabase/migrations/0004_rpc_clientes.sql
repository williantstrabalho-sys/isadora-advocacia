-- ============================================================================
-- RPC para salvar cliente com criptografia de dados sensíveis (CPF, CTPS).
-- A cifragem ocorre no banco (pgcrypto) — o plaintext nunca é persistido.
-- security invoker => respeita a RLS de `clientes` (apenas advogada escreve).
-- ============================================================================
create or replace function public.salvar_cliente(
  p_id              uuid,
  p_nome            text,
  p_cpf             text,
  p_email           text,
  p_telefone        text,
  p_data_nascimento date,
  p_endereco        text,
  p_empresa_reclamada text,
  p_ctps            text,
  p_data_admissao   date,
  p_data_demissao   date,
  p_motivo_demissao text,
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
      advogada_id, profile_id, nome, cpf_enc, email, telefone,
      data_nascimento, endereco, empresa_reclamada, ctps_enc,
      data_admissao, data_demissao, motivo_demissao, obs
    ) values (
      auth.uid(), p_profile_id, p_nome,
      public.encrypt_sensitive(p_cpf), p_email, p_telefone,
      p_data_nascimento, p_endereco, p_empresa_reclamada,
      public.encrypt_sensitive(p_ctps),
      p_data_admissao, p_data_demissao, p_motivo_demissao, p_obs
    )
    returning id into v_id;
  else
    update public.clientes set
      nome = p_nome,
      cpf_enc = public.encrypt_sensitive(p_cpf),
      email = p_email,
      telefone = p_telefone,
      data_nascimento = p_data_nascimento,
      endereco = p_endereco,
      empresa_reclamada = p_empresa_reclamada,
      ctps_enc = public.encrypt_sensitive(p_ctps),
      data_admissao = p_data_admissao,
      data_demissao = p_data_demissao,
      motivo_demissao = p_motivo_demissao,
      obs = p_obs,
      profile_id = coalesce(p_profile_id, profile_id)
    where id = p_id
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function public.salvar_cliente(
  uuid, text, text, text, text, date, text, text, text, date, date, text, text, uuid
) to authenticated;
