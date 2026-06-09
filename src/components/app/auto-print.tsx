"use client";

import { useEffect } from "react";

/** Dispara a janela de impressão (Salvar como PDF) ao montar. */
export function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}
