"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  TIPO_LANCAMENTO_LABEL,
  STATUS_FINANCEIRO_LABEL,
} from "@/lib/constants";
import {
  ClienteProcessoSelect,
  type ClienteOpt,
  type ProcessoOpt,
} from "@/components/app/cliente-processo-select";
import { salvarLancamento } from "./actions";
import type {
  Financeiro,
  TipoLancamento,
  StatusFinanceiro,
} from "@/lib/types";

export function LancamentoForm({
  clientes,
  processos,
  lancamento,
}: {
  clientes: ClienteOpt[];
  processos: ProcessoOpt[];
  lancamento?: Financeiro;
}) {
  const [open, setOpen] = useState(false);
  const editando = Boolean(lancamento);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarLancamento(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {lancamento && (
            <input type="hidden" name="id" value={lancamento.id} />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              name="descricao"
              required
              defaultValue={lancamento?.descricao}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                name="tipo"
                defaultValue={lancamento?.tipo ?? "HONORARIO"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(TIPO_LANCAMENTO_LABEL) as TipoLancamento[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LANCAMENTO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                required
                defaultValue={lancamento?.valor ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input
                id="vencimento"
                name="vencimento"
                type="date"
                defaultValue={lancamento?.vencimento ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pagamento">Pagamento</Label>
              <Input
                id="pagamento"
                name="pagamento"
                type="date"
                defaultValue={lancamento?.pagamento ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                defaultValue={lancamento?.status ?? "PENDENTE"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(STATUS_FINANCEIRO_LABEL) as StatusFinanceiro[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_FINANCEIRO_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ClienteProcessoSelect
              clientes={clientes}
              processos={processos}
              defaultClienteId={lancamento?.cliente_id}
              defaultProcessoId={lancamento?.processo_id}
            />
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
