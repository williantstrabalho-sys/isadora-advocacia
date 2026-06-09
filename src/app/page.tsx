import Link from "next/link";
import Image from "next/image";
import {
  Scale,
  Clock,
  ShieldAlert,
  Wallet,
  HeartPulse,
  Users,
  ArrowRight,
  GraduationCap,
  Quote,
} from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ContactForm } from "@/components/public/contact-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ESPECIALIDADES, FAQ } from "@/lib/constants";
import { getConfig, getDepoimentos } from "@/lib/settings";

const ICONES = [Scale, Clock, ShieldAlert, Wallet, HeartPulse, Users];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cfg = await getConfig();
  const depoimentos = await getDepoimentos();
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-brand-border">
          {/* Foto da advogada — alinhada à direita */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[58%] sm:w-3/5 lg:w-1/2"
          >
            <Image
              src="/isadora-hero.png"
              alt="Isadora Gonçalves"
              fill
              priority
              sizes="(max-width: 640px) 58vw, 50vw"
              className="object-cover object-top"
            />
            {/* Degradê à esquerda para o texto não conflitar com a imagem */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-transparent sm:via-brand-bg/55" />
            {/* Suaviza topo e base */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg/40" />
          </div>

          <div className="container relative z-10 py-14 md:py-24">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-brand-text md:text-6xl">
                Defesa técnica dos seus{" "}
                <span className="text-brand-accent">direitos trabalhistas</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-brand-muted">
                Atuação dedicada em questões da relação de emprego — da análise
                do caso ao acompanhamento processual. Orientação clara, sem
                promessas: apenas trabalho técnico e transparente.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="#contato">
                    Agendar uma consulta <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#especialidades">Ver áreas de atuação</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ESPECIALIDADES */}
        <section id="especialidades" className="border-b border-brand-border">
          <div className="container py-20">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Especialidades trabalhistas
              </h2>
              <p className="mt-3 text-brand-muted">
                Áreas de atuação na Justiça do Trabalho, com foco na proteção do
                trabalhador e na correta aplicação da legislação.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-brand-border bg-brand-border sm:grid-cols-2 lg:grid-cols-3">
              {ESPECIALIDADES.map((esp, i) => {
                const Icon = ICONES[i % ICONES.length];
                return (
                  <div
                    key={esp.titulo}
                    className="group bg-brand-surface p-8 transition-colors hover:bg-brand-elevated"
                  >
                    <Icon className="h-7 w-7 text-brand-accent" />
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {esp.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {esp.descricao}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="border-b border-brand-border">
          <div className="container grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Sobre a advogada
              </h2>
              <div className="mt-6 space-y-4 text-brand-muted">
                <p>
                  <span className="text-brand-text font-medium">
                    {cfg.advogada_nome}
                  </span>{" "}
                  é advogada inscrita na {cfg.oab}, dedicada
                  exclusivamente ao Direito do Trabalho. Atua na orientação de
                  trabalhadores e no acompanhamento de processos perante a
                  Justiça do Trabalho, com atenção especial às varas do Distrito
                  Federal e ao TRT da 10ª Região.
                </p>
                <p>
                  O escritório preza por um atendimento individualizado,
                  informação clara sobre cada etapa e respeito integral aos
                  deveres éticos da advocacia.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="flex items-start gap-3 p-5">
                    <GraduationCap className="h-6 w-6 shrink-0 text-brand-accent" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-muted">
                        Pós-graduação
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-brand-text">
                        Direito e Processo do Trabalho e Direito Previdenciário
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-start gap-3 p-5">
                    <GraduationCap className="h-6 w-6 shrink-0 text-brand-accent" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-muted">
                        Pós-graduação
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-brand-text">
                        Arbitragem e Mediação de Conflitos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
                <Image
                  src="/isadora-sobre.png"
                  alt={`${cfg.advogada_nome} — ${cfg.oab}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover object-center"
                />
                {/* legenda com leve degradê na base */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                  <p className="font-display text-lg text-white">
                    {cfg.advogada_nome}
                  </p>
                  <p className="text-sm text-white/70">{cfg.oab}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="border-b border-brand-border">
          <div className="container py-20">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              O que dizem os clientes
            </h2>
            <p className="mt-3 text-sm text-brand-muted">
              Depoimentos sem identificação completa, em respeito à privacidade
              (LGPD).
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {depoimentos.map((dep) => (
                <Card key={dep.autor}>
                  <CardContent className="p-6">
                    <Quote className="h-6 w-6 text-brand-accent" />
                    <p className="mt-4 text-sm leading-relaxed text-brand-text/90">
                      “{dep.texto}”
                    </p>
                    <p className="mt-6 text-sm font-medium text-brand-text">
                      {dep.autor}
                    </p>
                    <p className="text-xs text-brand-muted">{dep.contexto}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b border-brand-border">
          <div className="container py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Dúvidas frequentes
                </h2>
                <p className="mt-3 text-brand-muted">
                  Informações de caráter geral sobre Direito Trabalhista. Não
                  substituem a análise individual do seu caso.
                </p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger>{item.pergunta}</AccordionTrigger>
                    <AccordionContent>{item.resposta}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato">
          <div className="container py-20">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Entre em contato
                </h2>
                <p className="mt-3 text-brand-muted">
                  Envie sua dúvida pelo formulário. O preenchimento não constitui
                  contratação de serviços nem garante resultado — trata-se apenas
                  de um canal de comunicação.
                </p>
                <div className="mt-8 space-y-3 text-sm text-brand-muted">
                  <p>
                    <span className="text-brand-text">E-mail:</span>{" "}
                    {cfg.email}
                  </p>
                  <p>
                    <span className="text-brand-text">Telefone:</span>{" "}
                    {cfg.telefone}
                  </p>
                  <p>
                    <span className="text-brand-text">Endereço:</span>{" "}
                    {cfg.endereco}
                  </p>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
