/**
 * Seed de demonstração — Isadora Gonçalves Advocacia (Direito Trabalhista).
 *
 * Cria usuários de Auth (advogada + 2 clientes), seus profiles, clientes,
 * processos, movimentações, financeiro, agenda, mensagens e posts do blog.
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY (NUNCA versione/exponha essa chave).
 *
 * Uso:
 *   1. Aplique as migrations em supabase/migrations no seu projeto Supabase.
 *   2. Preencha .env.local (veja .env.local.example).
 *   3. node scripts/seed.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Carrega .env.local de forma simples (sem dependências externas)
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* .env.local opcional se as variáveis já estiverem no ambiente */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (.env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function criarUsuario(email, password, meta) {
  // tenta criar; se já existir, recupera o id
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (!error && data?.user) return data.user.id;

  // já existe → busca
  const { data: list } = await supabase.auth.admin.listUsers();
  const existente = list?.users?.find((u) => u.email === email);
  if (!existente) throw error;
  // garante metadados/profile
  await supabase.auth.admin.updateUserById(existente.id, {
    password,
    user_metadata: meta,
  });
  return existente.id;
}

async function main() {
  console.log("→ Criando usuários de Auth...");
  const advogadaId = await criarUsuario("isadora@escritorio.com", "senha123", {
    role: "advogada",
    nome: "Isadora Gonçalves",
    oab_numero: "OAB/DF 00.000",
  });
  const mariaId = await criarUsuario("maria@cliente.com", "senha123", {
    role: "cliente",
    nome: "Maria Silva",
  });
  const joaoId = await criarUsuario("joao@cliente.com", "senha123", {
    role: "cliente",
    nome: "João Pereira",
  });

  // Garante os profiles (o trigger já cria, mas reforçamos)
  await supabase.from("profiles").upsert([
    {
      id: advogadaId,
      role: "advogada",
      nome: "Isadora Gonçalves",
      email: "isadora@escritorio.com",
      oab_numero: "OAB/DF 00.000",
    },
    { id: mariaId, role: "cliente", nome: "Maria Silva", email: "maria@cliente.com" },
    { id: joaoId, role: "cliente", nome: "João Pereira", email: "joao@cliente.com" },
  ]);

  console.log("→ Limpando dados de demonstração anteriores...");
  await supabase.from("clientes").delete().eq("advogada_id", advogadaId);

  console.log("→ Criando clientes (CPF/CTPS criptografados via pgcrypto)...");
  // O seed roda com service role (auth.uid() é null), então ciframos via RPC
  // encrypt_sensitive e inserimos diretamente com advogada_id explícito.
  const enc = async (txt) => {
    const { data } = await supabase.rpc("encrypt_sensitive", { plaintext: txt });
    return data;
  };

  const { data: c1 } = await supabase
    .from("clientes")
    .insert({
      advogada_id: advogadaId,
      profile_id: mariaId,
      nome: "Maria Silva",
      cpf_enc: await enc("11122233344"),
      email: "maria@cliente.com",
      telefone: "(61) 99999-0001",
      data_nascimento: "1990-04-12",
      endereco: "QNL 10, Taguatinga, Brasília/DF",
      empresa_reclamada: "Comércio Alfa Ltda.",
      ctps_enc: await enc("1234567/001-DF"),
      data_admissao: "2018-02-01",
      data_demissao: "2023-09-30",
      motivo_demissao: "Dispensa sem justa causa",
      obs: "Cliente em ação de horas extras.",
    })
    .select("id")
    .single();

  const { data: c2 } = await supabase
    .from("clientes")
    .insert({
      advogada_id: advogadaId,
      profile_id: joaoId,
      nome: "João Pereira",
      cpf_enc: await enc("55566677788"),
      email: "joao@cliente.com",
      telefone: "(61) 99999-0002",
      data_nascimento: "1985-11-23",
      endereco: "Setor Central, Taguatinga, Brasília/DF",
      empresa_reclamada: "Construtora Beta S.A.",
      ctps_enc: await enc("7654321/002-DF"),
      data_admissao: "2016-06-15",
      data_demissao: "2024-01-10",
      motivo_demissao: "Rescisão indireta (pleiteada)",
      obs: "Rescisão indireta + dano moral.",
    })
    .select("id")
    .single();

  const mariaClienteId = c1.id;
  const joaoClienteId = c2.id;

  console.log("→ Criando processos...");
  const { data: p1 } = await supabase
    .from("processos")
    .insert({
      cliente_id: mariaClienteId,
      advogada_id: advogadaId,
      numero_cnj: "00010012320235100003",
      tipo_acao: "RECLAMACAO_TRABALHISTA",
      vara: "3ª Vara do Trabalho de Brasília",
      fase: "Conhecimento",
      status: "ATIVO",
      valor_causa: 45000,
      data_distribuicao: "2023-11-05",
      data_audiencia: new Date(Date.now() + 5 * 864e5).toISOString(),
      pedidos: ["Horas extras", "Adicional noturno", "Reflexos em FGTS"],
      obs: "Jornada habitual de 10h sem registro de ponto.",
    })
    .select("id")
    .single();

  const { data: p2 } = await supabase
    .from("processos")
    .insert({
      cliente_id: joaoClienteId,
      advogada_id: advogadaId,
      numero_cnj: "00020034520245100001",
      tipo_acao: "RECLAMACAO_TRABALHISTA",
      vara: "1ª Vara do Trabalho de Taguatinga",
      fase: "Conhecimento",
      status: "AGUARDANDO",
      valor_causa: 28000,
      data_distribuicao: "2024-01-20",
      data_audiencia: new Date(Date.now() + 20 * 864e5).toISOString(),
      pedidos: ["Rescisão indireta", "Dano moral", "Verbas rescisórias"],
      obs: "Atraso reiterado de salários.",
    })
    .select("id")
    .single();

  console.log("→ Gestão dos processos (interno da advogada)...");
  await supabase.from("processo_gestao").upsert(
    [
      {
        processo_id: p1.id,
        valor_pedido: 45000,
        valor_sentenca: 38000,
        resultado: "FAVORAVEL",
        data_encerramento: "2024-08-15",
        honorario_exito_pct: 30,
        licoes_aprendidas:
          "Controle de ponto ausente fortaleceu a tese (Súmula 338). Reunir testemunhas cedo.",
      },
      {
        processo_id: p2.id,
        valor_pedido: 28000,
        valor_sentenca: null,
        resultado: "EM_ANDAMENTO",
        honorario_exito_pct: 30,
        licoes_aprendidas: null,
      },
    ],
    { onConflict: "processo_id" }
  );

  console.log("→ Financeiro...");
  const hoje = new Date();
  await supabase.from("financeiro").insert([
    {
      advogada_id: advogadaId,
      cliente_id: mariaClienteId,
      processo_id: p1.id,
      descricao: "Honorários contratuais - entrada",
      tipo: "HONORARIO",
      valor: 3000,
      vencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 10)
        .toISOString()
        .slice(0, 10),
      pagamento: new Date(hoje.getFullYear(), hoje.getMonth(), 10)
        .toISOString()
        .slice(0, 10),
      status: "PAGO",
    },
    {
      advogada_id: advogadaId,
      cliente_id: joaoClienteId,
      processo_id: p2.id,
      descricao: "Honorários contratuais - parcela 1/3",
      tipo: "HONORARIO",
      valor: 1500,
      vencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 25)
        .toISOString()
        .slice(0, 10),
      status: "PENDENTE",
    },
    {
      advogada_id: advogadaId,
      descricao: "Custas e diligências",
      tipo: "DESPESA",
      valor: 320,
      vencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 8)
        .toISOString()
        .slice(0, 10),
      pagamento: new Date(hoje.getFullYear(), hoje.getMonth(), 8)
        .toISOString()
        .slice(0, 10),
      status: "PAGO",
    },
  ]);

  console.log("→ Agenda...");
  await supabase.from("agenda").insert([
    {
      advogada_id: advogadaId,
      processo_id: p1.id,
      tipo: "AUDIENCIA",
      titulo: "Audiência de instrução - Maria Silva",
      data: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10),
      hora: "14:30",
      local: "TRT-10, Brasília/DF",
      obs: "Levar testemunhas.",
    },
    {
      advogada_id: advogadaId,
      processo_id: p2.id,
      tipo: "PRAZO",
      titulo: "Prazo para réplica - João Pereira",
      data: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
      hora: "23:59",
      local: "PJe",
    },
  ]);

  console.log("→ Mensagens...");
  await supabase.from("mensagens").insert([
    {
      remetente_id: mariaId,
      cliente_id: mariaClienteId,
      conteudo: "Olá, gostaria de saber se já há data para a audiência.",
      lida: false,
    },
    {
      remetente_id: advogadaId,
      cliente_id: mariaClienteId,
      conteudo: "Olá, Maria! A audiência foi designada. Veja a aba Processos.",
      lida: true,
    },
  ]);

  console.log("→ Blog...");
  await supabase.from("blog_posts").upsert(
    [
      {
        slug: "horas-extras-o-que-diz-a-clt",
        titulo: "Horas extras: o que diz a CLT",
        resumo:
          "Entenda como a jornada de trabalho e as horas extraordinárias são tratadas pela legislação trabalhista.",
        autor: "Isadora Gonçalves",
        tags: ["CLT", "Súmulas"],
        publicado: true,
        conteudo:
          "## Jornada e horas extras\n\nA Consolidação das Leis do Trabalho (CLT) estabelece a jornada padrão de **8 horas diárias** e 44 semanais. O que exceder esse limite, salvo compensação válida, deve ser pago como hora extra com adicional mínimo de 50%.\n\n### Prova da jornada\n\nA **Súmula 338 do TST** trata da presunção relativa de veracidade da jornada alegada quando a empresa, obrigada a manter controle de ponto, não o apresenta.\n\n> Este conteúdo é informativo e não substitui a análise do caso concreto.",
      },
      {
        slug: "rescisao-indireta-quando-cabe",
        titulo: "Rescisão indireta: quando cabe",
        resumo:
          "A rescisão indireta é a 'justa causa do empregador'. Veja as hipóteses previstas no art. 483 da CLT.",
        autor: "Isadora Gonçalves",
        tags: ["CLT", "Reforma Trabalhista"],
        publicado: true,
        conteudo:
          "## O que é rescisão indireta\n\nPrevista no **art. 483 da CLT**, ocorre quando o empregador comete falta grave, autorizando o empregado a romper o contrato preservando seus direitos rescisórios.\n\n### Exemplos de hipóteses\n\n- Atraso reiterado no pagamento de salários\n- Exigência de serviços superiores às forças do empregado\n- Rigor excessivo e tratamento degradante\n\n> Conteúdo meramente informativo, sem promessa de resultado.",
      },
    ],
    { onConflict: "slug" }
  );

  console.log("\n✅ Seed concluído com sucesso.");
  console.log("   Advogada: isadora@escritorio.com / senha123");
  console.log("   Cliente:  maria@cliente.com / senha123");
  console.log("   Cliente:  joao@cliente.com / senha123");
}

main().catch((e) => {
  console.error("Erro no seed:", e);
  process.exit(1);
});
