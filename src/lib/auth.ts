import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/** Destino padrão conforme o papel. */
function destinoPorPapel(role: UserRole): string {
  return role === "cliente" ? "/portal" : "/dashboard";
}

async function carregar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login");

  return { supabase, user, profile };
}

/**
 * Carrega o usuário autenticado e seu profile.
 * Opcionalmente exige um papel específico (redireciona se não bater).
 */
export async function requireProfile(role?: UserRole) {
  const ctx = await carregar();
  if (role && ctx.profile.role !== role) {
    redirect(destinoPorPapel(ctx.profile.role));
  }
  return ctx;
}

/**
 * Exige um membro da equipe (advogada admin OU associado). Cliente vai ao portal.
 */
export async function requireStaff() {
  const ctx = await carregar();
  if (ctx.profile.role !== "advogada" && ctx.profile.role !== "associado") {
    redirect("/portal");
  }
  return ctx;
}
