-- ============================================================================
-- Correção: no Supabase a extensão pgcrypto vive no schema `extensions`.
-- As funções de criptografia chamavam pgp_sym_encrypt/decrypt sem qualificar
-- o schema; dentro de salvar_cliente (search_path = public) isso falhava com
-- "function pgp_sym_encrypt(text, text) does not exist", impedindo o cadastro
-- de clientes. Recriamos com chamadas totalmente qualificadas.
-- ============================================================================

create or replace function public.encrypt_sensitive(plaintext text)
returns text
language sql
stable
as $$
  select case
    when plaintext is null or plaintext = '' then null
    else encode(
      extensions.pgp_sym_encrypt(plaintext, public.crypto_key()),
      'base64'
    )
  end;
$$;

create or replace function public.decrypt_sensitive(ciphertext text)
returns text
language sql
stable
as $$
  select case
    when ciphertext is null or ciphertext = '' then null
    else extensions.pgp_sym_decrypt(
      decode(ciphertext, 'base64'),
      public.crypto_key()
    )
  end;
$$;
