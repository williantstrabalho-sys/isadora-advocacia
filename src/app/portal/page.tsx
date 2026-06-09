import Link from "next/link";
import {
  Briefcase,
  CalendarClock,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, StatCard, EmptyState } from "@/components/app/ui-bits";
import { StatusProcessoBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatData, formatCNJ, diasAte } from "@/lib/format";
import { TIPO_ACAO_LABEL } from "@/lib/constants";
import type { Processo, Documento, Mensagem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortalPainel() {
  const { supabase, profile } = await requireProfile("cliente");

  const [{ data: processos }, { data: docs }, { data: msgs }] =
    await Promise.all([
      supabase
        .from("processos")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Processo[]>(),
      supabase
        .from("documentos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<Documento[]>(),
      supabase
        .from("mensagens")
        .select("*")
        .eq("lida", false)
        .returns<Mensagem[]>(),
    ]);

  const processosList = processos ?? [];
  const documentos = docs ?? [];
  const ativos = processosList.filter((p) => p.status === "ATIVO").length;

  // próxima audiência
  const proximas = processosList
    .filter((p) => p.data_audiencia && new Date(p.data_audiencia) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.data_audiencia!).getTime() -
        new Date(b.data_audiencia!).getTime()
    );
  const proximoPrazo = proximas[0]?.data_audiencia ?? null;

  const naoLidasDaAdvogada = (msgs ?? []).filter(
    (m) => m.remetente_id !== profile.id
  ).length;

  return (
    <>
      <PageHeader
        titulo={`Olá, ${profile.nome.split(" ")[0]}`}
        descricao="Acompanhe aqui o andamento dos seus processos e documentos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          titulo="Processos ativos"
          valor={ativos}
          icon={Briefcase}
          hint={`${processosList.length} no total`}
        />
        <StatCard
          titulo="Próximo prazo"
          valor={proximoPrazo ? formatData(proximoPrazo) : "—"}
          icon={CalendarClock}
          hint={
            proximoPrazo
              ? `em ${diasAte(proximoPrazo)} dia(s)`
              : "Sem audiências marcadas"
          }
          alerta={proximoPrazo != null && (diasAte(proximoPrazo) ?? 99) <= 3}
        />
        <StatCard
          titulo="Documentos"
          valor={documentos.length}
          icon={FileText}
          hint="recentes"
        />
        <StatCard
          titulo="Mensagens não lidas"
          valor={naoLidasDaAdvogada}
          icon={MessageSquare}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Meus processos</CardTitle>
            <Link
              href="/portal/processos"
              className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {processosList.length === 0 ? (
              <EmptyState
                titulo="Nenhum processo"
                descricao="Você ainda não possui processos cadastrados."
              />
            ) : (
              <ul className="divide-y divide-brand-border">
                {processosList.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/portal/processos/${p.id}`}
                      className="flex items-center justify-between py-3 transition-colors hover:text-brand-accent"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {TIPO_ACAO_LABEL[p.tipo_acao]}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {formatCNJ(p.numero_cnj)}
                        </p>
                      </div>
                      <StatusProcessoBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Documentos recentes</CardTitle>
            <Link
              href="/portal/documentos"
              className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {documentos.length === 0 ? (
              <EmptyState
                titulo="Nenhum documento"
                descricao="Os documentos do seu caso aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-brand-border">
                {documentos.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-brand-accent" />
                      <span className="text-sm">{d.nome}</span>
                    </div>
                    <span className="text-xs text-brand-muted">
                      {formatData(d.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
