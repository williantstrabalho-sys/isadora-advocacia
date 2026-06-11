"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EsqueciSenhaPage() {
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir`,
    });
    setEnviando(false);
    if (error) {
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }
    setOk(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Logo className="h-20 w-auto" />
        </Link>

        <div className="mt-10 rounded-lg border border-brand-border bg-brand-surface p-8">
          {ok ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="h-10 w-10 text-brand-accent" />
              <h1 className="font-display text-lg font-semibold">
                Verifique seu e-mail
              </h1>
              <p className="text-sm text-brand-muted">
                Se houver uma conta com esse e-mail, enviamos um link para você
                redefinir a senha. O link expira em pouco tempo.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold">
                Esqueci minha senha
              </h1>
              <p className="mt-1 text-sm text-brand-muted">
                Informe seu e-mail e enviaremos um link para criar uma nova
                senha.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="voce@email.com"
                  />
                </div>
                {erro && (
                  <p className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" /> {erro}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          <Link href="/login" className="hover:text-brand-text">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </main>
  );
}
