"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lgpd-cookie-consent";

/**
 * Banner de consentimento de cookies (LGPD — Lei 13.709/2018).
 * Não há rastreamento de terceiros antes do aceite. O escritório não usa
 * pop-ups de captação ativa (Provimento 205/2021) — este banner trata
 * exclusivamente de consentimento de cookies, não de publicidade.
 */
export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) setVisivel(true);
  }, []);

  function decidir(valor: "aceito" | "recusado") {
    localStorage.setItem(STORAGE_KEY, valor);
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-brand-border bg-brand-surface/95 backdrop-blur">
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-brand-muted">
          Utilizamos apenas cookies essenciais ao funcionamento do site. Você
          pode aceitar cookies opcionais de análise para nos ajudar a melhorar.
          Saiba mais na{" "}
          <Link
            href="/politica-privacidade"
            className="text-brand-accent underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decidir("recusado")}>
            Apenas essenciais
          </Button>
          <Button size="sm" onClick={() => decidir("aceito")}>
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
