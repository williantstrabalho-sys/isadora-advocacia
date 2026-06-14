import Link from "next/link";
import { Sparkles, Lock, ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/app/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { iaDisponivel, temChaveIA, getIAHabilitada } from "@/lib/ia";
import { AssistenteTool } from "./assistente-tool";

export const dynamic = "force-dynamic";

export default async function DashboardAssistente() {
  await requireProfile("advogada");
  const disponivel = await iaDisponivel();
  const temChave = temChaveIA();
  const habilitada = await getIAHabilitada();

  return (
    <>
      <PageHeader
        titulo="Assistente de IA"
        descricao="Resuma intimações, melhore textos e redija minutas com inteligência artificial. Sempre revise o resultado antes de usar."
      />

      {disponivel ? (
        <AssistenteTool />
      ) : (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-elevated">
                <Lock className="h-5 w-5 text-brand-accent" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">
                  Assistente de IA desativado
                </p>
                <p className="text-sm text-brand-muted">
                  Recurso opcional — gera custo por uso (pago à parte).
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-brand-text/90">
              Para ativar são necessárias duas coisas:
            </p>
            <ol className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>
                  <strong>Chave de API</strong> configurada no servidor:{" "}
                  {temChave ? (
                    <span className="text-emerald-400">já configurada ✓</span>
                  ) : (
                    <span className="text-brand-muted">
                      pendente (variável <code>ANTHROPIC_API_KEY</code> na Vercel)
                    </span>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>
                  <strong>Ativar o recurso</strong> em Configurações:{" "}
                  {habilitada ? (
                    <span className="text-emerald-400">ativado ✓</span>
                  ) : (
                    <span className="text-brand-muted">desativado</span>
                  )}
                </span>
              </li>
            </ol>

            <Link
              href="/dashboard/configuracoes"
              className="mt-5 inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
            >
              Ir para Configurações <ExternalLink className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}
