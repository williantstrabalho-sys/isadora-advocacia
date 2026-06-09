import { requireProfile } from "@/lib/auth";
import { AutoPrint } from "@/components/app/auto-print";
import { formatBRL, formatData } from "@/lib/format";
import {
  TIPO_LANCAMENTO_LABEL,
  STATUS_FINANCEIRO_LABEL,
  ESCRITORIO,
} from "@/lib/constants";
import type { Financeiro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RelatorioFinanceiro() {
  const { supabase } = await requireProfile("advogada");

  const agora = new Date();
  const inicioMes = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    1
  ).toISOString();

  const { data } = await supabase
    .from("financeiro")
    .select("*")
    .gte("vencimento", inicioMes.slice(0, 10))
    .order("vencimento", { ascending: true })
    .returns<Financeiro[]>();
  const lancamentos = data ?? [];

  const total = lancamentos.reduce(
    (s, l) => s + (l.tipo === "DESPESA" ? -1 : 1) * Number(l.valor),
    0
  );

  return (
    <main className="min-h-screen bg-white p-8 text-black print:p-0">
      <AutoPrint />
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 border-b-2 border-[#d4691e] pb-3">
          <h1 className="text-xl font-bold">{ESCRITORIO.nome}</h1>
          <p className="mt-1 text-xs text-gray-600">
            Extrato financeiro do mês · {formatData(agora, "MMMM 'de' yyyy")}
          </p>
        </header>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="p-1.5">Descrição</th>
              <th className="p-1.5">Tipo</th>
              <th className="p-1.5">Vencimento</th>
              <th className="p-1.5">Valor</th>
              <th className="p-1.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l) => (
              <tr key={l.id} className="border-b border-gray-100">
                <td className="p-1.5">{l.descricao}</td>
                <td className="p-1.5">{TIPO_LANCAMENTO_LABEL[l.tipo]}</td>
                <td className="p-1.5">{formatData(l.vencimento)}</td>
                <td className="p-1.5">{formatBRL(l.valor)}</td>
                <td className="p-1.5">{STATUS_FINANCEIRO_LABEL[l.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-sm font-semibold">
          Resultado do mês: {formatBRL(total)}
        </p>
      </div>
    </main>
  );
}
