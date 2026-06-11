import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase SEM cookies/sessão — para leituras PÚBLICAS (config do site,
 * conteúdo do CMS, depoimentos, blog). Por não usar cookies, permite que as
 * páginas públicas sejam cacheadas (ISR), reduzindo consultas e acelerando o
 * site. A segurança continua nas policies de RLS (leitura pública).
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
