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
    try {
      if (sessionStorage.getItem("acesso-registrado")) return;
      sessionStorage.setItem("acesso-registrado", "1");
    } catch {
      // sessionStorage indisponível — registra mesmo assim
    }
    const supabase = createClient();
    supabase
      .from("acessos")
      .insert({ path: window.location.pathname })
      .then(() => {});
  }, []);

  return null;
}
