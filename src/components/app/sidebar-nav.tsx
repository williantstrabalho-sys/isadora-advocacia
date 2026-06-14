"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Wallet,
  Users,
  DollarSign,
  Calendar,
  CalendarClock,
  FolderOpen,
  FileSignature,
  Settings,
  Newspaper,
  Quote,
  BookOpen,
  UserCog,
  LayoutTemplate,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Registro de ícones — resolvido no client. Os layouts (Server Components)
 * passam apenas o NOME do ícone (string serializável), não o componente,
 * pois funções/componentes não cruzam a fronteira server→client.
 */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Wallet,
  Users,
  DollarSign,
  Calendar,
  CalendarClock,
  FolderOpen,
  FileSignature,
  Settings,
  Newspaper,
  Quote,
  BookOpen,
  UserCog,
  LayoutTemplate,
  Inbox,
};

export type IconName = keyof typeof ICONS;

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** rota exata (não usa prefixo) — útil para o item raiz */
  exact?: boolean;
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const ativo = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              ativo
                ? "bg-brand-elevated text-brand-text"
                : "text-brand-muted hover:bg-brand-elevated/60 hover:text-brand-text"
            )}
          >
            <Icon
              className={cn("h-4 w-4 shrink-0", ativo && "text-brand-accent")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
