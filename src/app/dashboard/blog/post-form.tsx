"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BLOG_TAGS } from "@/lib/constants";
import { salvarPost } from "./actions";
import type { BlogPost } from "@/lib/types";

export function PostForm({ post }: { post?: BlogPost }) {
  const [open, setOpen] = useState(false);
  const editando = Boolean(post);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo artigo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar artigo" : "Novo artigo"}</DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            await salvarPost(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {post && <input type="hidden" name="id" value={post.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              name="titulo"
              required
              defaultValue={post?.titulo}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug (URL — opcional)</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={post?.slug ?? ""}
                placeholder="gerado a partir do título"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="autor">Autor</Label>
              <Input
                id="autor"
                name="autor"
                defaultValue={post?.autor ?? ""}
                placeholder="Isadora Gonçalves"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resumo">Resumo</Label>
            <Textarea
              id="resumo"
              name="resumo"
              rows={2}
              defaultValue={post?.resumo ?? ""}
              placeholder="Breve descrição exibida na listagem."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo (Markdown)</Label>
            <Textarea
              id="conteudo"
              name="conteudo"
              rows={10}
              defaultValue={post?.conteudo ?? ""}
              placeholder={"## Subtítulo\n\nTexto do artigo em **markdown**."}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-3">
              {BLOG_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 text-sm text-brand-muted"
                >
                  <Checkbox
                    name="tags"
                    value={tag}
                    defaultChecked={post?.tags?.includes(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="publicado"
              defaultChecked={post ? post.publicado : false}
            />
            Publicar no site
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
