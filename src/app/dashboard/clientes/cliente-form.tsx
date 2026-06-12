"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, AlertCircle } from "lucide-react";
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
import { salvarCliente } from "./actions";
import type { ClienteDetalhe, TipoPessoa } from "@/lib/types";

export function ClienteForm({ cliente }: { cliente?: ClienteDetalhe }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(
    cliente?.tipo_pessoa ?? "PF"
  );
  const editando = Boolean(cliente);
  const pj = tipoPessoa === "PJ";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErro(null);
            setSalvando(true);
            const fd = new FormData(e.currentTarget);
            const r = await salvarCliente(fd);
            setSalvando(false);
            if (r?.error) {
              setErro(r.error);
              return;
            }
            setOpen(false);
            router.refresh();
          }}
          className="space-y-4"
        >
          {cliente && <input type="hidden" name="id" value={cliente.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo_pessoa">Tipo</Label>
              <Select
                name="tipo_pessoa"
                value={tipoPessoa}
                onValueChange={(v) => setTipoPessoa(v as TipoPessoa)}
              >
                <SelectTrigger id="tipo_pessoa">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoa física</SelectItem>
                  <SelectItem value="PJ">Pessoa jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc">
                {pj ? "CNPJ" : "CPF"} (armazenado criptografado)
              </Label>
              <Input
                id="doc"
                name="doc"
                defaultValue={cliente?.cpf ?? ""}
                placeholder={pj ? "00.000.000/0000-00" : "000.000.000-00"}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nome">
                {pj ? "Razão social *" : "Nome completo *"}
              </Label>
              <Input id="nome" name="nome" required defaultValue={cliente?.nome} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={cliente?.email ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                defaultValue={cliente?.telefone ?? ""}
              />
            </div>

            {!pj && (
              <div className="space-y-1.5">
                <Label htmlFor="data_nascimento">Data de nascimento</Label>
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  defaultValue={cliente?.data_nascimento ?? ""}
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                defaultValue={cliente?.endereco ?? ""}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                rows={2}
                defaultValue={cliente?.obs ?? ""}
              />
            </div>
          </div>

          <p className="text-xs text-brand-muted">
            Dados específicos do caso (vínculo de emprego, parte contrária, etc.)
            são cadastrados no processo, de acordo com a área do Direito.
          </p>

          {erro && (
            <p className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {erro}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
