"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_ACAO_OPTIONS, STATUS_PROCESSO_LABEL } from "@/lib/constants";
import type { StatusProcesso } from "@/lib/types";

type ClienteOpt = { id: string; nome: string };
const TODOS = "__todos__";

export function ProcessoFiltros({ clientes }: { clientes: ClienteOpt[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value || value === TODOS) sp.delete(key);
    else sp.set(key, value);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Select
        defaultValue={params.get("status") ?? TODOS}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos os status</SelectItem>
          {(Object.keys(STATUS_PROCESSO_LABEL) as StatusProcesso[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_PROCESSO_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={params.get("tipo") ?? TODOS}
        onValueChange={(v) => setParam("tipo", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo de ação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos os tipos</SelectItem>
          {TIPO_ACAO_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={params.get("cliente") ?? TODOS}
        onValueChange={(v) => setParam("cliente", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos os clientes</SelectItem>
          {clientes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
