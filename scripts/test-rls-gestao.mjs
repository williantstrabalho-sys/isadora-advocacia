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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function como(email, senha) {
  const sb = createClient(url, anon);
  await sb.auth.signInWithPassword({ email, password: senha });
  const { data, error } = await sb.from("processo_gestao").select("*");
  await sb.auth.signOut();
  return { rows: data?.length ?? 0, error: error?.message ?? null };
}

console.log("CLIENTE (maria):", await como("maria@cliente.com", "senha123"));
console.log("ADVOGADA (isadora):", await como("isadora@escritorio.com", "senha123"));
