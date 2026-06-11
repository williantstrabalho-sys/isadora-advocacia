import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { error: loginErr } = await sb.auth.signInWithPassword({
  email: "isadora@escritorio.com",
  password: "senha123",
});
if (loginErr) { console.log("login falhou:", loginErr.message); process.exit(1); }

// chamada idêntica à action salvarCliente
const { data, error } = await sb.rpc("salvar_cliente", {
  p_id: null,
  p_nome: "Teste Diagnóstico",
  p_cpf: "12345678901",
  p_email: "diag@teste.com",
  p_telefone: "(61) 90000-0000",
  p_data_nascimento: null,
  p_endereco: null,
  p_empresa_reclamada: null,
  p_ctps: null,
  p_data_admissao: null,
  p_data_demissao: null,
  p_motivo_demissao: null,
  p_obs: null,
  p_profile_id: null,
});

console.log("RPC retorno:", JSON.stringify({ data, error }, null, 2));

if (data) {
  // limpa o registro de teste
  await sb.from("clientes").delete().eq("id", data);
  console.log("registro de teste removido");
}
await sb.auth.signOut();
