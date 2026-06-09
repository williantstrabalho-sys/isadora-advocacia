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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const report = [];

// 1. conectividade + auth admin
try {
  const { data, error } = await supabase.auth.admin.listUsers();
  report.push(error ? `auth.admin: ERRO ${error.message}` : `auth.admin: OK (${data.users.length} usuários)`);
} catch (e) {
  report.push(`auth.admin: EXCEÇÃO ${e.message}`);
}

// 2. tabelas
for (const t of ["profiles", "clientes", "processos", "financeiro", "agenda", "blog_posts"]) {
  const { error } = await supabase.from(t).select("*", { count: "exact", head: true });
  report.push(`tabela ${t}: ${error ? "FALTANDO/ERRO -> " + error.message : "OK"}`);
}

// 3. RPCs
const rpc1 = await supabase.rpc("encrypt_sensitive", { plaintext: "teste" });
report.push(`rpc encrypt_sensitive: ${rpc1.error ? "FALTANDO -> " + rpc1.error.message : "OK"}`);

// 4. storage bucket
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
report.push(
  bErr
    ? `storage: ERRO ${bErr.message}`
    : `bucket 'documentos': ${buckets.some((b) => b.id === "documentos") ? "OK" : "FALTANDO"}`
);

console.log(report.join("\n"));
const faltando = report.some((r) => /FALTANDO|ERRO|EXCEÇÃO/.test(r));
console.log(faltando ? "\n=> SCHEMA INCOMPLETO" : "\n=> SCHEMA OK");
process.exit(faltando ? 2 : 0);
