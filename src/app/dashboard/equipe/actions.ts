"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";

type Resultado = { ok?: true; error?: string };

const SEM_CHAVE =
  "Gestão de usuários indisponível: defina SUPABASE_SERVICE_ROLE_KEY no servidor (Vercel).";

export async function criarUsuario(formData: FormData): Promise<Resultado> {
  await requireProfile("advogada");
  if (!hasAdminKey()) return { error: SEM_CHAVE };

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const role =
    String(formData.get("papel")) === "associado" ? "associado" : "advogada";

  if (!nome || !email || senha.length < 6) {
    return { error: "Preencha nome, e-mail e senha (mín. 6 caracteres)." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { role, nome },
  });

  if (error) {
    return {
      error: /already|exist|registered/i.test(error.message)
        ? "Já existe um usuário com esse e-mail."
        : error.message,
    };
  }

  // Garante o profile com o papel escolhido (o trigger já cria, reforçamos)
  if (data.user) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      role,
      nome,
      email,
    });
  }

  revalidatePath("/dashboard/equipe");
  return { ok: true };
}

export async function atualizarUsuario(formData: FormData): Promise<Resultado> {
  await requireProfile("advogada");
  if (!hasAdminKey()) return { error: SEM_CHAVE };

  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const role =
    String(formData.get("papel")) === "associado" ? "associado" : "advogada";

  if (!id || !nome || !email) {
    return { error: "Nome e e-mail são obrigatórios." };
  }

  const admin = createAdminClient();
  const attrs: {
    email: string;
    email_confirm: boolean;
    user_metadata: Record<string, unknown>;
    password?: string;
  } = {
    email,
    email_confirm: true,
    user_metadata: { role, nome },
  };
  if (senha) {
    if (senha.length < 6)
      return { error: "A nova senha precisa ter ao menos 6 caracteres." };
    attrs.password = senha;
  }

  const { error } = await admin.auth.admin.updateUserById(id, attrs);
  if (error) return { error: error.message };

  await admin.from("profiles").update({ nome, email, role }).eq("id", id);

  revalidatePath("/dashboard/equipe");
  return { ok: true };
}

export async function excluirUsuario(formData: FormData) {
  const { profile } = await requireProfile("advogada");
  if (!hasAdminKey()) return;

  const id = String(formData.get("id") || "");
  // Proteção: não permitir excluir a própria conta (evita travar o acesso)
  if (!id || id === profile.id) return;

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/dashboard/equipe");
}
