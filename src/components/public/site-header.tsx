"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "Dúvidas" },
  { href: "/#contato", label: "Contato" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur">
      <div className="container flex h-16 items-center gap-6 sm:h-20 sm:gap-10">
        {/* Logo em placa branca, alinhada à esquerda. No desktop ela é maior
            que a barra e transborda para baixo (self-start + z-10); no celular
            fica contida na barra para não quebrar o layout. */}
        <Link
          href="/"
          aria-label="Página inicial"
          className="relative z-10 shrink-0 self-center sm:self-start"
        >
          <span className="flex items-center justify-center rounded-lg bg-gradient-to-b from-brand-elevated to-brand-surface px-3 py-1.5 shadow-lg shadow-[0_8px_30px_-8px_rgba(212,105,30,0.35)] ring-1 ring-brand-accent/30 transition-shadow duration-300 hover:ring-brand-accent/60 hover:shadow-[0_8px_36px_-6px_rgba(212,105,30,0.5)] sm:px-5 sm:py-3">
            <Logo className="h-10 w-auto sm:h-20" />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-brand-muted transition-colors hover:text-brand-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Área do cliente</Link>
          </Button>
        </div>

        <button
          className="ml-auto text-brand-text md:hidden"
          onClick={() => setAberto((v) => !v)}
          aria-label="Menu"
        >
          {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {aberto && (
        <div className="border-t border-brand-border bg-brand-surface md:hidden">
          <nav className="container flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className="py-2 text-sm text-brand-muted hover:text-brand-text"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/login">Área do cliente</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
