import { Client } from "pg";
const c = new Client({ ssl: { rejectUnauthorized: false } });
await c.connect();
// reverte apenas se ainda contiver o texto do teste (não toca em dado real)
const r = await c.query(
  "update public.processos set obs = null where obs in ('editado pelo associado','invasao') returning numero_cnj, obs"
);
console.log("processos corrigidos:", r.rowCount, r.rows.map((x) => x.numero_cnj));
await c.end();
