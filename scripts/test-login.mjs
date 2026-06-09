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

// Usa a chave ANON (mesma do navegador) para simular o login real
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testar(email, senha) {
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error || !auth.user) {
    console.log(`❌ ${email}: ${error?.message || "sem usuário"}`);
    return;
  }
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("role, nome")
    .eq("id", auth.user.id)
    .single();
  const destino = profile?.role === "advogada" ? "/dashboard" : "/portal";
  console.log(
    `✅ ${email}: login OK | role=${profile?.role ?? "?"} ${
      pErr ? "(erro profile: " + pErr.message + ")" : ""
    } -> ${destino}`
  );
  await supabase.auth.signOut();
}

await testar("isadora@escritorio.com", "senha123");
await testar("maria@cliente.com", "senha123");
await testar("joao@cliente.com", "senha123");
