import { Client } from "pg";
const c = new Client({ ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query("delete from public.site_conteudo where chave = 'hero' returning chave");
console.log("removido:", r.rows);
await c.end();
