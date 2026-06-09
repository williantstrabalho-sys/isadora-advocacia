"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "Dúvidas" },
  { href: "/#contato", label: "Contato" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur">
      <div
        className={cn(
          "container flex items-center gap-6 transition-all duration-300 sm:gap-10",
          scrolled ? "h-16 sm:h-20" : "h-24 sm:h-32"
        )}
      >
        {/* Logo grande no topo; encolhe ao rolar para não atrapalhar a leitura */}
        <Link
          href="/"
          aria-label="Página inicial"
          className="shrink-0"
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-lg bg-gradient-to-b from-brand-elevated to-brand-surface shadow-lg shadow-[0_8px_30px_-8px_rgba(212,105,30,0.35)] ring-1 ring-brand-accent/30 transition-all duration-300 hover:ring-brand-accent/60",
              scrolled ? "p-1.5 sm:p-2" : "p-2 sm:p-3"
            )}
          >
            <Logo
              className={cn(
                "w-auto transition-all duration-300",
                scrolled ? "h-10 sm:h-14" : "h-16 sm:h-24"
              )}
            />
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
