import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getConfig } from "@/lib/settings";
import { montarContexto, preencherModelo } from "@/lib/modelos";
import { BotaoImprimir } from "./print-button";
import type { ModeloDocumento, ClienteDetalhe, Processo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ImprimirDocumento({
  searchParams,
}: {
  searchParams: { modelo?: string; cliente?: string; processo?: string };
}) {
  const { supabase } = await requireProfile("advogada");
  const { modelo: modeloId, cliente: clienteId, processo: processoId } = searchParams;

  if (!modeloId || !clienteId) notFound();

  const { data: modelo } = await supabase
    .from("modelos_documento")
    .select("*")
    .eq("id", modeloId)
    .single<ModeloDocumento>();
  if (!modelo) notFound();

  const { data: detalheRaw } = await supabase.rpc("cliente_detalhe", {
    p_cliente_id: clienteId,
  });
  const cliente = ((detalheRaw ?? []) as ClienteDetalhe[])[0] ?? null;

  let processo: Processo | null = null;
  if (processoId) {
    const { data } = await supabase
      .from("processos")
      .select("*")
      .eq("id", processoId)
      .single<Processo>();
    processo = data ?? null;
  }

  const config = await getConfig();
  const ctx = montarContexto({ cliente, processo, config });
  const texto = preencherModelo(modelo.conteudo, ctx);

  return (
    <main className="min-h-screen bg-white p-8 text-black print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-sm text-gray-500">{modelo.nome}</p>
          <BotaoImprimir />
        </div>

        <article
          className="whitespace-pre-wrap"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "12pt", lineHeight: 1.6 }}
        >
          {texto}
        </article>

        <p className="mt-10 text-[10px] text-gray-400 print:hidden">
          Revise o documento antes de imprimir. Campos sem dados aparecem como
          linha em branco (____________) para preenchimento manual.
        </p>
      </div>
    </main>
  );
}
