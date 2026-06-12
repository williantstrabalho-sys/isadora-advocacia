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
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SiteHeaderServer } from "@/components/public/site-header-server";
import { SiteFooter } from "@/components/public/site-footer";
import { ContactForm } from "@/components/public/contact-form";
import { DepoimentosCarousel } from "@/components/public/depoimentos-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConfig, getDepoimentos, getConteudo } from "@/lib/settings";
import { SITE_URL } from "@/lib/constants";

// Ícones das especialidades — parte da estrutura fixa (não editável)
const ICONES = [Scale, Clock, ShieldAlert, Wallet, HeartPulse, Users];

export const revalidate = 300;

export default async function HomePage() {
  const cfg = await getConfig();
  const depoimentos = await getDepoimentos();
  const c = await getConteudo();

  // WhatsApp a partir do telefone configurado (acrescenta DDI 55 se faltar).
  const telDigits = (cfg.telefone || "").replace(/\D/g, "");
  const waNumero = telDigits
    ? telDigits.startsWith("55")
      ? telDigits
      : `55${telDigits}`
    : "";
  const whatsappHref = waNumero
    ? `https://wa.me/${waNumero}?text=${encodeURIComponent(
        "Olá! Vim pelo site e gostaria de tirar uma dúvida."
      )}`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: cfg.escritorio_nome,
    description:
      "Escritório especializado em Direito Trabalhista em Brasília/DF.",
    url: SITE_URL,
    telephone: cfg.telefone,
    email: cfg.email,
    areaServed: "Brasília/DF",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brasília",
      addressRegion: "DF",
      addressCountry: "BR",
      streetAddress: cfg.endereco,
    },
    founder: {
      "@type": "Person",
      name: cfg.advogada_nome,
      jobTitle: "Advogada",
    },
    knowsAbout: c.especialidades.itens.map((e) => e.titulo),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeaderServer />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-brand-border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[58%] overflow-hidden sm:w-3/5 lg:w-1/2"
          >
            <Image
              src={c.imagens.hero}
              alt={cfg.advogada_nome}
              fill
              priority
              sizes="(max-width: 640px) 58vw, 50vw"
              className="object-cover"
              style={{
                objectPosition: c.imagens.hero_pos ?? "50% 20%",
                transform: `scale(${c.imagens.hero_zoom ?? 1})`,
                transformOrigin: c.imagens.hero_pos ?? "50% 20%",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-transparent sm:via-brand-bg/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg/40" />
          </div>

          <div className="container relative z-10 py-14 md:py-24">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-brand-text md:text-6xl">
                {c.hero.titulo}{" "}
                <span className="text-brand-accent">{c.hero.destaque}</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-brand-muted">
                {c.hero.subtitulo}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={c.hero.cta1_href}>
                    {c.hero.cta1_label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={c.hero.cta2_href}>{c.hero.cta2_label}</Link>
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
                {c.especialidades.titulo}
              </h2>
              <p className="mt-3 text-brand-muted">
                {c.especialidades.subtitulo}
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-brand-border bg-brand-border sm:grid-cols-2 lg:grid-cols-3">
              {c.especialidades.itens.map((esp, i) => {
                const Icon = ICONES[i % ICONES.length];
                return (
                  <div
                    key={i}
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
                {c.sobre.titulo}
              </h2>
              <div className="mt-6 space-y-4 text-brand-muted">
                {c.sobre.paragrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {c.sobre.formacoes.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {c.sobre.formacoes.map((f, i) => (
                    <Card key={i}>
                      <CardContent className="flex items-start gap-3 p-5">
                        <GraduationCap className="h-6 w-6 shrink-0 text-brand-accent" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-brand-muted">
                            {f.rotulo}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-brand-text">
                            {f.valor}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
                <Image
                  src={c.imagens.sobre}
                  alt={`${cfg.advogada_nome} — ${cfg.oab}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover"
                  style={{
                    objectPosition: c.imagens.sobre_pos ?? "50% 50%",
                    transform: `scale(${c.imagens.sobre_zoom ?? 1})`,
                    transformOrigin: c.imagens.sobre_pos ?? "50% 50%",
                  }}
                />
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
              {c.depoimentos.titulo}
            </h2>
            <p className="mt-3 text-sm text-brand-muted">
              {c.depoimentos.subtitulo}
            </p>
            <DepoimentosCarousel itens={depoimentos} />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b border-brand-border">
          <div className="container py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  {c.faq.titulo}
                </h2>
                <p className="mt-3 text-brand-muted">{c.faq.subtitulo}</p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {c.faq.itens.map((item, i) => (
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
                  {c.contato.titulo}
                </h2>
                <p className="mt-3 text-brand-muted">{c.contato.subtitulo}</p>

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" /> Falar pelo WhatsApp
                  </a>
                )}

                <div className="mt-8 space-y-3 text-sm text-brand-muted">
                  <a
                    href={`mailto:${cfg.email}`}
                    className="flex items-center gap-2 hover:text-brand-text"
                  >
                    <Mail className="h-4 w-4 text-brand-accent" /> {cfg.email}
                  </a>
                  <a
                    href={`tel:${cfg.telefone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2 hover:text-brand-text"
                  >
                    <Phone className="h-4 w-4 text-brand-accent" /> {cfg.telefone}
                  </a>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-accent" /> {cfg.endereco}
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
