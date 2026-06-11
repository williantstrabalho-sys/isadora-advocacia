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
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "assoc-teste@escritorio.com";
const SENHA = "assoc-teste-123";

// 1) cria (ou recupera) o associado
let assocId;
{
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL, password: SENHA, email_confirm: true,
    user_metadata: { role: "associado", nome: "Associado Teste" },
  });
  if (data?.user) assocId = data.user.id;
  else {
    const { data: list } = await admin.auth.admin.listUsers();
    assocId = list.users.find((u) => u.email === EMAIL)?.id;
    await admin.auth.admin.updateUserById(assocId, { password: SENHA });
  }
  await admin.from("profiles").upsert({ id: assocId, role: "associado", nome: "Associado Teste", email: EMAIL });
}

// 2) pega os 2 processos e atribui só o primeiro ao associado
const { data: procs } = await admin.from("processos").select("id, cliente_id").order("created_at");
const proc1 = procs[0], proc2 = procs[1];
await admin.from("processos").update({ responsavel_id: assocId }).eq("id", proc1.id);
await admin.from("processos").update({ responsavel_id: null }).eq("id", proc2.id);

// 3) total real de processos/clientes/financeiro (via service role, sem RLS)
const tot = {
  processos: (await admin.from("processos").select("id")).data.length,
  clientes: (await admin.from("clientes").select("id")).data.length,
  financeiro: (await admin.from("financeiro").select("id")).data.length,
};

// 4) loga como associado e mede o que ELE enxerga (com RLS)
const sb = createClient(URL, ANON);
await sb.auth.signInWithPassword({ email: EMAIL, password: SENHA });
const veProcessos = (await sb.from("processos").select("id")).data?.length ?? 0;
const veClientes = (await sb.from("clientes").select("id")).data?.length ?? 0;
const veFinanceiro = (await sb.from("financeiro").select("id")).data?.length ?? 0;
const veProc2 = (await sb.from("processos").select("id").eq("id", proc2.id)).data?.length ?? 0;
// tenta editar o processo dele (deve funcionar) e o de outro (deve falhar)
const editProprio = await sb.from("processos").update({ obs: "editado pelo associado" }).eq("id", proc1.id).select("id");
const editAlheio = await sb.from("processos").update({ obs: "invasao" }).eq("id", proc2.id).select("id");
await sb.auth.signOut();

console.log("TOTAIS (admin):", tot);
console.log("ASSOCIADO vê:");
console.log("  processos:", veProcessos, veProcessos === 1 ? "✅ (só o atribuído)" : "❌");
console.log("  clientes :", veClientes, veClientes === 1 ? "✅ (só o vinculado)" : "❌");
console.log("  financeiro:", veFinanceiro, veFinanceiro === 0 ? "✅ (bloqueado)" : "❌ VAZAMENTO");
console.log("  processo de outro (por id):", veProc2, veProc2 === 0 ? "✅ (bloqueado)" : "❌ VAZAMENTO");
console.log("  editar o próprio processo:", editProprio.data?.length ? "✅ permitido" : "❌ " + (editProprio.error?.message||"0 linhas"));
console.log("  editar processo alheio:", (editAlheio.data?.length ?? 0) === 0 ? "✅ bloqueado" : "❌ CONSEGUIU EDITAR");

// 5) limpeza
await admin.from("processos").update({ responsavel_id: null }).eq("id", proc1.id);
await admin.auth.admin.deleteUser(assocId);
console.log("\n(limpeza: associado removido, atribuição revertida)");
