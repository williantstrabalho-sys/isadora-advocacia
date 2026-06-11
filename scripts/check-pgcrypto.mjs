import { Client } from "pg";
const c = new Client({ ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(
  "select e.extname, n.nspname as schema from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgcrypto'"
);
console.log("pgcrypto:", r.rows);
await c.end();
