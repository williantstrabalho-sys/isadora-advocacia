"use client";

import { useRef, useState } from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";

function parse(pos: string | undefined): { x: number; y: number } {
  const m = (pos ?? "50% 50%").match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: Number(m[1]), y: Number(m[2]) };
}

const FRAMES = [
  { label: "Celular", icon: Smartphone, ratio: "9 / 16", w: "w-24" },
  { label: "Tablet", icon: Tablet, ratio: "3 / 4", w: "w-36" },
  { label: "Computador", icon: Monitor, ratio: "16 / 9", w: "w-full" },
];

/**
 * Permite reposicionar o "ponto focal" da imagem (object-position) arrastando
 * sobre uma área de edição, com prévia de como fica em celular, tablet e
 * computador. Emite a string objectPosition (ex.: "50% 30%").
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
  const pos = `${x}% ${y}%`;

  function setFromEvent(clientX: number, clientY: number) {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    const ny = Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100));
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-brand-muted">
        Arraste o ponto sobre a imagem para escolher o que fica centralizado —
        as prévias ao lado mostram como ficará em cada tela.
      </p>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        {/* Área de edição (arrastar o ponto focal) */}
        <div
          ref={areaRef}
          className="relative aspect-video w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md border border-brand-border"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setDragging(true);
            setFromEvent(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging && setFromEvent(e.clientX, e.clientY)}
          onPointerUp={() => setDragging(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Editar posição"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: pos }}
          />
          <div
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
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
    </div>
  );
}
