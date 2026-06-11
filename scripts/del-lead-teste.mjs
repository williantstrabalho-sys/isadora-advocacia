import { Client } from "pg";
const c = new Client({ ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(
  "delete from public.contatos where nome = 'Lead Teste' returning nome"
);
console.log("removidos:", r.rows.length);
await c.end();
