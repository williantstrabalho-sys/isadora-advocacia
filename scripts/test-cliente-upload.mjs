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

await sb.auth.signInWithPassword({
  email: "maria@cliente.com",
  password: "senha123",
});

// pega um cliente_id da maria
const { data: cli } = await sb.from("clientes").select("id").limit(1);
const clienteId = cli?.[0]?.id;

// 1) cliente tenta INSERIR documento -> deve falhar (RLS)
const ins = await sb.from("documentos").insert({
  cliente_id: clienteId,
  nome: "tentativa.pdf",
  storage_path: `${clienteId}/x.pdf`,
  tipo: "PDF",
});
// 2) cliente LÊ documentos -> deve funcionar
const sel = await sb.from("documentos").select("id").limit(1);

console.log("INSERT pelo cliente:", ins.error ? `BLOQUEADO ✅ (${ins.error.message})` : "PERMITIDO ❌");
console.log("SELECT pelo cliente:", sel.error ? `erro: ${sel.error.message}` : `OK (${sel.data.length} visível)`);

await sb.auth.signOut();
