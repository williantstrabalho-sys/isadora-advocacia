"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Formulário de contato simples. Conformidade:
 *  - LGPD: checkbox de consentimento explícito obrigatório (sem ele o envio
 *    é bloqueado tanto no client quanto pela RLS da tabela `contatos`).
 *  - OAB (Prov. 205/2021): sem captação ativa, sem promessa de resultado.
 */
export function ContactForm() {
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [consentimento, setConsentimento] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!consentimento) {
      setErro("É necessário consentir com o tratamento dos dados para enviar.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setEnviando(true);
    const supabase = createClient();
    const base = {
      nome: String(data.get("nome") || ""),
      email: String(data.get("email") || ""),
      assunto: String(data.get("assunto") || ""),
      mensagem: String(data.get("mensagem") || ""),
      consentimento: true,
    };
    const telefone = String(data.get("telefone") || "");

    let { error } = await supabase
      .from("contatos")
      .insert({ ...base, telefone });

    // Resiliência: se a coluna `telefone` ainda não existir no banco,
    // reenvia sem ela para não quebrar o formulário.
    if (error && /telefone/i.test(error.message)) {
      ({ error } = await supabase.from("contatos").insert(base));
    }
    setEnviando(false);

    if (error) {
      setErro(
        "Não foi possível enviar agora. Tente novamente ou use o e-mail do escritório."
      );
      return;
    }
    setOk(true);
    form.reset();
    setConsentimento(false);
  }

  if (ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-brand-border bg-brand-surface p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-accent" />
        <h3 className="font-display text-lg font-semibold">Mensagem recebida</h3>
        <p className="text-sm text-brand-muted">
          Obrigado pelo contato. Retornaremos pelo e-mail informado. Este envio
          não cria, por si só, relação advocatícia.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" required placeholder="Seu nome" />
        </div>
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            type="tel"
            placeholder="(61) 9 0000-0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assunto">Assunto</Label>
          <Input id="assunto" name="assunto" placeholder="Assunto do contato" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea
          id="mensagem"
          name="mensagem"
          required
          rows={5}
          placeholder="Descreva brevemente sua dúvida."
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-brand-muted">
        <Checkbox
          checked={consentimento}
          onCheckedChange={(v) => setConsentimento(Boolean(v))}
          className="mt-0.5"
        />
        <span>
          Li e concordo com a{" "}
          <Link
            href="/politica-privacidade"
            className="text-brand-accent underline underline-offset-2"
          >
            Política de Privacidade
          </Link>{" "}
          e autorizo o tratamento dos meus dados para resposta a este contato
          (LGPD).
        </span>
      </label>

      {erro && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {erro}
        </p>
      )}

      <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
        {enviando ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}
