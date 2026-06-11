import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// senha forte e legível (sem caracteres ambíguos)
function novaSenha(n = 14) {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const b = randomBytes(n);
  return Array.from(b, (x) => abc[x % abc.length]).join("");
}

const { data } = await admin.auth.admin.listUsers();
const alvos = [
  "isadora@escritorio.com",
  "maria@cliente.com",
  "joao@cliente.com",
];

for (const email of alvos) {
  const u = data.users.find((x) => x.email === email);
  if (!u) {
    console.log(`(não encontrado) ${email}`);
    continue;
  }
  const senha = novaSenha();
  const { error } = await admin.auth.admin.updateUserById(u.id, {
    password: senha,
  });
  console.log(`${error ? "ERRO" : "OK"}  ${email}  ->  ${senha}`);
}
