"use client";

import { useEffect, useState } from "react";
import { Check, Palette, Pipette } from "lucide-react";
import {
  gerarPaletas,
  hexParaHsl,
  contraste,
  temaParaVars,
  TEMA_PADRAO,
  type Tema,
  type PaletaSugerida,
} from "@/lib/cores";
import { useSalvarBloco, BlocoCard } from "./editor-ui";

function rgbParaHex(r: number, g: number, b: number) {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Extrai as cores predominantes (vivas) de uma imagem. Retorna [] se não der. */
async function extrairCores(url: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const escala = Math.min(1, 90 / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * escala));
        const h = Math.max(1, Math.round(img.height * escala));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext("2d");
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const buckets: Record<string, { n: number; r: number; g: number; b: number }> = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue;
          const { s, l } = hexParaHsl(rgbParaHex(r, g, b));
          if (s < 18 || l > 92 || l < 8) continue; // ignora cinzas e extremos
          const key = `${Math.round(r / 26)}-${Math.round(g / 26)}-${Math.round(b / 26)}`;
          const o = (buckets[key] ||= { n: 0, r: 0, g: 0, b: 0 });
          o.n++; o.r += r; o.g += g; o.b += b;
        }
        const ordenado = Object.values(buckets).sort((a, b) => b.n - a.n);
        const cores: string[] = [];
        for (const o of ordenado) {
          const hex = rgbParaHex(
            Math.round(o.r / o.n),
            Math.round(o.g / o.n),
            Math.round(o.b / o.n)
          );
          const { h } = hexParaHsl(hex);
          // evita tons quase iguais (hue próxima)
          if (cores.every((c) => Math.abs(hexParaHsl(c).h - h) > 22)) cores.push(hex);
          if (cores.length >= 4) break;
        }
        resolve(cores);
      } catch {
        resolve([]); // imagem "tainted" (CORS) — sem extração automática
      }
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
}

const CAMPOS: { k: keyof Tema; label: string }[] = [
  { k: "accent", label: "Destaque (botões, links)" },
  { k: "accentHover", label: "Destaque ao passar o mouse" },
  { k: "bg", label: "Fundo" },
  { k: "surface", label: "Cartões" },
  { k: "elevated", label: "Cartões (realce)" },
  { k: "text", label: "Texto" },
  { k: "muted", label: "Texto secundário" },
  { k: "border", label: "Bordas" },
];

