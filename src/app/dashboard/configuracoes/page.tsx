import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConteudo } from "@/lib/settings";
import { PageHeader } from "@/components/app/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { salvarConfig } from "./actions";
import {
  HeroEditor,
  EspecialidadesEditor,
  SobreEditor,
  FaqEditor,
  TitulosEditor,
  ImagensEditor,
} from "../conteudo/conteudo-editores";
import type { Configuracao } from "@/lib/types";
import { ESCRITORIO } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardConfiguracoes() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("id", 1)
    .single<Configuracao>();

  const cfg = {
    escritorio_nome: data?.escritorio_nome ?? ESCRITORIO.nome,
    advogada_nome: data?.advogada_nome ?? ESCRITORIO.advogada,
    oab: data?.oab ?? ESCRITORIO.oab,
    email: data?.email ?? ESCRITORIO.email,
    telefone: data?.telefone ?? ESCRITORIO.telefone,
    endereco: data?.endereco ?? ESCRITORIO.endereco,
  };

  const c = await getConteudo();

  return (
    <>
      <PageHeader
        titulo="Configurações"
        descricao="Dados do escritório e todo o conteúdo da página inicial."
        acao={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
          >
            Ver site <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />

      {/* Subtópico 1 — Dados de contato e identidade */}
      <section className="mb-10">
        <h2 className="mb-1 font-display text-lg font-semibold">
          Dados de contato e identidade
        </h2>
        <p className="mb-4 text-sm text-brand-muted">
          Exibidos no rodapé, na seção de contato e na política de privacidade.
        </p>
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form action={salvarConfig} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="escritorio_nome">Nome do escritório</Label>
                  <Input
                    id="escritorio_nome"
                    name="escritorio_nome"
                    defaultValue={cfg.escritorio_nome}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="advogada_nome">Nome da advogada</Label>
                  <Input
                    id="advogada_nome"
                    name="advogada_nome"
                    defaultValue={cfg.advogada_nome}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="oab">OAB</Label>
                  <Input id="oab" name="oab" defaultValue={cfg.oab} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    defaultValue={cfg.telefone}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={cfg.email}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    defaultValue={cfg.endereco}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Salvar alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Subtópico 2 — Conteúdo da página inicial (CMS) */}
      <section>
        <h2 className="mb-1 font-display text-lg font-semibold">
          Conteúdo da página inicial
        </h2>
        <p className="mb-4 text-sm text-brand-muted">
          Textos e imagens do site. As alterações aparecem assim que você salva
          cada bloco.
        </p>
        <div className="grid gap-6">
          <ImagensEditor inicial={c.imagens} />
          <HeroEditor inicial={c.hero} />
          <EspecialidadesEditor inicial={c.especialidades} />
          <SobreEditor inicial={c.sobre} />
          <TitulosEditor
            chave="depoimentos"
            titulo="Seção de depoimentos (título)"
            inicial={c.depoimentos}
          />
          <FaqEditor inicial={c.faq} />
          <TitulosEditor
            chave="contato"
            titulo="Seção de contato (título)"
            inicial={c.contato}
          />
        </div>
        <p className="mt-6 text-xs text-brand-muted">
          Os depoimentos em si são gerenciados na aba “Depoimentos”.
        </p>
      </section>
    </>
  );
}
