"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function salvarPost(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const titulo = String(formData.get("titulo") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const slug = slugify(slugRaw || titulo);

  const payload = {
    titulo,
    slug,
    resumo: String(formData.get("resumo") || "").trim() || null,
    conteudo: String(formData.get("conteudo") || "").trim() || null,
    autor: String(formData.get("autor") || "").trim() || null,
    tags: formData.getAll("tags").map((t) => String(t)),
    publicado: formData.get("publicado") === "on",
  };

  if (id) {
    await supabase.from("blog_posts").update(payload).eq("id", id);
  } else {
    await supabase.from("blog_posts").insert(payload);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/dashboard/blog");
}

export async function excluirPost(formData: FormData) {
  const { supabase } = await requireProfile("advogada");
  await supabase
    .from("blog_posts")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}
