"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { temaParaVars, schemeDe, type Tema } from "@/lib/cores";

const KEY = "portal-tema";

/**
 * Botão flutuante para o cliente alternar entre tema claro e escuro no portal.
 * A preferência fica salva no navegador (localStorage) e só vale para o portal.
 */
export function PortalThemeToggle({
  claro,
  escuro,
  padrao,
}: {
  claro: Tema;
  escuro: Tema;
  padrao: "claro" | "escuro";
}) {
  const [modo, setModo] = useState<"claro" | "escuro">(padrao);

  function aplicar(m: "claro" | "escuro") {
    const tema = m === "claro" ? claro : escuro;
    const el = document.documentElement;
    Object.entries(temaParaVars(tema)).forEach(([k, v]) =>
      el.style.setProperty(k, v)
    );
    el.style.colorScheme = schemeDe(tema);
  }

  useEffect(() => {
    let inicial = padrao;
    try {
      const s = localStorage.getItem(KEY);
      if (s === "claro" || s === "escuro") inicial = s;
    } catch {
      /* ignora */
    }
    setModo(inicial);
    aplicar(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alternar() {
    const novo = modo === "claro" ? "escuro" : "claro";
    setModo(novo);
    try {
      localStorage.setItem(KEY, novo);
    } catch {
      /* ignora */
    }
    aplicar(novo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      title="Alternar tema claro/escuro"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text shadow-lg transition-colors hover:bg-brand-elevated"
    >
      {modo === "claro" ? (
        <>
          <Moon className="h-4 w-4" /> Modo escuro
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" /> Modo claro
        </>
      )}
    </button>
  );
}
