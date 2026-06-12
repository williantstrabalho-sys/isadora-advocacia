import { Inbox, Mail, Phone, Trash2, Check, Undo2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { marcarLido, excluirContato } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AtendimentoTabs } from "../atendimento-tabs";
import type { Contato } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardContatos() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("contatos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Contato[]>();
  const contatos = data ?? [];
  const novos = contatos.filter((c) => !c.lido).length;

  return (
    <>
      <PageHeader
        titulo="Atendimento"
        descricao={
          novos > 0
            ? `${novos} novo(s) contato(s) do formulário do site.`
            : "Mensagens enviadas pelo formulário de contato do site."
        }
      />
      <AtendimentoTabs />

      {contatos.length === 0 ? (
        <EmptyState
          icon={Inbox}
          titulo="Nenhum contato ainda"
          descricao="Os envios do formulário 'Entre em contato' do site aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {contatos.map((c) => (
            <Card
              key={c.id}
              className={cn(!c.lido && "border-brand-accent/40")}
            >
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.nome}</p>
                      {!c.lido && (
                        <Badge className="border-brand-accent bg-brand-accent text-black">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1 hover:text-brand-accent"
                      >
                        <Mail className="h-3 w-3" /> {c.email}
                      </a>
                      {c.telefone && (
                        <a
                          href={`tel:${c.telefone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center gap-1 hover:text-brand-accent"
                        >
                          <Phone className="h-3 w-3" /> {c.telefone}
                        </a>
                      )}
                      <span>{formatDataHora(c.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={marcarLido}>
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        type="hidden"
                        name="lido"
                        value={(!c.lido).toString()}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        {c.lido ? (
                          <>
                            <Undo2 className="h-4 w-4" /> Marcar não lido
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" /> Marcar lido
                          </>
                        )}
                      </Button>
                    </form>
                    <form action={excluirContato}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </form>
                  </div>
                </div>

                {c.assunto && (
                  <p className="mt-3 text-sm font-medium text-brand-text">
                    {c.assunto}
                  </p>
                )}
                <p className="mt-1 whitespace-pre-wrap text-sm text-brand-text/90">
                  {c.mensagem}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
