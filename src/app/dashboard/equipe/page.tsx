import { Users, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { hasAdminKey } from "@/lib/supabase/admin";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { UsuarioForm } from "./usuario-form";
import { excluirUsuario } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatData } from "@/lib/format";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardEquipe() {
  const { supabase, profile } = await requireProfile("advogada");

  const { data } = await supabase
    .from("profiles")
    .select("id, nome, email, role, created_at")
    .in("role", ["advogada", "associado"])
    .order("created_at", { ascending: true })
    .returns<Pick<Profile, "id" | "nome" | "email" | "role" | "created_at">[]>();
  const usuarios = data ?? [];

  const adminDisponivel = hasAdminKey();

  return (
    <>
      <PageHeader
        titulo="Equipe"
        descricao="Administradores (acesso total) e advogados associados (acesso aos processos atribuídos a eles)."
        acao={adminDisponivel ? <UsuarioForm /> : undefined}
      />

      {!adminDisponivel && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Gestão de usuários ainda não habilitada</p>
            <p className="mt-1 text-amber-300/80">
              Para criar/editar usuários em produção, defina a variável{" "}
              <code className="rounded bg-black/30 px-1">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              nas configurações do servidor (Vercel) e refaça o deploy. A lista
              abaixo continua visível.
            </p>
          </div>
        </div>
      )}

      {usuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          titulo="Nenhum usuário administrador"
          descricao="Adicione membros do escritório com acesso ao painel."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>E-mail de login</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                const souEu = u.id === profile.id;
                const isAdmin = u.role === "advogada";
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {u.nome}
                        {souEu && (
                          <Badge className="border-brand-accent/30 bg-brand-accent/10 text-brand-accent">
                            <ShieldCheck className="mr-1 h-3 w-3" /> você
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isAdmin
                            ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
                            : "border-sky-500/30 bg-sky-500/15 text-sky-400"
                        }
                      >
                        {isAdmin ? "Administrador" : "Associado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-brand-muted">{u.email}</TableCell>
                    <TableCell className="text-brand-muted">
                      {formatData(u.created_at)}
                    </TableCell>
                    <TableCell>
                      {adminDisponivel && (
                        <div className="flex items-center justify-end gap-1">
                          <UsuarioForm
                            usuario={{
                              id: u.id,
                              nome: u.nome,
                              email: u.email,
                              role: u.role as "advogada" | "associado",
                            }}
                          />
                          {!souEu && (
                            <form action={excluirUsuario}>
                              <input type="hidden" name="id" value={u.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </form>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
