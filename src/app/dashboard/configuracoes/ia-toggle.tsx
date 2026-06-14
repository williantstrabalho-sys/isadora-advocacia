"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { salvarConteudo } from "../conteudo/actions";

export function IAToggle({ inicial }: { inicial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(inicial);
  const [pending, start] = useTransition();

  function toggle() {
    const novo = !on;
    setOn(novo);
    start(async () => {
      await salvarConteudo("ia", { habilitada: novo });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={toggle}
      className="inline-flex items-center gap-3"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          on ? "bg-brand-accent" : "bg-brand-elevated"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            on ? "translate-x-[1.4rem]" : "translate-x-0.5"
          )}
        />
      </span>
      <span className="text-sm font-medium">
        {on ? "Ativado" : "Desativado"}
      </span>
    </button>
  );
}
