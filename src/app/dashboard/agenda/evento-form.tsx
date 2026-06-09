"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TIPO_AGENDA_LABEL } from "@/lib/constants";
import { salvarEvento } from "./actions";
import type { AgendaEvento, TipoAgenda } from "@/lib/types";

type Opt = { id: string; nome: string };

export function EventoForm({
  processos,
  evento,
}: {
  processos: Opt[];
  evento?: AgendaEvento;
}) {
  const [open, setOpen] = useState(false);
  const editando = Boolean(evento);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarEvento(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {evento && <input type="hidden" name="id" value={evento.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              name="titulo"
              required
              defaultValue={evento?.titulo}
              placeholder="Audiência de instrução"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                name="tipo"
                defaultValue={evento?.tipo ?? "PRAZO"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_AGENDA_LABEL) as TipoAgenda[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_AGENDA_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="processo_id">Processo vinculado</Label>
              <Select
                name="processo_id"
                defaultValue={evento?.processo_id ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {processos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                name="data"
                type="date"
                required
                defaultValue={evento?.data ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                name="hora"
                type="time"
                defaultValue={evento?.hora?.slice(0, 5) ?? ""}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                name="local"
                defaultValue={evento?.local ?? ""}
                placeholder="TRT-10 / Sala de audiências..."
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                rows={2}
                defaultValue={evento?.obs ?? ""}
              />
            </div>
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
