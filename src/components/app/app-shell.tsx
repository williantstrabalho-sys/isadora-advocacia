import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SidebarNav, type NavItem } from "@/components/app/sidebar-nav";
import { LogoutButton } from "@/components/app/logout-button";
import { MobileSidebar } from "@/components/app/mobile-sidebar";

type Props = {
  items: NavItem[];
  /** rótulo do contexto (ex.: "Portal do Cliente" / "Dashboard") */
  contexto: string;
  user: { nome: string; email: string; papel: string };
  children: React.ReactNode;
};

/**
 * Shell com sidebar fixa para áreas autenticadas (portal e dashboard).
 */
export async function AppShell({ items, contexto, user, children }: Props) {
  const { getConteudo } = await import("@/lib/settings");
  const logoSrc = (await getConteudo()).imagens.logo;
  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-brand-border bg-brand-surface lg:flex">
        <div className="flex items-center justify-center border-b border-brand-border px-6 py-6">
          <Link href="/" aria-label="Início">
            <span className="flex items-center justify-center rounded-xl bg-gradient-to-b from-brand-elevated to-brand-surface px-5 py-4 shadow-[0_10px_40px_-12px_rgba(212,105,30,0.45)] ring-1 ring-brand-accent/30">
              <Logo src={logoSrc} className="h-20 w-auto" />
            </span>
          </Link>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] uppercase tracking-wider text-brand-muted">
            {contexto}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <SidebarNav items={items} />
        </div>
        <div className="border-t border-brand-border p-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-brand-text">
              {user.nome}
            </p>
            <p className="truncate text-xs text-brand-muted">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-brand-border bg-brand-bg/80 px-4 backdrop-blur lg:hidden">
          <Link href="/" aria-label="Início">
            <span className="flex items-center justify-center rounded-lg bg-gradient-to-b from-brand-elevated to-brand-surface px-2.5 py-1.5 ring-1 ring-brand-accent/30">
              <Logo src={logoSrc} className="h-10 w-auto" />
            </span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-brand-muted">
            {contexto}
          </span>
          <MobileSidebar items={items} user={user} contexto={contexto} />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
