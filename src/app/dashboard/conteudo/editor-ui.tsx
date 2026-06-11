"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salvarConteudo } from "./actions";

/** Hook de salvamento de um bloco do CMS, com estado de status. */
export function useSalvarBloco(chave: string) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function salvar(valor: unknown) {
    setErro(null);
    setSalvo(false);
    startTransition(async () => {
      const r = await salvarConteudo(chave, valor);
      if (r?.error) {
        setErro(r.error);
        return;
      }
      setSalvo(true);
      router.refresh();
      setTimeout(() => setSalvo(false), 2500);
    });
  }

  return { salvar, pending, salvo, erro };
}

export function BlocoCard({
  titulo,
  descricao,
  children,
  onSalvar,
  pending,
  salvo,
  erro,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  onSalvar: () => void;
  pending: boolean;
  salvo: boolean;
  erro: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        {descricao && <p className="text-sm text-brand-muted">{descricao}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="flex items-center gap-3 border-t border-brand-border pt-4">
          <Button onClick={onSalvar} disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {salvo && (
            <span className="flex items-center gap-1 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Salvo
            </span>
          )}
          {erro && (
            <span className="flex items-center gap-1 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {erro}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Botão pequeno para adicionar item a uma lista. */
export function AddItem({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="h-4 w-4" /> {label}
    </Button>
  );
}

/** Botão de remover item de lista. */
export function RemoveItem({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onClick}>
      <Trash2 className="h-4 w-4 text-red-400" />
    </Button>
  );
}
