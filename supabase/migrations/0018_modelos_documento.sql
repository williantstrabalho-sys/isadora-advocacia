-- ============================================================================
-- 0018 — Modelos de documento (gerador de documentos com preenchimento auto)
-- Modelos com {{variáveis}} preenchidas a partir do cliente/processo/escritório.
-- ============================================================================

create table if not exists public.modelos_documento (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  categoria   text,
  conteudo    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.modelos_documento enable row level security;

-- Equipe (advogada + associado) pode ler os modelos.
drop policy if exists "modelos_select_staff" on public.modelos_documento;
create policy "modelos_select_staff" on public.modelos_documento
  for select using (
    auth.uid() in (select id from public.profiles where role in ('advogada', 'associado'))
  );

-- Só a advogada cria/edita/exclui modelos.
drop policy if exists "modelos_advogada_all" on public.modelos_documento;
create policy "modelos_advogada_all" on public.modelos_documento
  for all using (public.is_advogada()) with check (public.is_advogada());

-- Modelos iniciais (só insere se a tabela estiver vazia).
insert into public.modelos_documento (nome, categoria, conteudo)
select v.nome, v.categoria, v.conteudo from (values
(
  'Procuração Ad Judicia et Extra', 'Procuração',
  $tpl$PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: {{cliente.nome}}, inscrito(a) no CPF/CNPJ sob o nº {{cliente.documento}}, residente e domiciliado(a) em {{cliente.endereco}}.

OUTORGADO(A): {{advogada.nome}}, advogado(a) inscrito(a) na {{advogada.oab}}.

Pelo presente instrumento, o(a) outorgante nomeia e constitui seu(sua) bastante procurador(a) o(a) outorgado(a), a quem confere os poderes da cláusula ad judicia et extra, para o foro em geral, em qualquer juízo, instância ou tribunal, podendo propor as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, usando os recursos legais e acompanhando-os, conferindo ainda poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, podendo substabelecer esta a outrem, com ou sem reserva de iguais poderes.

{{data.hoje}}


_______________________________________
{{cliente.nome}}$tpl$
),
(
  'Contrato de Honorários Advocatícios', 'Contrato',
  $tpl$CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

CONTRATANTE: {{cliente.nome}}, CPF/CNPJ nº {{cliente.documento}}, residente em {{cliente.endereco}}.

CONTRATADO(A): {{advogada.nome}}, {{advogada.oab}}.

OBJETO: Prestação de serviços advocatícios referentes ao processo nº {{processo.numero}} ({{processo.area}} — {{processo.tipo}}), em trâmite na {{processo.vara}}, tendo como parte contrária {{processo.parte_contraria}}.

HONORÁRIOS: As partes ajustam os honorários no valor de R$ ____________ (____________), pagos da seguinte forma: ____________________________________________. Fica ainda ajustado o percentual de ______% a título de honorários de êxito sobre o proveito econômico obtido.

OBRIGAÇÕES: O(A) CONTRATADO(A) atuará com zelo e diligência; o(a) CONTRATANTE fornecerá os documentos e informações necessários ao bom andamento da causa.

FORO: Fica eleito o foro de {{escritorio.cidade}} para dirimir as questões oriundas deste contrato.

{{data.hoje}}


___________________________          ___________________________
{{cliente.nome}}                      {{advogada.nome}}
CONTRATANTE                           CONTRATADO(A)$tpl$
),
(
  'Declaração de Hipossuficiência', 'Declaração',
  $tpl$DECLARAÇÃO DE HIPOSSUFICIÊNCIA

Eu, {{cliente.nome}}, inscrito(a) no CPF sob o nº {{cliente.documento}}, residente e domiciliado(a) em {{cliente.endereco}}, DECLARO, sob as penas da lei, para fins de concessão dos benefícios da justiça gratuita (art. 98 do CPC), que não possuo condições de arcar com as custas processuais e os honorários advocatícios sem prejuízo do meu próprio sustento e do de minha família.

Por ser expressão da verdade, firmo a presente.

{{data.hoje}}


_______________________________________
{{cliente.nome}}
CPF: {{cliente.documento}}$tpl$
),
(
  'Substabelecimento com Reserva de Poderes', 'Procuração',
  $tpl$SUBSTABELECIMENTO COM RESERVA DE PODERES

{{advogada.nome}}, advogado(a) inscrito(a) na {{advogada.oab}}, pelo presente instrumento SUBSTABELECE, com reserva de iguais poderes, os poderes que lhe foram conferidos por {{cliente.nome}} (CPF/CNPJ {{cliente.documento}}), ao(à) advogado(a) ____________________, inscrito(a) na OAB nº ____________, para, em conjunto ou separadamente, atuar no processo nº {{processo.numero}}.

{{data.hoje}}


_______________________________________
{{advogada.nome}}
{{advogada.oab}}$tpl$
)
) as v(nome, categoria, conteudo)
where not exists (select 1 from public.modelos_documento);
