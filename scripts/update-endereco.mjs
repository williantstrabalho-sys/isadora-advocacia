import { Client } from "pg";
const client = new Client({ ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(
  "update public.configuracoes set endereco = $1, atualizado_em = now() where id = 1 returning endereco",
  ["Brasília/DF"]
);
console.log("endereco atualizado:", r.rows[0]?.endereco);
await client.end();
