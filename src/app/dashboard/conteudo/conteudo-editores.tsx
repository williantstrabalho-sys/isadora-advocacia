"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ConteudoSite } from "@/lib/cms-defaults";
import { useSalvarBloco, BlocoCard, AddItem, RemoveItem } from "./editor-ui";

/* ----------------------------- HERO ----------------------------- */
export function HeroEditor({ inicial }: { inicial: ConteudoSite["hero"] }) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco("hero");
  const set = (k: keyof typeof v, val: string) => setV({ ...v, [k]: val });

  return (
    <BlocoCard
      titulo="Início (Hero)"
      descricao="O grande título do topo, o texto de apoio e os botões."
      onSalvar={() => salvar(v)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input value={v.titulo} onChange={(e) => set("titulo", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Destaque (em laranja)</Label>
          <Input value={v.destaque} onChange={(e) => set("destaque", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Texto de apoio</Label>
        <Textarea rows={3} value={v.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Botão 1 — texto</Label>
          <Input value={v.cta1_label} onChange={(e) => set("cta1_label", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Botão 1 — link</Label>
          <Input value={v.cta1_href} onChange={(e) => set("cta1_href", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Botão 2 — texto</Label>
          <Input value={v.cta2_label} onChange={(e) => set("cta2_label", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Botão 2 — link</Label>
          <Input value={v.cta2_href} onChange={(e) => set("cta2_href", e.target.value)} />
        </div>
      </div>
    </BlocoCard>
  );
}

/* ------------------------- ESPECIALIDADES ------------------------ */
export function EspecialidadesEditor({
  inicial,
}: {
  inicial: ConteudoSite["especialidades"];
}) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco("especialidades");
  const setItem = (i: number, k: "titulo" | "descricao", val: string) => {
    const itens = [...v.itens];
    itens[i] = { ...itens[i], [k]: val };
    setV({ ...v, itens });
  };

  return (
    <BlocoCard
      titulo="Especialidades"
      descricao="As áreas de atuação exibidas em cards."
      onSalvar={() => salvar(v)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Título da seção</Label>
          <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Subtítulo</Label>
          <Input value={v.subtitulo} onChange={(e) => setV({ ...v, subtitulo: e.target.value })} />
        </div>
      </div>
      <div className="space-y-3">
        {v.itens.map((it, i) => (
          <div key={i} className="rounded-md border border-brand-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-brand-muted">Item {i + 1}</span>
              <RemoveItem onClick={() => setV({ ...v, itens: v.itens.filter((_, j) => j !== i) })} />
            </div>
            <Input
              className="mb-2"
              placeholder="Título"
              value={it.titulo}
              onChange={(e) => setItem(i, "titulo", e.target.value)}
            />
            <Textarea
              rows={2}
              placeholder="Descrição"
              value={it.descricao}
              onChange={(e) => setItem(i, "descricao", e.target.value)}
            />
          </div>
        ))}
        <AddItem
          label="Adicionar especialidade"
          onClick={() => setV({ ...v, itens: [...v.itens, { titulo: "", descricao: "" }] })}
        />
      </div>
    </BlocoCard>
  );
}

/* ----------------------------- SOBRE ----------------------------- */
export function SobreEditor({ inicial }: { inicial: ConteudoSite["sobre"] }) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco("sobre");

  return (
    <BlocoCard
      titulo="Sobre a advogada"
      descricao="Título, parágrafos e as formações exibidas em cards."
      onSalvar={() => salvar(v)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      <div className="space-y-1.5">
        <Label>Título</Label>
        <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Parágrafos</Label>
        {v.paragrafos.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Textarea
              rows={2}
              value={p}
              onChange={(e) => {
                const paragrafos = [...v.paragrafos];
                paragrafos[i] = e.target.value;
                setV({ ...v, paragrafos });
              }}
            />
            <RemoveItem onClick={() => setV({ ...v, paragrafos: v.paragrafos.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddItem label="Adicionar parágrafo" onClick={() => setV({ ...v, paragrafos: [...v.paragrafos, ""] })} />
      </div>

      <div className="space-y-2">
        <Label>Formações / títulos (cards)</Label>
        {v.formacoes.map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
            <Input
              placeholder="Rótulo (ex.: Pós-graduação)"
              value={f.rotulo}
              onChange={(e) => {
                const formacoes = [...v.formacoes];
                formacoes[i] = { ...formacoes[i], rotulo: e.target.value };
                setV({ ...v, formacoes });
              }}
            />
            <Input
              placeholder="Descrição"
              value={f.valor}
              onChange={(e) => {
                const formacoes = [...v.formacoes];
                formacoes[i] = { ...formacoes[i], valor: e.target.value };
                setV({ ...v, formacoes });
              }}
            />
            <RemoveItem onClick={() => setV({ ...v, formacoes: v.formacoes.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddItem
          label="Adicionar formação"
          onClick={() => setV({ ...v, formacoes: [...v.formacoes, { rotulo: "", valor: "" }] })}
        />
      </div>
    </BlocoCard>
  );
}

/* ------------------------------ FAQ ------------------------------ */
export function FaqEditor({ inicial }: { inicial: ConteudoSite["faq"] }) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco("faq");

  return (
    <BlocoCard
      titulo="Dúvidas frequentes (FAQ)"
      onSalvar={() => salvar(v)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Título da seção</Label>
          <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Subtítulo</Label>
          <Input value={v.subtitulo} onChange={(e) => setV({ ...v, subtitulo: e.target.value })} />
        </div>
      </div>
      <div className="space-y-3">
        {v.itens.map((it, i) => (
          <div key={i} className="rounded-md border border-brand-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-brand-muted">Pergunta {i + 1}</span>
              <RemoveItem onClick={() => setV({ ...v, itens: v.itens.filter((_, j) => j !== i) })} />
            </div>
            <Input
              className="mb-2"
              placeholder="Pergunta"
              value={it.pergunta}
              onChange={(e) => {
                const itens = [...v.itens];
                itens[i] = { ...itens[i], pergunta: e.target.value };
                setV({ ...v, itens });
              }}
            />
            <Textarea
              rows={3}
              placeholder="Resposta"
              value={it.resposta}
              onChange={(e) => {
                const itens = [...v.itens];
                itens[i] = { ...itens[i], resposta: e.target.value };
                setV({ ...v, itens });
              }}
            />
          </div>
        ))}
        <AddItem
          label="Adicionar pergunta"
          onClick={() => setV({ ...v, itens: [...v.itens, { pergunta: "", resposta: "" }] })}
        />
      </div>
    </BlocoCard>
  );
}

/* ----------------------- TÍTULOS DE SEÇÃO ------------------------ */
export function TitulosEditor({
  chave,
  titulo,
  inicial,
}: {
  chave: "depoimentos" | "contato";
  titulo: string;
  inicial: { titulo: string; subtitulo: string };
}) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco(chave);
  return (
    <BlocoCard titulo={titulo} onSalvar={() => salvar(v)} pending={pending} salvo={salvo} erro={erro}>
      <div className="space-y-1.5">
        <Label>Título</Label>
        <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Subtítulo</Label>
        <Textarea rows={2} value={v.subtitulo} onChange={(e) => setV({ ...v, subtitulo: e.target.value })} />
      </div>
    </BlocoCard>
  );
}

/* ---------------------------- IMAGENS ---------------------------- */
function UploadImagem({
  campo,
  label,
  atual,
  onUrl,
}: {
  campo: string;
  label: string;
  atual: string;
  onUrl: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [preview, setPreview] = useState(atual);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    setEnviando(true);
    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${campo}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("publico")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setErro("Falha no upload: " + upErr.message);
      setEnviando(false);
      return;
    }
    const { data } = supabase.storage.from("publico").getPublicUrl(path);
    setPreview(data.publicUrl);
    onUrl(data.publicUrl);
    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-md border border-brand-border p-4">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={label}
          className="h-16 w-24 rounded border border-brand-border bg-brand-bg object-contain"
        />
        <div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={enviando}>
            <Upload className="h-4 w-4" /> {enviando ? "Enviando..." : "Trocar imagem"}
          </Button>
          {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
        </div>
      </div>
    </div>
  );
}

export function ImagensEditor({ inicial }: { inicial: ConteudoSite["imagens"] }) {
  const [v, setV] = useState(inicial);
  const { salvar, pending, salvo, erro } = useSalvarBloco("imagens");

  return (
    <BlocoCard
      titulo="Imagens e marca"
      descricao="Logo, foto do topo (hero) e foto da seção Sobre. Após trocar, clique em Salvar."
      onSalvar={() => salvar(v)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      <UploadImagem campo="logo" label="Logo" atual={v.logo} onUrl={(url) => setV({ ...v, logo: url })} />
      <UploadImagem campo="hero" label="Foto do topo (hero)" atual={v.hero} onUrl={(url) => setV({ ...v, hero: url })} />
      <UploadImagem campo="sobre" label="Foto da seção Sobre" atual={v.sobre} onUrl={(url) => setV({ ...v, sobre: url })} />
    </BlocoCard>
  );
}
