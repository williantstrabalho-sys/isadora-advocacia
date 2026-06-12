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
import {
  ClienteProcessoSelect,
  type ClienteOpt,
  type ProcessoOpt,
} from "@/components/app/cliente-processo-select";
import { salvarEvento } from "./actions";
import type { AgendaEvento, TipoAgenda } from "@/lib/types";

export function EventoForm({
  clientes,
  processos,
  evento,
}: {
  clientes: ClienteOpt[];
  processos: ProcessoOpt[];
  evento?: AgendaEvento;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoAgenda>(evento?.tipo ?? "PRAZO");
  const editando = Boolean(evento);
  const reuniao = tipo === "REUNIAO";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                value={tipo}
                onValueChange={(v) => setTipo(v as TipoAgenda)}
                required
              >
                <SelectTrigger id="tipo">
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
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                name="local"
                defaultValue={evento?.local ?? ""}
                placeholder="Fórum / Sala / Online..."
              />
            </div>

            <ClienteProcessoSelect
              clientes={clientes}
              processos={processos}
              defaultClienteId={evento?.cliente_id}
              defaultProcessoId={evento?.processo_id}
            />

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

            {reuniao && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pauta">Pauta da reunião</Label>
                <Textarea
                  id="pauta"
                  name="pauta"
                  rows={4}
                  defaultValue={evento?.pauta ?? ""}
                  placeholder="Tópicos a tratar / ata da reunião — o cliente verá isto no portal e poderá marcar 'de acordo' ou pedir ajuste."
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações internas</Label>
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
