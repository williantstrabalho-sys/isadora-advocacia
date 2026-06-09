import { AppShell } from "@/components/app/app-shell";
import type { NavItem } from "@/components/app/sidebar-nav";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: "LayoutDashboard", exact: true },
  { href: "/dashboard/processos", label: "Processos", icon: "Briefcase" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "Users" },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: "DollarSign" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/dashboard/documentos", label: "Documentos", icon: "FolderOpen" },
  { href: "/dashboard/licoes", label: "Lições aprendidas", icon: "BookOpen" },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: "MessageSquare" },
  { href: "/dashboard/blog", label: "Blog", icon: "Newspaper" },
  { href: "/dashboard/depoimentos", label: "Depoimentos", icon: "Quote" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile("advogada");

  return (
    <AppShell
      items={NAV}
      contexto="Dashboard"
      user={{ nome: profile.nome, email: profile.email, papel: profile.role }}
    >
      {children}
    </AppShell>
  );
}
