import { Calendar, MapPin, Trash2, AlertTriangle, Gavel } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { TipoAgendaBadge } from "@/components/app/status-badge";
import { EventoForm } from "./evento-form";
import { excluirEvento } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatData, diasAte } from "@/lib/format";
import type { AgendaEvento, Processo } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardAgenda() {
  const { supabase } = await requireProfile("advogada");

  const [{ data: agendaData }, { data: procData }] = await Promise.all([
    supabase
      .from("agenda")
      .select("*")
      .order("data", { ascending: true })
      .returns<AgendaEvento[]>(),
    supabase
      .from("processos")
      .select("id, numero_cnj")
      .order("created_at", { ascending: false })
      .returns<Pick<Processo, "id" | "numero_cnj">[]>(),
  ]);

  const eventos = agendaData ?? [];
  const processos = (procData ?? []).map((p) => ({
    id: p.id,
    nome: p.numero_cnj,
  }));

  // futuros primeiro; passados ao final
  const futuros = eventos.filter((e) => (diasAte(e.data) ?? -1) >= 0);
  const passados = eventos.filter((e) => (diasAte(e.data) ?? -1) < 0).reverse();
  const ordenados = [...futuros, ...passados];

  return (
    <>
      <PageHeader
        titulo="Agenda e prazos"
        descricao="Audiências, prazos processuais, reuniões e perícias. Prazos com menos de 3 dias recebem alerta."
        acao={<EventoForm processos={processos} />}
      />

      {ordenados.length === 0 ? (
        <EmptyState
          icon={Calendar}
          titulo="Agenda vazia"
          descricao="Cadastre audiências e prazos para acompanhá-los aqui."
        />
      ) : (
        <div className="space-y-3">
          {ordenados.map((e) => {
            const dias = diasAte(e.data);
            const critico = dias != null && dias >= 0 && dias < 3;
            const passado = dias != null && dias < 0;
            const trt10 =
              e.tipo === "AUDIENCIA" &&
              (e.local?.toUpperCase().includes("TRT-10") ||
                e.local?.toUpperCase().includes("TRT 10") ||
                e.local?.toUpperCase().includes("TRT10"));

            return (
              <Card
                key={e.id}
                className={cn(
                  critico && "border-red-500/40",
                  trt10 && !critico && "border-brand-accent/40",
                  passado && "opacity-60"
                )}
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 flex-col items-center justify-center rounded-md border text-center",
                        critico
                          ? "border-red-500/40 text-red-400"
                          : "border-brand-border text-brand-text"
                      )}
                    >
                      <span className="text-[10px] uppercase">
                        {formatData(e.data, "MMM")}
                      </span>
                      <span className="font-display text-lg font-bold leading-none">
                        {formatData(e.data, "dd")}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{e.titulo}</p>
                        {trt10 && (
                          <Badge className="border-brand-accent/40 bg-brand-accent/10 text-brand-accent">
                            <Gavel className="mr-1 h-3 w-3" /> TRT-10
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                        <span>{formatData(e.data)}</span>
                        {e.hora && <span>{e.hora.slice(0, 5)}</span>}
                        {e.local && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {e.local}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {critico && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {dias === 0 ? "Hoje" : `${dias}d`}
                      </span>
                    )}
                    <TipoAgendaBadge tipo={e.tipo} />
                    <EventoForm processos={processos} evento={e} />
                    <form action={excluirEvento}>
                      <input type="hidden" name="id" value={e.id} />
                      <Button type="submit" variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
