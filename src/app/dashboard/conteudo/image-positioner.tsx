"use client";

import { useRef, useState } from "react";
import { Move, ZoomIn } from "lucide-react";

function parse(pos: string | undefined): { x: number; y: number } {
  const m = (pos ?? "50% 50%").match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: Number(m[1]), y: Number(m[2]) };
}

export type PreviewFrame = { label: string; ratio: number };

/**
 * Ajusta o enquadramento da imagem para um "slot" do site:
 *  - arraste o ponto sobre a foto INTEIRA para escolher o ponto focal (object-position);
 *  - use o zoom para aproximar/afastar (scale ancorado no ponto focal).
 * As prévias usam as PROPORÇÕES REAIS de como a foto aparece no site.
 */
export function ImagePositioner({
  src,
  value,
  zoom = 1,
  previews,
  onChange,
  onZoomChange,
}: {
  src: string;
  value?: string;
  zoom?: number;
  previews: PreviewFrame[];
  onChange: (pos: string) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const { x, y } = parse(value);
  const areaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ratio, setRatio] = useState<number>(16 / 9);
  const pos = `${x}% ${y}%`;
  const transform = `scale(${zoom})`;

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

  const PREVIEW_H = 104; // px — altura fixa das prévias

  return (
    <div className="mt-3 space-y-3">
      <p className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Move className="h-3.5 w-3.5" />
        Arraste o ponto sobre a foto para escolher o que fica no centro do
        recorte. As prévias mostram o tamanho real em cada tela.
      </p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Foto inteira — área de edição */}
        <div className="w-full max-w-md shrink-0 space-y-3">
          <div
            ref={areaRef}
            className="relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md border border-brand-border bg-brand-bg"
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

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 shrink-0 text-brand-muted" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-brand-accent"
            />
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-brand-muted">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Prévias com a proporção real de cada tela */}
        <div className="flex flex-wrap items-end gap-3">
          {previews.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <div
                className="overflow-hidden rounded-md border border-brand-border"
                style={{ height: PREVIEW_H, width: PREVIEW_H * f.ratio }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={f.label}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: pos, transform, transformOrigin: pos }}
                />
              </div>
              <span className="text-[10px] text-brand-muted">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-brand-muted">
        Posição: {pos} · Zoom: {zoom.toFixed(1)}x. Depois de ajustar, clique em{" "}
        <strong>Salvar</strong> no bloco acima.
      </p>
    </div>
  );
}
