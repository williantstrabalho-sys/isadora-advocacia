"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VARIAVEIS } from "@/lib/modelos";
import { salvarModelo } from "./actions";
import type { ModeloDocumento } from "@/lib/types";

export function ModeloForm({ modelo }: { modelo?: ModeloDocumento }) {
  const [open, setOpen] = useState(false);
  const [conteudo, setConteudo] = useState(modelo?.conteudo ?? "");
  const editando = Boolean(modelo);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo modelo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar modelo" : "Novo modelo"}</DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarModelo(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {modelo && <input type="hidden" name="id" value={modelo.id} />}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nome">Nome do modelo *</Label>
              <Input id="nome" name="nome" required defaultValue={modelo?.nome} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                name="categoria"
                defaultValue={modelo?.categoria ?? ""}
                placeholder="Procuração, Contrato..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo do documento *</Label>
            <Textarea
              id="conteudo"
              name="conteudo"
              required
              rows={14}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="font-mono text-sm"
              placeholder="Use {{variáveis}} para preencher automaticamente."
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-brand-muted">
              Clique para inserir uma variável:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  title={v.descricao}
                  onClick={() => setConteudo((c) => c + v.token)}
                  className="rounded border border-brand-border px-1.5 py-0.5 font-mono text-[11px] text-brand-muted hover:border-brand-accent hover:text-brand-accent"
                >
                  {v.token}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
