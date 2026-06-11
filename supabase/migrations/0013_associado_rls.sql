-- ============================================================================
-- RLS do perfil ASSOCIADO: acesso restrito aos processos direcionados a ele
-- (responsavel_id = auth.uid()) e aos dados relacionados. A advogada (admin)
-- continua com acesso total (políticas existentes). Financeiro permanece
-- exclusivo do admin (nenhuma política de associado aqui).
-- ============================================================================

-- PROCESSOS — associado vê e edita os processos atribuídos a ele.
drop policy if exists "processos_associado_select" on public.processos;
create policy "processos_associado_select" on public.processos
  for select using (responsavel_id = auth.uid());

drop policy if exists "processos_associado_update" on public.processos;
create policy "processos_associado_update" on public.processos
  for update using (responsavel_id = auth.uid())
  with check (responsavel_id = auth.uid());

-- GESTÃO do processo — associado gerencia a dos seus processos.
drop policy if exists "gestao_associado_all" on public.processo_gestao;
create policy "gestao_associado_all" on public.processo_gestao
  for all
  using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  )
  with check (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- CLIENTES — somente leitura dos clientes dos processos do associado.
drop policy if exists "clientes_associado_select" on public.clientes;
create policy "clientes_associado_select" on public.clientes
  for select using (
    id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

-- DOCUMENTOS — ver e enviar dos processos do associado.
drop policy if exists "docs_associado_select" on public.documentos;
create policy "docs_associado_select" on public.documentos
  for select using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "docs_associado_insert" on public.documentos;
create policy "docs_associado_insert" on public.documentos
  for insert with check (
    uploader_id = auth.uid()
    and processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- AGENDA — eventos/prazos dos processos do associado.
drop policy if exists "agenda_associado_all" on public.agenda;
create policy "agenda_associado_all" on public.agenda
  for all
  using (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  )
  with check (
    processo_id in (select id from public.processos where responsavel_id = auth.uid())
  );

-- MENSAGENS — conversas com clientes dos processos do associado.
drop policy if exists "msg_associado_select" on public.mensagens;
create policy "msg_associado_select" on public.mensagens
  for select using (
    cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "msg_associado_insert" on public.mensagens;
create policy "msg_associado_insert" on public.mensagens
  for insert with check (
    remetente_id = auth.uid()
    and cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

drop policy if exists "msg_associado_update" on public.mensagens;
create policy "msg_associado_update" on public.mensagens
  for update using (
    cliente_id in (select cliente_id from public.processos where responsavel_id = auth.uid())
  );

-- STORAGE (bucket documentos) — associado lê/envia arquivos dos clientes
-- vinculados aos seus processos (prefixo = cliente_id).
drop policy if exists "storage_docs_associado_select" on storage.objects;
create policy "storage_docs_associado_select" on storage.objects
  for select using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select cliente_id from public.processos where responsavel_id = auth.uid()
    )
  );

drop policy if exists "storage_docs_associado_insert" on storage.objects;
create policy "storage_docs_associado_insert" on storage.objects
  for insert with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select cliente_id from public.processos where responsavel_id = auth.uid()
    )
  );
