"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/dashboard/contatos", label: "Contatos recebidos", icon: Inbox },
];

export function AtendimentoTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 inline-flex rounded-lg border border-brand-border bg-brand-elevated p-1">
      {TABS.map((t) => {
        const ativo = pathname.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              ativo
                ? "bg-brand-accent text-brand-bg"
                : "text-brand-muted hover:text-brand-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
