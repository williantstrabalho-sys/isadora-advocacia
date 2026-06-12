import { AppShell } from "@/components/app/app-shell";
import type { NavItem } from "@/components/app/sidebar-nav";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { href: "/portal", label: "Painel", icon: "LayoutDashboard", exact: true },
  { href: "/portal/processos", label: "Meus processos", icon: "Briefcase" },
  { href: "/portal/reunioes", label: "Reuniões", icon: "CalendarClock" },
  { href: "/portal/documentos", label: "Documentos", icon: "FileText" },
  { href: "/portal/mensagens", label: "Mensagens", icon: "MessageSquare" },
  { href: "/portal/honorarios", label: "Honorários", icon: "Wallet" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile("cliente");

  return (
    <AppShell
      items={NAV}
      contexto="Portal do Cliente"
      user={{ nome: profile.nome, email: profile.email, papel: profile.role }}
    >
      {children}
    </AppShell>
  );
}
