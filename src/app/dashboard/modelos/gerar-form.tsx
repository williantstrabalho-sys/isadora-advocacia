"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClienteProcessoSelect,
  type ClienteOpt,
  type ProcessoOpt,
} from "@/components/app/cliente-processo-select";

type ModeloOpt = { id: string; nome: string };

export function GerarForm({
  modelos,
  clientes,
  processos,
}: {
  modelos: ModeloOpt[];
  clientes: ClienteOpt[];
  processos: ProcessoOpt[];
}) {
  const [modeloId, setModeloId] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);
    const cliente = String(fd.get("cliente_id") || "");
    const processo = String(fd.get("processo_id") || "");
    if (!modeloId) return setErro("Selecione um modelo.");
    if (!cliente) return setErro("Selecione um cliente.");
    const params = new URLSearchParams({ modelo: modeloId, cliente });
    if (processo) params.set("processo", processo);
    window.open(`/relatorio/documento?${params.toString()}`, "_blank");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Modelo *</Label>
        <Select value={modeloId} onValueChange={setModeloId}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha o documento" />
          </SelectTrigger>
          <SelectContent>
            {modelos.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ClienteProcessoSelect
        clientes={clientes}
        processos={processos}
        clienteLabel="Cliente"
        clienteRequired
        processoLabel="Processo (opcional)"
      />

      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit">
          <FileText className="h-4 w-4" /> Gerar documento
        </Button>
        {erro && <span className="text-sm text-red-400">{erro}</span>}
        <span className="text-xs text-brand-muted">
          O documento abre em uma nova aba, pronto para imprimir ou salvar em PDF.
        </span>
      </div>
    </form>
  );
}
