"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Direito ao esquecimento (LGPD). Chama a RPC `excluir_minha_conta`, que
 * remove o usuário do Auth e desvincula seus dados de cliente.
 */
export function DeleteAccount() {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("excluir_minha_conta");
    if (error) {
      setErro("Não foi possível excluir a conta. Tente novamente mais tarde.");
      setExcluindo(false);
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <ShieldX className="h-4 w-4" /> Excluir minha conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir conta e dados de acesso</DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. Sua conta de acesso será removida e seus
            dados pessoais serão desvinculados, conforme o direito ao
            esquecimento (LGPD). Registros processuais exigidos por lei podem ser
            mantidos pelo escritório de forma anonimizada.
          </DialogDescription>
        </DialogHeader>
        {erro && (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" /> {erro}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={excluir}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
