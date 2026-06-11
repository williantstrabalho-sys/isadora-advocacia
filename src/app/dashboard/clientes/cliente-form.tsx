"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, AlertCircle } from "lucide-react";
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
import { salvarCliente } from "./actions";
import type { ClienteDetalhe } from "@/lib/types";

export function ClienteForm({ cliente }: { cliente?: ClienteDetalhe }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(cliente);

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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" name="nome" required defaultValue={cliente?.nome} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF (armazenado criptografado)</Label>
              <Input
                id="cpf"
                name="cpf"
                defaultValue={cliente?.cpf ?? ""}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctps">CTPS (criptografada)</Label>
              <Input
                id="ctps"
                name="ctps"
                defaultValue={cliente?.ctps ?? ""}
                placeholder="0000000 / 000-DF"
              />
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

            <div className="space-y-1.5">
              <Label htmlFor="data_nascimento">Data de nascimento</Label>
              <Input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                defaultValue={cliente?.data_nascimento ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresa_reclamada">Empresa reclamada</Label>
              <Input
                id="empresa_reclamada"
                name="empresa_reclamada"
                defaultValue={cliente?.empresa_reclamada ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_admissao">Admissão</Label>
              <Input
                id="data_admissao"
                name="data_admissao"
                type="date"
                defaultValue={cliente?.data_admissao ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_demissao">Demissão</Label>
              <Input
                id="data_demissao"
                name="data_demissao"
                type="date"
                defaultValue={cliente?.data_demissao ?? ""}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="motivo_demissao">Motivo da demissão</Label>
              <Input
                id="motivo_demissao"
                name="motivo_demissao"
                defaultValue={cliente?.motivo_demissao ?? ""}
              />
            </div>

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
