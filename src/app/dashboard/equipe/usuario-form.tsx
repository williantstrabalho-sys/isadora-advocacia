"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { criarUsuario, atualizarUsuario } from "./actions";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role?: "advogada" | "associado";
};

export function UsuarioForm({ usuario }: { usuario?: Usuario }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(usuario);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    const fd = new FormData(e.currentTarget);
    const r = editando ? await atualizarUsuario(fd) : await criarUsuario(fd);
    setSalvando(false);
    if (r?.error) {
      setErro(r.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {usuario && <input type="hidden" name="id" value={usuario.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" name="nome" required defaultValue={usuario?.nome} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail de login *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={usuario?.email}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="papel">Papel *</Label>
            <select
              id="papel"
              name="papel"
              defaultValue={usuario?.role ?? "associado"}
              className="flex h-10 w-full rounded-md border border-brand-border bg-brand-bg px-3 text-sm text-brand-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
            >
              <option value="associado">
                Advogado(a) associado(a) — só processos atribuídos
              </option>
              <option value="advogada">
                Administrador(a) — acesso total
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha">
              {editando
                ? "Nova senha (deixe em branco para manter)"
                : "Senha provisória *"}
            </Label>
            <Input
              id="senha"
              name="senha"
              type="text"
              required={!editando}
              placeholder="mín. 6 caracteres"
              autoComplete="new-password"
            />
            <p className="text-xs text-brand-muted">
              {editando
                ? "Se preencher, a senha do usuário será redefinida."
                : "Informe esta senha ao novo usuário; ele poderá usá-la para entrar."}
            </p>
          </div>

          {erro && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {erro}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
