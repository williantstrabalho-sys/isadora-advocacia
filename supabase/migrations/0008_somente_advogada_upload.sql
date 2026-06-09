-- ============================================================================
-- Apenas a advogada pode enviar documentos. O cliente continua podendo
-- VISUALIZAR/baixar (políticas de select permanecem), mas não inserir.
-- Removemos as políticas de INSERT do cliente (tabela e storage).
-- ============================================================================

drop policy if exists "docs_cliente_insert" on public.documentos;
drop policy if exists "storage_docs_cliente_insert" on storage.objects;
