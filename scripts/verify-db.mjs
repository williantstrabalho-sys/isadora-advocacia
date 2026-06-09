import { Client } from "pg";

const client = new Client({ ssl: { rejectUnauthorized: false } });
await client.connect();

const cfg = await client.query("select telefone, oab, endereco from public.configuracoes where id = 1");
const dep = await client.query("select count(*)::int as n from public.depoimentos");
const col = await client.query(
  "select column_name from information_schema.columns where table_schema='public' and table_name='contatos' and column_name='telefone'"
);

console.log("configuracoes(id=1):", cfg.rows[0] || "VAZIO");
console.log("depoimentos:", dep.rows[0].n);
console.log("contatos.telefone existe:", col.rows.length > 0);

await client.end();
