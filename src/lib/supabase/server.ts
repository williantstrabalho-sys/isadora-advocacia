import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cliente Supabase para uso no servidor (Server Components, Route Handlers,
 * Server Actions). Lê/escreve a sessão via cookies httpOnly.
 *
 * Os resultados de consulta são tipados via cast explícito (ver src/lib/types),
 * por isso não passamos o generic <Database> ao client.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O método setAll foi chamado de um Server Component.
            // Pode ser ignorado se o middleware já cuida da renovação da sessão.
          }
        },
      },
    }
  );
}
