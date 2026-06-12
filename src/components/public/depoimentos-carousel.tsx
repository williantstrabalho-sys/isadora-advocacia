"use client";

import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Depoimento = {
  autor: string;
  contexto: string | null;
  texto: string;
};

/**
 * Carrossel horizontal de depoimentos em rolagem automática contínua.
 * Pausa quando o mouse passa por cima. Os itens são duplicados para um
 * loop sem emendas (translateX de -50%).
 */
export function DepoimentosCarousel({ itens }: { itens: Depoimento[] }) {
  if (itens.length === 0) return null;
  const loop = [...itens, ...itens];

  return (
    <div className="group relative mt-12 overflow-hidden">
      {/* máscara de fade nas bordas */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-bg to-transparent" />

      <div className="dep-track flex w-max gap-6 group-hover:[animation-play-state:paused]">
        {loop.map((dep, i) => (
          <Card key={i} className="w-72 shrink-0 sm:w-80">
            <CardContent className="p-6">
              <Quote className="h-6 w-6 text-brand-accent" />
              <p className="mt-4 text-sm leading-relaxed text-brand-text/90">
                “{dep.texto}”
              </p>
              <p className="mt-6 text-sm font-medium text-brand-text">
                {dep.autor}
              </p>
              <p className="text-xs text-brand-muted">{dep.contexto}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <style>{`
        @keyframes dep-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dep-track {
          animation: dep-marquee 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .dep-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
