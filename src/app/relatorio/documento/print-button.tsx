"use client";

import { Printer } from "lucide-react";

export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-[#0f1b2d] px-4 py-2 text-sm font-medium text-white hover:opacity-90 print:hidden"
    >
      <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
    </button>
  );
}
