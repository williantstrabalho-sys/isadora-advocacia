"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso no browser (Client Components).
 * As chaves públicas (anon) são seguras de expor — a segurança real
 * é garantida pela RLS no banco.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
