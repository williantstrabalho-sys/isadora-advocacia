import { Client } from "pg";

const client = new Client({ ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows: procs } = await client.query(
  "select id, valor_causa, data_distribuicao from public.processos order by created_at asc"
);

let i = 0;
for (const p of procs) {
  i++;
  const pedido = Number(p.valor_causa) || 30000;
  if (i === 1) {
    // processo decidido (favorável) para demonstrar os indicadores
    await client.query(
      `insert into public.processo_gestao
        (processo_id, valor_pedido, valor_sentenca, resultado, data_encerramento, honorario_exito_pct, licoes_aprendidas)
       values ($1,$2,$3,'FAVORAVEL',$4,30,$5)
       on conflict (processo_id) do update set
         valor_pedido=excluded.valor_pedido, valor_sentenca=excluded.valor_sentenca,
         resultado=excluded.resultado, data_encerramento=excluded.data_encerramento,
         honorario_exito_pct=excluded.honorario_exito_pct, licoes_aprendidas=excluded.licoes_aprendidas`,
      [
        p.id,
        pedido,
        Math.round(pedido * 0.85),
        p.data_distribuicao || "2024-01-01",
        "Controle de ponto ausente fortaleceu a tese (Súmula 338 do TST). Reunir testemunhas no início.",
      ]
    );
  } else {
    // processo em andamento (apenas valor pedido)
    await client.query(
      `insert into public.processo_gestao (processo_id, valor_pedido, resultado, honorario_exito_pct)
       values ($1,$2,'EM_ANDAMENTO',30)
       on conflict (processo_id) do update set valor_pedido=excluded.valor_pedido`,
      [p.id, pedido]
    );
  }
}

const { rows } = await client.query(
  "select count(*)::int n from public.processo_gestao"
);
console.log("processo_gestao populado:", rows[0].n, "registro(s)");
await client.end();
