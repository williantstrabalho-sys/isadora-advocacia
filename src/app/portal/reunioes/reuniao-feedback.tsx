"use client";

import { useState } from "react";
import { Check, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { responderReuniao } from "./actions";

export function ReuniaoFeedback({ id }: { id: string }) {
  const [modo, setModo] = useState<"idle" | "ajuste">("idle");

  return (
    <div className="mt-4 border-t border-brand-border pt-4">
      {modo === "idle" ? (
        <div className="flex flex-wrap gap-2">
          <form action={responderReuniao}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="acao" value="acordo" />
            <Button type="submit" size="sm">
              <Check className="h-4 w-4" /> Estou de acordo com a ata
            </Button>
          </form>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setModo("ajuste")}
          >
            <MessageSquareWarning className="h-4 w-4" /> Solicitar ajuste
          </Button>
        </div>
      ) : (
        <form action={responderReuniao} className="space-y-2">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="acao" value="ajuste" />
          <Textarea
            name="ajuste"
            rows={3}
            required
            placeholder="Descreva o que precisa ser corrigido ou complementado na ata."
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Enviar solicitação
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setModo("idle")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
