import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Carrega o usuário autenticado e seu profile no servidor.
 * Redireciona para /login se não houver sessão.
 * Opcionalmente exige um papel específico.
 */
export async function requireProfile(role?: "cliente" | "advogada") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const profile = data;
  if (!profile) redirect("/login");

  if (role && profile.role !== role) {
    redirect(profile.role === "advogada" ? "/dashboard" : "/portal");
  }

  return { supabase, user, profile };
}
