"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ehAtivo = (href: string) =>
    href.startsWith("/blog") && pathname.startsWith("/blog");

  return (
    <header className="sticky top-0 z-50 overflow-x-clip bg-brand-bg/80 backdrop-blur">
      {/* Barra estreita de altura fixa. A linha inferior NÃO fica no <header>
          (que cruzaria toda a tela); ela vive no bloco à direita da logo, então
          começa depois da logo e vai até a borda direita (margens negativas
          cancelam o padding do container; o padding interno mantém o conteúdo). */}
      <div className="container flex h-12 items-stretch gap-6 sm:h-14 sm:gap-10">
        <Link
          href="/"
          aria-label="Página inicial"
          className="relative z-50 flex shrink-0 items-center self-start"
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-lg bg-gradient-to-b from-brand-elevated to-brand-surface shadow-lg shadow-[0_10px_30px_-8px_rgba(212,105,30,0.4)] ring-1 ring-brand-accent/30 transition-all duration-300 hover:ring-brand-accent/60",
              scrolled ? "p-2" : "p-2 sm:p-3"
            )}
          >
            <Logo
              className={cn(
                "w-auto transition-all duration-300",
                scrolled ? "h-11 sm:h-16" : "h-16 sm:h-24"
              )}
            />
          </span>
        </Link>

        <div className="flex flex-1 items-center self-stretch border-b border-brand-border -mr-5 pr-5 sm:-mr-6 sm:pr-6 lg:-mr-10 lg:pr-10 xl:-mr-14 xl:pr-14 2xl:-mr-20 2xl:pr-20">
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-brand-accent after:transition-transform after:duration-200 hover:text-brand-text hover:after:scale-x-100",
                  ehAtivo(item.href)
                    ? "text-brand-text after:scale-x-100"
                    : "text-brand-muted after:scale-x-0"
                )}
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
      </div>

      {aberto && (
        <div className="border-t border-brand-border bg-brand-surface md:hidden">
          <nav className="container flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className={cn(
                  "border-l-2 py-2 pl-3 text-sm transition-colors",
                  ehAtivo(item.href)
                    ? "border-brand-accent text-brand-accent"
                    : "border-transparent text-brand-muted hover:border-brand-accent hover:text-brand-accent"
                )}
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
