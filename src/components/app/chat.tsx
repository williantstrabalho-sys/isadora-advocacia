"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Mensagem } from "@/lib/types";

/**
 * Chat assíncrono cliente ↔ advogada, vinculado a um cliente_id.
 * Recomenda-se não incluir dados processuais sensíveis no corpo — apenas
 * referência ao processo (orientação de privacidade).
 */
export function Chat({
  clienteId,
  meuId,
  souAdvogada = false,
}: {
  clienteId: string;
  meuId: string;
  souAdvogada?: boolean;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: true })
      .returns<Mensagem[]>();
    setMensagens(data ?? []);

    // marca como lidas as mensagens recebidas
    await supabase
      .from("mensagens")
      .update({ lida: true })
      .eq("cliente_id", clienteId)
      .neq("remetente_id", meuId)
      .eq("lida", false);
  }, [clienteId, meuId, supabase]);

  useEffect(() => {
    carregar();
    // realtime
    const channel = supabase
      .channel(`chat-${clienteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `cliente_id=eq.${clienteId}`,
        },
        () => carregar()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;
    setEnviando(true);
    await supabase.from("mensagens").insert({
      remetente_id: meuId,
      cliente_id: clienteId,
      conteudo,
      lida: false,
    });
    setTexto("");
    setEnviando(false);
    carregar();
  }

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col rounded-lg border border-brand-border bg-brand-surface">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {mensagens.length === 0 && (
          <p className="py-12 text-center text-sm text-brand-muted">
            Nenhuma mensagem ainda. Inicie a conversa.
          </p>
        )}
        {mensagens.map((m) => {
          const meu = m.remetente_id === meuId;
          return (
            <div
              key={m.id}
              className={cn("flex", meu ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  meu
                    ? "bg-brand-accent text-black"
                    : "bg-brand-elevated text-brand-text"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.conteudo}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    meu ? "text-black/60" : "text-brand-muted"
                  )}
                >
                  {formatDataHora(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      <form
        onSubmit={enviar}
        className="flex items-end gap-2 border-t border-brand-border p-3"
      >
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={
            souAdvogada
              ? "Responder ao cliente..."
              : "Escreva sua mensagem (evite dados sensíveis)..."
          }
          rows={1}
          className="min-h-[40px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={enviando}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
