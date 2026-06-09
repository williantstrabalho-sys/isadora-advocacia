"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const senha = String(data.get("senha") || "");

    const supabase = createClient();
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !auth.user) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    // Decide o destino conforme o papel
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single<Pick<Profile, "role">>();

    const redirectTo = params.get("redirectTo");
    const destino =
      redirectTo ||
      (profile?.role === "advogada" ? "/dashboard" : "/portal");

    // refresh para o middleware reconhecer a sessão recém-criada
    router.replace(destino);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@email.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {erro && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {erro}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
