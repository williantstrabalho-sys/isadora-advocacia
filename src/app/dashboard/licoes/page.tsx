import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCNJ } from "@/lib/format";
import { RESULTADO_LABEL, RESULTADO_COLOR } from "@/lib/constants";
import { areaLabel } from "@/lib/areas-config";
import type { AreaDireito } from "@/lib/areas-config";
import type { ProcessoGestao, ResultadoProcesso } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = ProcessoGestao & {
  processos: {
    area: AreaDireito;
    tipo_acao: string;
    numero_cnj: string;
    clientes: { nome: string } | null;
  } | null;
};

export default async function DashboardLicoes() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("processo_gestao")
    .select("*, processos(area, tipo_acao, numero_cnj, clientes(nome))")
    .not("licoes_aprendidas", "is", null)
    .returns<Row[]>();

  const linhas = (data ?? []).filter(
    (r) => (r.licoes_aprendidas ?? "").trim().length > 0
  );

  // Agrupa por área do Direito
  const grupos = new Map<AreaDireito, Row[]>();
  for (const r of linhas) {
    const area = r.processos?.area;
    if (!area) continue;
    if (!grupos.has(area)) grupos.set(area, []);
    grupos.get(area)!.push(r);
  }

  return (
    <>
      <PageHeader
        titulo="Lições aprendidas"
        descricao="Base de conhecimento do escritório — aprendizados de cada processo, organizados por área do Direito."
      />

      {linhas.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          titulo="Nenhuma lição registrada"
          descricao="Registre lições aprendidas na aba de gestão de cada processo."
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grupos.entries()).map(([area, rows]) => (
            <div key={area}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold">
                  {areaLabel(area)}
                </h2>
                <Badge className="border-brand-border bg-brand-elevated text-brand-muted">
                  {rows.length}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {rows.map((r) => (
                  <Card key={r.processo_id}>
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge
                          className={cn(
                            RESULTADO_COLOR[
                              (r.resultado ?? "EM_ANDAMENTO") as ResultadoProcesso
                            ]
                          )}
                        >
                          {RESULTADO_LABEL[r.resultado ?? "EM_ANDAMENTO"]}
                        </Badge>
                        <Link
                          href={`/dashboard/processos/${r.processo_id}`}
                          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
                        >
                          {formatCNJ(r.processos?.numero_cnj)}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-brand-text/90">
                        {r.licoes_aprendidas}
                      </p>
                      {r.processos?.clientes?.nome && (
                        <p className="mt-3 text-xs text-brand-muted">
                          {r.processos.clientes.nome}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
