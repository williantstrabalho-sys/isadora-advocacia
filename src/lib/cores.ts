// ============================================================================
// Tema de cores do site/sistema. Gera paletas harmônicas a partir da cor
// predominante da logo e converte para as variáveis CSS usadas pelo Tailwind.
// ============================================================================

export type Tema = {
  bg: string;
  surface: string;
  elevated: string;
  accent: string;
  accentHover: string;
  text: string;
  muted: string;
  border: string;
};

// Tema padrão (igual aos valores originais do tailwind.config / :root).
export const TEMA_PADRAO: Tema = {
  bg: "#0a0a0a",
  surface: "#111111",
  elevated: "#1a1a1a",
  accent: "#d4691e",
  accentHover: "#e8842b",
  text: "#f0f0f0",
  muted: "#8a8a8a",
  border: "#2a2a2a",
};

// As 8 chaves do tema -> nome da variável CSS.
export const TEMA_VARS: Record<keyof Tema, string> = {
  bg: "--brand-bg",
  surface: "--brand-surface",
  elevated: "--brand-elevated",
  accent: "--brand-accent",
  accentHover: "--brand-accent-hover",
  text: "--brand-text",
  muted: "--brand-muted",
  border: "--brand-border",
};

/** "#0a0a0a" -> "10 10 10" (canais RGB para usar com rgb(var() / <alpha>)). */
export function hexParaCanais(hex: string): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `${r} ${g} ${b}`;
}

/**
 * Converte um Tema (cores em hex) em objeto de variáveis CSS, no formato de
 * canais RGB ("r g b"), para o Tailwind aplicar opacidade via <alpha-value>.
 */
export function temaParaVars(tema: Tema): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(TEMA_VARS) as (keyof Tema)[]).forEach((k) => {
    out[TEMA_VARS[k]] = hexParaCanais(tema[k]);
  });
  return out;
}

// --------------------------- conversões de cor ---------------------------

export function hexParaHsl(hex: string): { h: number; s: number; l: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hh = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) hh = ((g - b) / d) % 6;
    else if (max === g) hh = (b - r) / d + 2;
    else hh = (r - g) / d + 4;
    hh *= 60;
    if (hh < 0) hh += 360;
  }
  return { h: Math.round(hh), s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
}

export function hslParaHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Luminância relativa (WCAG) a partir do hex — usada para contraste. */
function luminancia(hex: string): number {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contraste(c1: string, c2: string): number {
  const l1 = luminancia(c1);
  const l2 = luminancia(c2);
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return +((a + 0.05) / (b + 0.05)).toFixed(2);
}

export type PaletaSugerida = { id: string; nome: string; descricao: string; tema: Tema };

/**
 * Gera 3 paletas escuras harmônicas a partir de uma cor de destaque (da logo).
 * Mantém texto claro e contraste seguro; varia o tratamento do fundo.
 */
export function gerarPaletas(accentHex: string): PaletaSugerida[] {
  const base = hexParaHsl(accentHex);
  // Garante que o destaque seja visível sobre fundo escuro.
  const accentL = clamp(base.l, 46, 66);
  const accentS = clamp(base.s, 45, 95);
  const accent = hslParaHex(base.h, accentS, accentL);
  const accentHover = hslParaHex(base.h, accentS, clamp(accentL + 9, 0, 80));
  const h = base.h;

  return [
    {
      id: "classico",
      nome: "Escuro clássico",
      descricao: "Fundo preto neutro, destaque na cor da marca.",
      tema: {
        bg: "#0a0a0a",
        surface: "#111111",
        elevated: "#1a1a1a",
        border: "#2a2a2a",
        text: "#f0f0f0",
        muted: "#8a8a8a",
        accent,
        accentHover,
      },
    },
    {
      id: "tonalizado",
      nome: "Tonalizado pela marca",
      descricao: "Fundo escuro levemente tingido com o tom da logo.",
      tema: {
        bg: hslParaHex(h, 12, 5),
        surface: hslParaHex(h, 11, 8),
        elevated: hslParaHex(h, 10, 13),
        border: hslParaHex(h, 9, 20),
        text: "#f5f5f4",
        muted: hslParaHex(h, 6, 60),
        accent,
        accentHover,
      },
    },
    {
      id: "elegante",
      nome: "Carvão elegante",
      descricao: "Fundo grafite com mais profundidade e bordas suaves.",
      tema: {
        bg: hslParaHex(h, 16, 7),
        surface: hslParaHex(h, 14, 11),
        elevated: hslParaHex(h, 13, 16),
        border: hslParaHex(h, 11, 26),
        text: "#ffffff",
        muted: "#a1a1aa",
        accent: hslParaHex(h, clamp(accentS + 4, 0, 100), accentL),
        accentHover,
      },
    },
  ];
}
