import { Client } from "pg";
const client = new Client({ ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(`
  update public.processo_gestao g
  set data_encerramento = (p.data_distribuicao + interval '240 days')::date
  from public.processos p
  where g.processo_id = p.id
    and g.resultado = 'FAVORAVEL'
    and p.data_distribuicao is not null
  returning g.processo_id, g.data_encerramento
`);
console.log("atualizados:", r.rowCount, r.rows);
await client.end();
