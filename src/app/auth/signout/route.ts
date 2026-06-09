import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Logout — invalida a sessão no Supabase e redireciona para o login.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
