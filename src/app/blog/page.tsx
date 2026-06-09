import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatData } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog — Direito Trabalhista",
  description:
    "Artigos informativos sobre Direito do Trabalho: CLT, jurisprudência do TST, súmulas, NRs e Reforma Trabalhista.",
};

// Conteúdo dinâmico (depende do banco)
export const dynamic = "force-dynamic";

async function getPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("publicado", true)
      .order("created_at", { ascending: false });
    return (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <main className="container py-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Blog Trabalhista
          </h1>
          <p className="mt-3 text-brand-muted">
            Artigos de caráter informativo sobre Direito do Trabalho. Conteúdo
            educativo, sem finalidade de captação de clientela.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 text-brand-muted">
            Nenhum artigo publicado no momento. Volte em breve.
          </p>
        ) : (
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-brand-border bg-brand-border md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-brand-surface p-8 transition-colors hover:bg-brand-elevated"
              >
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
                <h2 className="mt-4 font-display text-xl font-semibold group-hover:text-brand-accent">
                  {post.titulo}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">
                  {post.resumo}
                </p>
                <p className="mt-4 text-xs text-brand-muted">
                  {post.autor ? `${post.autor} · ` : ""}
                  {formatData(post.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
