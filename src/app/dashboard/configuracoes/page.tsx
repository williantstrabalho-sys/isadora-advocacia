import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/app/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { salvarConfig } from "./actions";
import type { Configuracao } from "@/lib/types";
import { ESCRITORIO } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardConfiguracoes() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("id", 1)
    .single<Configuracao>();

  const cfg = {
    escritorio_nome: data?.escritorio_nome ?? ESCRITORIO.nome,
    advogada_nome: data?.advogada_nome ?? ESCRITORIO.advogada,
    oab: data?.oab ?? ESCRITORIO.oab,
    email: data?.email ?? ESCRITORIO.email,
    telefone: data?.telefone ?? ESCRITORIO.telefone,
    endereco: data?.endereco ?? ESCRITORIO.endereco,
  };

  return (
    <>
      <PageHeader
        titulo="Configurações"
        descricao="Dados do escritório exibidos no site público (rodapé, contato e política de privacidade)."
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form action={salvarConfig} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="escritorio_nome">Nome do escritório</Label>
                <Input
                  id="escritorio_nome"
                  name="escritorio_nome"
                  defaultValue={cfg.escritorio_nome}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="advogada_nome">Nome da advogada</Label>
                <Input
                  id="advogada_nome"
                  name="advogada_nome"
                  defaultValue={cfg.advogada_nome}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oab">OAB</Label>
                <Input id="oab" name="oab" defaultValue={cfg.oab} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  defaultValue={cfg.telefone}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={cfg.email}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  defaultValue={cfg.endereco}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
