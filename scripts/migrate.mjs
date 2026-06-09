import { Client } from "pg";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);

const client = new Client({
  // host/user/password/database/port vêm das variáveis PG* do ambiente
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  console.log("Conectado ao Postgres.");
  for (const f of files) {
    const sql = readFileSync(
      join(__dirname, "..", "supabase", "migrations", f),
      "utf8"
    );
    process.stdout.write(`→ Aplicando ${f} ... `);
    await client.query(sql);
    console.log("OK");
  }
  await client.end();
  console.log("\n✅ Migrations aplicadas.");
} catch (e) {
  console.error("\n❌ Erro:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
}
