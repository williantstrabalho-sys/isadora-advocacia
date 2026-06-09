import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a chave service_role — uso EXCLUSIVO no servidor
 * (Server Actions/Route Handlers), NUNCA no browser/Client Components.
 * Só é importado por código com "use server" (actions) ou Server Components.
 * Necessário para operações administrativas de Auth (criar/editar/remover
 * usuários). A chave vem de SUPABASE_SERVICE_ROLE_KEY (sem prefixo NEXT_PUBLIC,
 * portanto nunca é enviada ao navegador).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function hasAdminKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
