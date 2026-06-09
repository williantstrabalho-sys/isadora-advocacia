import { Quote, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { DepoimentoForm } from "./depoimento-form";
import { excluirDepoimento } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Depoimento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardDepoimentos() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("depoimentos")
    .select("*")
    .order("ordem", { ascending: true })
    .returns<Depoimento[]>();
  const depoimentos = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Depoimentos"
        descricao="Relatos de clientes exibidos na página inicial (sem identificação completa — LGPD)."
        acao={<DepoimentoForm />}
      />

      {depoimentos.length === 0 ? (
        <EmptyState
          icon={Quote}
          titulo="Nenhum depoimento"
          descricao="Adicione o primeiro relato de cliente."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {depoimentos.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-muted">
                      #{d.ordem}
                    </span>
                    {d.publicado ? (
                      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="border-zinc-500/30 bg-zinc-500/15 text-zinc-400">
                        Oculto
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <DepoimentoForm depoimento={d} />
                    <form action={excluirDepoimento}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </form>
                  </div>
                </div>
                <Quote className="h-5 w-5 text-brand-accent" />
                <p className="mt-2 text-sm text-brand-text/90">“{d.texto}”</p>
                <p className="mt-3 text-sm font-medium">{d.autor}</p>
                {d.contexto && (
                  <p className="text-xs text-brand-muted">{d.contexto}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
