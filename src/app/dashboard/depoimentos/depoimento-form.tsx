"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { salvarDepoimento } from "./actions";
import type { Depoimento } from "@/lib/types";

export function DepoimentoForm({ depoimento }: { depoimento?: Depoimento }) {
  const [open, setOpen] = useState(false);
  const editando = Boolean(depoimento);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo depoimento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar depoimento" : "Novo depoimento"}
          </DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarDepoimento(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {depoimento && (
            <input type="hidden" name="id" value={depoimento.id} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="autor">Autor (iniciais) *</Label>
              <Input
                id="autor"
                name="autor"
                required
                defaultValue={depoimento?.autor}
                placeholder="M. S."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contexto">Contexto</Label>
              <Input
                id="contexto"
                name="contexto"
                defaultValue={depoimento?.contexto ?? ""}
                placeholder="Reclamação trabalhista"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="texto">Depoimento *</Label>
            <Textarea
              id="texto"
              name="texto"
              required
              rows={4}
              defaultValue={depoimento?.texto}
              placeholder="Sem identificação completa do cliente (LGPD)."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                name="ordem"
                type="number"
                defaultValue={depoimento?.ordem ?? 0}
                className="w-20"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="publicado"
                defaultChecked={depoimento ? depoimento.publicado : true}
              />
              Publicado no site
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
