import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeaderServer } from "@/components/public/site-header-server";
import { SiteFooter } from "@/components/public/site-footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatData } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .single();
    return (data as BlogPost | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.titulo,
    description: post.resumo ?? undefined,
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeaderServer />
      <main className="container py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>

        <article className="mx-auto mt-8 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Badge
                key={tag}
                className="border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight">
            {post.titulo}
          </h1>
          <p className="mt-4 text-sm text-brand-muted">
            {post.autor ? `${post.autor} · ` : ""}
            {formatData(post.created_at)}
          </p>

          <div className="prose-brand mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.conteudo ?? ""}
            </ReactMarkdown>
          </div>

          {/* Sem CTA comercial dentro do artigo — conformidade OAB */}
          <div className="mt-12 rounded-lg border border-brand-border bg-brand-surface p-6 text-xs text-brand-muted">
            Este artigo tem finalidade exclusivamente informativa e não constitui
            consulta ou parecer jurídico. Cada caso deve ser analisado
            individualmente.
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
