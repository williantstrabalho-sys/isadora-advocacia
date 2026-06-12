import { CalendarClock, MapPin, Check, MessageSquareWarning } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatData } from "@/lib/format";
import { ReuniaoFeedback } from "./reuniao-feedback";
import type { AgendaEvento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalReunioes() {
  const { supabase } = await requireProfile("cliente");

  // RLS limita aos eventos vinculados ao cliente do usuário.
  const { data } = await supabase
    .from("agenda")
    .select("*")
    .eq("tipo", "REUNIAO")
    .order("data", { ascending: false })
    .returns<AgendaEvento[]>();
  const reunioes = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Reuniões"
        descricao="Pautas e atas das suas reuniões. Você pode confirmar que está de acordo ou solicitar ajuste."
      />

      {reunioes.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          titulo="Nenhuma reunião"
          descricao="Quando uma reunião for registrada com pauta, ela aparecerá aqui."
        />
      ) : (
        <div className="space-y-4">
          {reunioes.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{r.titulo}</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-brand-muted">
                    <span>
                      {formatData(r.data)}
                      {r.hora ? ` · ${r.hora.slice(0, 5)}` : ""}
                    </span>
                    {r.local && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.local}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {r.pauta ? (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-brand-muted">
                      Pauta / ata
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-brand-text/90">
                      {r.pauta}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-brand-muted">
                    Pauta ainda não disponibilizada.
                  </p>
                )}

                {/* Status / retorno do cliente */}
                {r.cliente_ajuste ? (
                  <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-amber-400">
                      <MessageSquareWarning className="h-4 w-4" /> Ajuste
                      solicitado
                    </p>
                    <p className="mt-1 text-sm text-brand-text/90">
                      {r.cliente_ajuste}
                    </p>
                  </div>
                ) : r.cliente_de_acordo ? (
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
                    <Check className="h-4 w-4" /> Você confirmou que está de
                    acordo com a ata.
                  </p>
                ) : r.pauta ? (
                  <ReuniaoFeedback id={r.id} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