export function TemaEditor({
  logoUrl,
  temaInicial,
}: {
  logoUrl: string;
  temaInicial: Tema;
}) {
  const { salvar, pending, salvo, erro } = useSalvarBloco("tema");
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [detectadas, setDetectadas] = useState<string[]>([]);
  const [paletas, setPaletas] = useState<PaletaSugerida[]>(
    gerarPaletas(temaInicial.accent)
  );
  const [selecionada, setSelecionada] = useState<string>("");
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    let vivo = true;
    extrairCores(logoUrl).then((cores) => {
      if (!vivo) return;
      setDetectadas(cores);
      if (cores.length > 0) setPaletas(gerarPaletas(cores[0]));
    });
    return () => {
      vivo = false;
    };
  }, [logoUrl]);

  function aplicarPaleta(p: PaletaSugerida) {
    setTema(p.tema);
    setSelecionada(p.id);
    setCustom(false);
  }

  function gerarDaCor(cor: string) {
    setPaletas(gerarPaletas(cor));
    setSelecionada("");
  }

  const ctAccent = contraste(tema.accent, tema.bg);
  const ctText = contraste(tema.text, tema.bg);

  return (
    <BlocoCard
      titulo="Cores do site e do sistema"
      descricao="Escolha uma paleta sugerida a partir da sua logo ou personalize. As cores valem para o site público e para o painel."
      onSalvar={() => salvar(tema)}
      pending={pending}
      salvo={salvo}
      erro={erro}
    >
      {/* Cores detectadas na logo */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <Pipette className="h-4 w-4 text-brand-accent" /> Cores detectadas na
          sua logo
        </p>
        {detectadas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detectadas.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => gerarDaCor(c)}
                title={`Gerar paletas a partir de ${c}`}
                className="flex items-center gap-2 rounded-md border border-brand-border px-2 py-1 text-xs hover:border-brand-accent"
              >
                <span
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ background: c }}
                />
                {c}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-muted">
            Não consegui ler as cores da logo automaticamente. Use as sugestões
            abaixo ou personalize manualmente.
          </p>
        )}
      </div>

      {/* Sugestões de paleta */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <Palette className="h-4 w-4 text-brand-accent" /> Sugestões harmônicas
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {paletas.map((p) => {
            const ativo = selecionada === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => aplicarPaleta(p)}
                className={`overflow-hidden rounded-lg border text-left transition-colors ${
                  ativo ? "border-brand-accent" : "border-brand-border hover:border-brand-accent/50"
                }`}
              >
                <div className="p-3" style={{ background: p.tema.bg }}>
                  <div
                    className="rounded-md p-2"
                    style={{ background: p.tema.surface, border: `1px solid ${p.tema.border}` }}
                  >
                    <span className="text-xs" style={{ color: p.tema.text }}>
                      Exemplo
                    </span>
                    <div
                      className="mt-2 rounded px-2 py-1 text-center text-[10px] font-semibold"
                      style={{ background: p.tema.accent, color: p.tema.bg }}
                    >
                      Botão
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium">{p.nome}</p>
                    <p className="text-[10px] text-brand-muted">{p.descricao}</p>
                  </div>
                  {ativo && <Check className="h-4 w-4 shrink-0 text-brand-accent" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personalizar */}
      <div>
        <button
          type="button"
          onClick={() => setCustom((v) => !v)}
          className="text-sm text-brand-accent hover:underline"
        >
          {custom ? "Ocultar personalização" : "Personalizar cores manualmente"}
        </button>
        {custom && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CAMPOS.map(({ k, label }) => (
              <div key={k} className="flex items-center justify-between gap-2 rounded-md border border-brand-border p-2">
                <span className="text-xs">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tabular-nums text-brand-muted">
                    {tema[k]}
                  </span>
                  <input
                    type="color"
                    value={tema[k]}
                    onChange={(e) => {
                      setTema({ ...tema, [k]: e.target.value });
                      setSelecionada("");
                    }}
                    className="h-7 w-9 cursor-pointer rounded border border-brand-border bg-transparent"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTema(TEMA_PADRAO)}
              className="text-left text-xs text-brand-muted hover:text-brand-text sm:col-span-2"
            >
              Restaurar cores padrão
            </button>
          </div>
        )}
      </div>

      {/* Prévia ao vivo (usa as variáveis do tema editado) */}
      <div>
        <p className="mb-2 text-sm font-medium">Prévia</p>
        <div
          style={temaParaVars(tema) as React.CSSProperties}
          className="rounded-lg border border-brand-border bg-brand-bg p-4"
        >
          <div className="rounded-md border border-brand-border bg-brand-surface p-4">
            <h4 className="font-display text-base font-semibold text-brand-text">
              Título de exemplo
            </h4>
            <p className="mt-1 text-sm text-brand-muted">
              Texto secundário de exemplo para conferir a legibilidade.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-bg transition-colors hover:bg-brand-accent-hover"
              >
                Botão primário
              </button>
              <span className="rounded-md border border-brand-border bg-brand-elevated px-3 py-1.5 text-sm text-brand-text">
                Secundário
              </span>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-brand-accent underline">
                Um link
              </a>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-brand-muted">
          Contraste do texto: {ctText.toFixed(1)}:1{" "}
          {ctText < 4.5 && "⚠️ baixo"} · Contraste do destaque: {ctAccent.toFixed(1)}:1{" "}
          {ctAccent < 3 && "⚠️ baixo"} (recomendado ≥ 4,5 para texto)
        </p>
      </div>
    </BlocoCard>
  );
}
