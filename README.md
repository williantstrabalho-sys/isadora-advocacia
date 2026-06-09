# Isadora Gonçalves — Advocacia e Consultoria Jurídica

Sistema jurídico web completo para escritório especializado em **Direito Trabalhista** (Brasília/DF). Inclui portal público (landing + blog), portal do cliente e dashboard da advogada, com conformidade **OAB (Provimento 205/2021)** e **LGPD (Lei 13.709/2018)**.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Supabase** — PostgreSQL, Auth, Storage (com RLS e pgcrypto)
- **Tailwind CSS** + componentes no estilo **shadcn/ui**
- **Recharts** (gráficos), **react-markdown** (blog)
- Deploy: **Vercel**

## Identidade visual

Tema dark minimalista derivado do logo (preto + laranja cobre `#d4691e`). Tokens em [`tailwind.config.ts`](tailwind.config.ts) sob o namespace `brand`.

---

## 1. Pré-requisitos

- Node.js 18+ (testado em 24)
- Conta no [Supabase](https://supabase.com) e (para deploy) na [Vercel](https://vercel.com)

## 2. Instalação

```bash
npm install
cp .env.local.example .env.local   # preencha as credenciais do Supabase
```

Variáveis (`.env.local`):

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role — **somente** para o seed |
| `NEXT_PUBLIC_SITE_URL` | URL pública (SEO) |

## 3. Banco de dados (migrations)

Aplique os arquivos de [`supabase/migrations`](supabase/migrations) **na ordem**, via SQL Editor do Supabase ou Supabase CLI:

1. `0001_schema.sql` — tabelas, enums, pgcrypto, funções de cripto
2. `0002_rls.sql` — Row Level Security em todas as tabelas
3. `0003_triggers_storage.sql` — trigger de profile, bucket `documentos`, RPC de exclusão de conta (LGPD)
4. `0004_rpc_clientes.sql` — RPC `salvar_cliente` (cifra CPF/CTPS)

> **Chave de criptografia (produção):** defina um segredo forte para o pgcrypto:
> ```sql
> alter database postgres set app.crypto_key = 'SUA_CHAVE_FORTE_AQUI';
> ```
> Sem isso, é usada uma chave de desenvolvimento (ver `public.crypto_key()`).

Via Supabase CLI (alternativa):

```bash
supabase link --project-ref <ref>
supabase db push
```

## 4. Dados de demonstração (seed)

```bash
npm run seed
```

Cria usuários, clientes, processos, financeiro, agenda, mensagens e posts:

| Perfil | E-mail | Senha |
|---|---|---|
| Advogada | `isadora@escritorio.com` | `senha123` |
| Cliente | `maria@cliente.com` | `senha123` |
| Cliente | `joao@cliente.com` | `senha123` |

## 5. Desenvolvimento

```bash
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint     # eslint
```

---

## Estrutura de rotas

### Público (sem autenticação)
- `/` — landing (hero, especialidades, sobre, depoimentos, FAQ, contato)
- `/blog`, `/blog/[slug]` — artigos (markdown)
- `/politica-privacidade` — LGPD
- `/login` — acesso com redirect por perfil

### Portal do cliente (`/portal/*` — role `cliente`)
Painel · Processos · Documentos · Mensagens · Honorários

### Dashboard da advogada (`/dashboard/*` — role `advogada`)
Visão geral (KPIs + gráficos) · Processos (CRUD) · Clientes (CRUD) · Financeiro · Agenda · Documentos · Mensagens

A proteção de rotas e o redirect por papel ficam em [`src/middleware.ts`](src/middleware.ts) + [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts).

---

## Segurança e conformidade

### RLS (Row Level Security)
- Habilitada em **todas** as tabelas.
- Cliente vê apenas os próprios dados (via `clientes.profile_id = auth.uid()`).
- Advogada (`public.is_advogada()`) gerencia todos os dados do escritório.

### Dados sensíveis
- **CPF e CTPS** são cifrados com **pgcrypto** (`encrypt_sensitive`) e nunca persistidos em texto puro. A leitura descriptografada ocorre via RPC `cliente_detalhe` (respeitando RLS).
- **Documentos**: bucket privado; download apenas por **URL assinada com expiração de 1h** ([`/api/documentos/[id]`](src/app/api/documentos/[id]/route.ts)).

### LGPD (Lei 13.709/2018)
- Página `/politica-privacidade`.
- Banner de consentimento de cookies (sem rastreamento antes do aceite).
- Formulário de contato com **checkbox de consentimento** obrigatório.
- **Direito ao esquecimento**: exclusão de conta no portal (RPC `excluir_minha_conta`).

### OAB — Provimento 205/2021
- Sem promessa de resultado e sem captação ativa (sem pop-ups/push de captação).
- Blog informativo, sem CTA comercial dentro dos artigos.
- Rodapé com OAB/DF, CNPJ, endereço e aviso de publicidade regulamentada.

> Ajuste OAB, CNPJ e endereço reais em [`src/lib/constants.ts`](src/lib/constants.ts) (`ESCRITORIO`).

---

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente (mesmas do `.env.local`, **exceto** `SUPABASE_SERVICE_ROLE_KEY`, que não é necessária em runtime).
3. Em **Supabase → Authentication → URL Configuration**, adicione a URL de produção em *Site URL* e *Redirect URLs*.
4. Deploy.

---

## Observações técnicas

- Os clients Supabase ([`src/lib/supabase`](src/lib/supabase)) não recebem o generic `<Database>` por incompatibilidade de inferência da versão atual; a tipagem é aplicada por cast explícito nas consultas (ver [`src/lib/types.ts`](src/lib/types.ts)).
- Páginas autenticadas usam `export const dynamic = "force-dynamic"` para refletir sessão/dados em tempo real.
- Exportação em PDF usa páginas imprimíveis (`/relatorio/*`) com `window.print()`.
