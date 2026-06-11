import { Client } from "pg";
const c = new Client({ ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(
  "delete from public.clientes where nome in ('Cliente Verificação','Teste Fechamento','Teste Diagnóstico') returning nome"
);
console.log("removidos:", r.rows.map((x) => x.nome));
await c.end();
