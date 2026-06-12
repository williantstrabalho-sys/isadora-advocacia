"use client";

import { useRef, useState } from "react";
import { Smartphone, Tablet, Monitor, Move } from "lucide-react";

function parse(pos: string | undefined): { x: number; y: number } {
  const m = (pos ?? "50% 50%").match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: Number(m[1]), y: Number(m[2]) };
}

const FRAMES = [
  { label: "Celular", icon: Smartphone, ratio: "9 / 16", w: "w-20" },
  { label: "Tablet", icon: Tablet, ratio: "3 / 4", w: "w-28" },
  { label: "Computador", icon: Monitor, ratio: "16 / 9", w: "w-44" },
];

/**
 * Reposiciona o "ponto focal" da imagem (object-position) arrastando sobre a
 * foto INTEIRA — assim nada "foge" do cursor. As prévias mostram como a foto
 * fica recortada em celular, tablet e computador. Emite "X% Y%".
 */
export function ImagePositioner({
  src,
  value,
  onChange,
}: {
  src: string;
  value?: string;
  onChange: (pos: string) => void;
}) {
  const { x, y } = parse(value);
  const areaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ratio, setRatio] = useState<number>(16 / 9);
  const pos = `${x}% ${y}%`;

  function setFromEvent(clientX: number, clientY: number) {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    const ny = Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100));
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  }

  if (!src) {
    return (
      <p className="mt-3 text-xs text-brand-muted">
        Envie uma imagem acima para poder ajustar o enquadramento.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Move className="h-3.5 w-3.5" />
        Arraste o ponto sobre a foto para escolher o que deve ficar no centro do
        recorte. As prévias mostram o resultado em cada tela.
      </p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Foto inteira — área de edição */}
        <div
          ref={areaRef}
          className="relative w-full max-w-md shrink-0 cursor-crosshair touch-none select-none overflow-hidden rounded-md border border-brand-border bg-brand-bg"
          style={{ aspectRatio: String(ratio) }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            setFromEvent(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging) setFromEvent(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            setDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Ajustar enquadramento"
            onLoad={(e) => {
              const im = e.currentTarget;
              if (im.naturalWidth && im.naturalHeight)
                setRatio(im.naturalWidth / im.naturalHeight);
            }}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />
          {/* linhas-guia */}
          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-white/40"
            style={{ left: `${x}%` }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 h-px bg-white/40"
            style={{ top: `${y}%` }}
          />
          <div
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-accent/40 shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>

        {/* Prévias por dispositivo */}
        <div className="flex items-end gap-3">
          {FRAMES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex flex-col items-center gap-1">
                <div
                  className={`${f.w} overflow-hidden rounded-md border border-brand-border`}
                  style={{ aspectRatio: f.ratio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={f.label}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: pos }}
                  />
                </div>
                <span className="flex items-center gap-1 text-[10px] text-brand-muted">
                  <Icon className="h-3 w-3" /> {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-brand-muted">
        Posição atual: {pos}. Depois de ajustar, clique em{" "}
        <strong>Salvar</strong> no bloco acima.
      </p>
    </div>
  );
}
