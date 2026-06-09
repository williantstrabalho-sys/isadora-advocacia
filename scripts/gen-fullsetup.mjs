// Regera supabase/full_setup.sql concatenando as migrations em ordem,
// garantindo UTF-8 sem BOM (evita mojibake de acentos).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migDir = join(__dirname, "..", "supabase", "migrations");

const files = readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let out =
  "-- ============================================================================\n" +
  "-- SETUP COMPLETO — cole tudo no SQL Editor do Supabase e execute (Run).\n" +
  "-- Gerado automaticamente a partir de supabase/migrations/*.sql (UTF-8).\n" +
  "-- ============================================================================\n\n";

for (const f of files) {
  out += `\n-- >>> ${f} >>>\n`;
  out += readFileSync(join(migDir, f), "utf8").replace(/﻿/g, "");
  out += "\n";
}

writeFileSync(join(__dirname, "..", "supabase", "full_setup.sql"), out, {
  encoding: "utf8",
});
console.log(`full_setup.sql regerado a partir de ${files.length} migrations.`);
