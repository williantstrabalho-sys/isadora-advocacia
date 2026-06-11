import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";
import { AVISO_OAB } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Área do cliente — Acesso",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { getConteudo } = await import("@/lib/settings");
  const logoSrc = (await getConteudo()).imagens.logo;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-brand-elevated to-brand-surface px-8 py-6 shadow-[0_10px_40px_-10px_rgba(212,105,30,0.4)] ring-1 ring-brand-accent/30">
            <Logo src={logoSrc} className="h-28 w-auto sm:h-32" />
          </span>
        </Link>

        <div className="mt-10 rounded-lg border border-brand-border bg-brand-surface p-8">
          <h1 className="font-display text-xl font-semibold">Acessar conta</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Área restrita para clientes e advogada do escritório.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-48" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          <Link href="/" className="hover:text-brand-text">
            ← Voltar ao site
          </Link>
        </p>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-brand-muted">
          {AVISO_OAB}
        </p>
      </div>
    </main>
  );
}
