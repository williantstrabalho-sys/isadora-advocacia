import Link from "next/link";
import { ExternalLink, Newspaper, Quote, UserCog, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConteudo } from "@/lib/settings";
import { PageHeader } from "@/components/app/ui-bits";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { salvarConfig } from "./actions";
import { ExpandableCard } from "./expandable-card";
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

const ATALHOS = [
  {
    href: "/dashboard/blog",
    icon: Newspaper,
    title: "Blog",
    description: "Criar, editar e publicar artigos do blog.",
  },
  {
    href: "/dashboard/depoimentos",
    icon: Quote,
    title: "Depoimentos",
    description: "Gerenciar os depoimentos exibidos na página inicial.",
  },
  {
    href: "/dashboard/equipe",
    icon: UserCog,
    title: "Equipe",
    description: "Advogados(as) e associados(as) com acesso ao sistema.",
  },
];

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
        descricao="Dados do escritório, conteúdo do site, blog, depoimentos e equipe."
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

      <div className="grid max-w-3xl gap-4">
        {/* Identidade e contato */}
        <ExpandableCard
          title="Dados de contato e identidade"
          description="Exibidos no rodapé, na seção de contato e na política de privacidade."
          defaultOpen
        >
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
                <Input id="telefone" name="telefone" defaultValue={cfg.telefone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={cfg.email} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" name="endereco" defaultValue={cfg.endereco} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </ExpandableCard>

        {/* Conteúdo da página inicial (CMS) — fechado por padrão (extenso) */}
        <ExpandableCard
          title="Conteúdo da página inicial"
          description="Textos e imagens do site. Cada bloco é salvo separadamente."
        >
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
        </ExpandableCard>

        {/* Atalhos para áreas que agora ficam dentro de Configurações */}
        {ATALHOS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-brand-elevated/40">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-brand-accent" />
                  <div>
                    <p className="font-display text-base font-semibold">
                      {a.title}
                    </p>
                    <p className="text-sm text-brand-muted">{a.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-brand-muted" />
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
