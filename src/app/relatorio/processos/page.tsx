import { requireProfile } from "@/lib/auth";
import { AutoPrint } from "@/components/app/auto-print";
import { formatCNJ, formatBRL, formatData } from "@/lib/format";
import {
  TIPO_ACAO_LABEL,
  STATUS_PROCESSO_LABEL,
  ESCRITORIO,
} from "@/lib/constants";
import type { Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Processo & { clientes: { nome: string } | null };

export default async function RelatorioProcessos() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("processos")
    .select("*, clientes(nome)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  const processos = data ?? [];

  return (
    <main className="min-h-screen bg-white p-8 text-black print:p-0">
      <AutoPrint />
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 border-b-2 border-[#d4691e] pb-3">
          <h1 className="text-xl font-bold">{ESCRITORIO.nome}</h1>
          <p className="mt-1 text-xs text-gray-600">
            Relatório de processos · {ESCRITORIO.oab} · {formatData(new Date())}
          </p>
        </header>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="p-1.5">Nº CNJ</th>
              <th className="p-1.5">Cliente</th>
              <th className="p-1.5">Tipo</th>
              <th className="p-1.5">Vara</th>
              <th className="p-1.5">Valor</th>
              <th className="p-1.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="p-1.5 font-mono">{formatCNJ(p.numero_cnj)}</td>
                <td className="p-1.5">{p.clientes?.nome ?? "—"}</td>
                <td className="p-1.5">{TIPO_ACAO_LABEL[p.tipo_acao]}</td>
                <td className="p-1.5">{p.vara ?? "—"}</td>
                <td className="p-1.5">{formatBRL(p.valor_causa)}</td>
                <td className="p-1.5">{STATUS_PROCESSO_LABEL[p.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-[10px] text-gray-500">
          Documento gerado automaticamente. Total: {processos.length}{" "}
          processo(s).
        </p>
      </div>
    </main>
  );
}
