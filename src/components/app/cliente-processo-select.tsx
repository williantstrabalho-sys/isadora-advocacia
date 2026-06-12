"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ClienteOpt = { id: string; nome: string };
export type ProcessoOpt = { id: string; nome: string; cliente_id: string };

/**
 * Combobox de cliente com filtro ao digitar + select de processo dependente
 * (mostra apenas os processos do cliente selecionado). Emite os campos
 * `clienteName` e `processoName` no FormData do formulário pai.
 */
export function ClienteProcessoSelect({
  clientes,
  processos,
  defaultClienteId,
  defaultProcessoId,
  clienteName = "cliente_id",
  processoName = "processo_id",
  clienteLabel = "Cliente",
  processoLabel = "Processo vinculado",
  clienteRequired = false,
}: {
  clientes: ClienteOpt[];
  processos: ProcessoOpt[];
  defaultClienteId?: string | null;
  defaultProcessoId?: string | null;
  clienteName?: string;
  processoName?: string;
  clienteLabel?: string;
  processoLabel?: string;
  clienteRequired?: boolean;
}) {
  const inicial = clientes.find((c) => c.id === defaultClienteId);
  const [clienteId, setClienteId] = useState<string>(defaultClienteId ?? "");
  const [query, setQuery] = useState<string>(inicial?.nome ?? "");
  const [aberto, setAberto] = useState(false);
  const [processoId, setProcessoId] = useState<string>(defaultProcessoId ?? "");
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes.slice(0, 50);
    return clientes
      .filter((c) => c.nome.toLowerCase().includes(q))
      .slice(0, 50);
  }, [clientes, query]);

  const processosDoCliente = useMemo(
    () => processos.filter((p) => p.cliente_id === clienteId),
    [processos, clienteId]
  );

  function selecionar(c: ClienteOpt) {
    setClienteId(c.id);
    setQuery(c.nome);
    setAberto(false);
    setProcessoId(""); // reseta o processo ao trocar de cliente
  }

  function limpar() {
    setClienteId("");
    setQuery("");
    setProcessoId("");
  }

  return (
    <>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>
          {clienteLabel}
          {clienteRequired && " *"}
        </Label>
        <div className="relative">
          <Input
            value={query}
            placeholder="Digite para buscar o cliente..."
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setClienteId("");
              setProcessoId("");
              setAberto(true);
            }}
            onFocus={() => setAberto(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setAberto(false), 120);
            }}
          />
          {clienteId && (
            <button
              type="button"
              onClick={limpar}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
              aria-label="Limpar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!clienteId && (
            <ChevronsUpDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          )}

          {aberto && filtrados.length > 0 && (
            <ul
              className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-brand-border bg-brand-elevated p-1 shadow-lg"
              onMouseDown={(e) => {
                // evita o blur antes do clique
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
              }}
            >
              {filtrados.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selecionar(c)}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-brand-bg",
                      c.id === clienteId && "text-brand-accent"
                    )}
                  >
                    {c.nome}
                    {c.id === clienteId && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* valor enviado no formulário */}
        <input type="hidden" name={clienteName} value={clienteId} />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={processoName}>{processoLabel}</Label>
        <Select
          value={processoId || undefined}
          onValueChange={setProcessoId}
          disabled={!clienteId || processosDoCliente.length === 0}
        >
          <SelectTrigger id={processoName}>
            <SelectValue
              placeholder={
                !clienteId
                  ? "Selecione um cliente primeiro"
                  : processosDoCliente.length === 0
                    ? "Cliente sem processos"
                    : "Opcional"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {processosDoCliente.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name={processoName} value={processoId} />
      </div>
    </>
  );
}
