import Link from "next/link";
import { Newspaper, Trash2, ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/app/ui-bits";
import { PostForm } from "./post-form";
import { excluirPost } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatData } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardBlog() {
  const { supabase } = await requireProfile("advogada");

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<BlogPost[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Blog"
        descricao="Crie e gerencie artigos informativos sobre Direito Trabalhista."
        acao={<PostForm />}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          titulo="Nenhum artigo"
          descricao="Escreva o primeiro artigo do blog."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.titulo}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.map((t) => (
                        <Badge
                          key={t}
                          className="border-brand-border bg-brand-elevated text-brand-muted"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.publicado ? (
                      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="border-zinc-500/30 bg-zinc-500/15 text-zinc-400">
                        Rascunho
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-brand-muted">
                    {formatData(p.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {p.publicado && (
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/blog/${p.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <PostForm post={p} />
                      <form action={excluirPost}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
