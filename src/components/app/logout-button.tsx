import { LogOut } from "lucide-react";

/**
 * Botão de logout — envia POST para a rota que invalida a sessão no Supabase.
 */
export function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-muted transition-colors hover:bg-brand-elevated hover:text-brand-text"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </form>
  );
}
