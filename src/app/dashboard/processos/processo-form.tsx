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
import { TIPO_ACAO_OPTIONS, STATUS_PROCESSO_LABEL } from "@/lib/constants";
import { salvarProcesso } from "./actions";
import type { Processo, StatusProcesso } from "@/lib/types";

type ClienteOpt = { id: string; nome: string };

export function ProcessoForm({
  clientes,
  processo,
}: {
  clientes: ClienteOpt[];
  processo?: Processo;
}) {
  const [open, setOpen] = useState(false);
  const editando = Boolean(processo);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo processo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar processo" : "Novo processo"}
          </DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarProcesso(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {processo && <input type="hidden" name="id" value={processo.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select
                name="cliente_id"
                defaultValue={processo?.cliente_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="numero_cnj">Número CNJ *</Label>
              <Input
                id="numero_cnj"
                name="numero_cnj"
                required
                defaultValue={processo?.numero_cnj}
                placeholder="0000000-00.0000.5.10.0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipo_acao">Tipo de ação *</Label>
              <Select
                name="tipo_acao"
                defaultValue={processo?.tipo_acao ?? "RECLAMACAO_TRABALHISTA"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_ACAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vara">Vara</Label>
              <Input
                id="vara"
                name="vara"
                defaultValue={processo?.vara ?? ""}
                placeholder="3ª Vara do Trabalho de Brasília"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fase">Fase processual</Label>
              <Input
                id="fase"
                name="fase"
                defaultValue={processo?.fase ?? ""}
                placeholder="Conhecimento / Execução..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                defaultValue={processo?.status ?? "ATIVO"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(STATUS_PROCESSO_LABEL) as StatusProcesso[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_PROCESSO_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor_causa">Valor da causa (R$)</Label>
              <Input
                id="valor_causa"
                name="valor_causa"
                type="number"
                step="0.01"
                defaultValue={processo?.valor_causa ?? ""}
                placeholder="45000.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_distribuicao">Data de distribuição</Label>
              <Input
                id="data_distribuicao"
                name="data_distribuicao"
                type="date"
                defaultValue={processo?.data_distribuicao ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_audiencia">Data/hora da audiência</Label>
              <Input
                id="data_audiencia"
                name="data_audiencia"
                type="datetime-local"
                defaultValue={
                  processo?.data_audiencia
                    ? processo.data_audiencia.slice(0, 16)
                    : ""
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pedidos">Pedidos (um por linha)</Label>
              <Textarea
                id="pedidos"
                name="pedidos"
                rows={3}
                defaultValue={processo?.pedidos?.join("\n") ?? ""}
                placeholder={"Horas extras\nAdicional noturno\nFGTS"}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                rows={2}
                defaultValue={processo?.obs ?? ""}
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
