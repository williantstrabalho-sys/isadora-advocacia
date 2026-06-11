"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/types";

export default function RedefinirPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);
    const senha = String(fd.get("senha") || "");
    const senha2 = String(fd.get("senha2") || "");
    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== senha2) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { data: auth, error } = await supabase.auth.updateUser({
      password: senha,
    });
    if (error || !auth.user) {
      setSalvando(false);
      setErro(
        "Link inválido ou expirado. Solicite um novo link de redefinição."
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single<Pick<Profile, "role">>();

    router.replace(profile?.role === "advogada" ? "/dashboard" : "/portal");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Logo className="h-20 w-auto" />
        </Link>

        <div className="mt-10 rounded-lg border border-brand-border bg-brand-surface p-8">
          <h1 className="font-display text-xl font-semibold">Criar nova senha</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Defina sua nova senha de acesso.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                required
                autoComplete="new-password"
                placeholder="mín. 6 caracteres"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha2">Confirmar senha</Label>
              <Input
                id="senha2"
                name="senha2"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            {erro && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" /> {erro}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          <Link href="/esqueci-senha" className="hover:text-brand-text">
            Solicitar novo link
          </Link>
        </p>
      </div>
    </main>
  );
}
