import { requireProfile } from "@/lib/auth";
import { AutoPrint } from "@/components/app/auto-print";
import { formatBRL, formatData } from "@/lib/format";
import {
  TIPO_ACAO_LABEL,
  RESULTADO_LABEL,
  ESCRITORIO,
} from "@/lib/constants";
import { getConfig } from "@/lib/settings";
import type {
  Processo,
  ProcessoGestao,
  TipoAcaoTrabalhista,
  ResultadoProcesso,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RelatorioDesempenho() {
  const { supabase } = await requireProfile("advogada");
  const cfg = await getConfig();

  const [{ data: procData }, { data: gestaoData }] = await Promise.all([
    supabase.from("processos").select("*").returns<Processo[]>(),
    supabase.from("processo_gestao").select("*").returns<ProcessoGestao[]>(),
  ]);
  const procs = procData ?? [];
  const gestoes = gestaoData ?? [];
  const procById = new Map(procs.map((p) => [p.id, p]));

  const decididos = gestoes.filter((g) => g.resultado !== "EM_ANDAMENTO");
  const exitos = decididos.filter((g) =>
    ["FAVORAVEL", "PARCIAL", "ACORDO"].includes(g.resultado)
  ).length;
  const taxaExito = decididos.length
    ? Math.round((exitos / decididos.length) * 100)
    : null;
  const totalPedido = gestoes.reduce((s, g) => s + (Number(g.valor_pedido) || 0), 0);
  const totalObtido = gestoes.reduce((s, g) => s + (Number(g.valor_sentenca) || 0), 0);
  const aproveitamento =
    totalPedido > 0 ? Math.round((totalObtido / totalPedido) * 100) : null;
  const honorariosExito = gestoes.reduce(
    (s, g) =>
      g.valor_sentenca != null && g.honorario_exito_pct != null
        ? s + (Number(g.valor_sentenca) * Number(g.honorario_exito_pct)) / 100
        : s,
    0
  );
  const tempos = gestoes
    .filter((g) => g.data_encerramento)
    .map((g) => {
      const p = procById.get(g.processo_id);
      if (!p?.data_distribuicao) return null;
      const d = Math.round(
        (new Date(g.data_encerramento!).getTime() -
          new Date(p.data_distribuicao).getTime()) /
          86400000
      );
      return d >= 0 ? d : null;
    })
    .filter((d): d is number => d != null);
  const tempoMedio = tempos.length
    ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
    : null;

  const desfechos = (
    ["FAVORAVEL", "PARCIAL", "ACORDO", "DESFAVORAVEL", "EM_ANDAMENTO"] as ResultadoProcesso[]
  )
    .map((r) => ({
      label: RESULTADO_LABEL[r],
      total: gestoes.filter((g) => g.resultado === r).length,
    }))
    .filter((d) => d.total > 0);

  const porTipo = (Object.keys(TIPO_ACAO_LABEL) as TipoAcaoTrabalhista[])
    .map((tipo) => {
      const gs = gestoes.filter(
        (g) => procById.get(g.processo_id)?.tipo_acao === tipo
      );
      const dec = gs.filter((g) => g.resultado !== "EM_ANDAMENTO");
      const ex = dec.filter((g) =>
        ["FAVORAVEL", "PARCIAL", "ACORDO"].includes(g.resultado)
      ).length;
      return {
        label: TIPO_ACAO_LABEL[tipo],
        total: gs.length,
        decididos: dec.length,
        exitoPct: dec.length ? Math.round((ex / dec.length) * 100) : null,
      };
    })
    .filter((t) => t.total > 0);

  const cell = { padding: "6px 8px", borderBottom: "1px solid #eee" } as const;
  const th = { padding: "6px 8px", textAlign: "left" as const };

  return (
    <main className="min-h-screen bg-white p-8 text-black print:p-0">
      <AutoPrint />
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 border-b-2 border-[#d4691e] pb-3">
          <h1 className="text-xl font-bold">{cfg.escritorio_nome || ESCRITORIO.nome}</h1>
          <p className="mt-1 text-xs text-gray-600">
            Relatório de desempenho · {cfg.oab} · {formatData(new Date())}
          </p>
        </header>

        {/* KPIs */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { l: "Taxa de êxito", v: taxaExito != null ? `${taxaExito}%` : "—" },
            { l: "Aproveitamento", v: aproveitamento != null ? `${aproveitamento}%` : "—" },
            { l: "Tempo médio", v: tempoMedio != null ? `${tempoMedio} dias` : "—" },
            { l: "Honorários de êxito", v: formatBRL(honorariosExito) },
          ].map((k) => (
            <div key={k.l} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">{k.l}</p>
              <p className="mt-1 text-lg font-bold">{k.v}</p>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <p className="text-sm">
            Total reivindicado: <strong>{formatBRL(totalPedido)}</strong> ·
            Total obtido: <strong>{formatBRL(totalObtido)}</strong> ·
            Processos com gestão: <strong>{gestoes.length}</strong> ·
            Decididos: <strong>{decididos.length}</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-base font-semibold">Desfechos</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={th}>Desfecho</th>
                <th style={th}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {desfechos.map((d) => (
                <tr key={d.label}>
                  <td style={cell}>{d.label}</td>
                  <td style={cell}>{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Aproveitamento por tipo de ação</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={th}>Tipo de ação</th>
                <th style={th}>Casos</th>
                <th style={th}>Decididos</th>
                <th style={th}>Taxa de êxito</th>
              </tr>
            </thead>
            <tbody>
              {porTipo.map((t) => (
                <tr key={t.label}>
                  <td style={cell}>{t.label}</td>
                  <td style={cell}>{t.total}</td>
                  <td style={cell}>{t.decididos}</td>
                  <td style={cell}>{t.exitoPct != null ? `${t.exitoPct}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="mt-8 text-[10px] text-gray-500">
          Documento gerado automaticamente para uso interno do escritório.
        </p>
      </div>
    </main>
  );
}
