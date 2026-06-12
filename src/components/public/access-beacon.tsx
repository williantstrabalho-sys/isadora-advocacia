"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Registra uma visita ao site (uma vez por sessão do navegador), sem coletar
 * nenhum dado pessoal — apenas o caminho e a data/hora. Usado para a contagem
 * de acessos no painel.
 */
export function AccessBeacon() {
  useEffect(() => {
    const path = window.location.pathname;
    try {
      // dedupe por página dentro da sessão (cada página conta 1x por sessão)
      const chave = `acesso:${path}`;
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {
      // sessionStorage indisponível — registra mesmo assim
    }
    const supabase = createClient();
    supabase
      .from("acessos")
      .insert({ path })
      .then(() => {});
  }, []);

  return null;
}
