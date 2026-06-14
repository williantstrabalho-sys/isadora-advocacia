import { AppShell } from "@/components/app/app-shell";
import type { NavItem } from "@/components/app/sidebar-nav";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV_ADMIN: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: "LayoutDashboard", exact: true },
  { href: "/dashboard/processos", label: "Processos", icon: "Briefcase" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "Users" },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: "DollarSign" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/dashboard/documentos", label: "Documentos", icon: "FolderOpen" },
  { href: "/dashboard/modelos", label: "Documentos modelo", icon: "FileSignature" },
  { href: "/dashboard/assistente", label: "Assistente IA", icon: "Sparkles" },
  { href: "/dashboard/licoes", label: "Lições aprendidas", icon: "BookOpen" },
  { href: "/dashboard/mensagens", label: "Atendimento", icon: "MessageSquare" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "Settings" },
];

// Associado: apenas os processos direcionados a ele e o trabalho relacionado.
const NAV_ASSOCIADO: NavItem[] = [
  { href: "/dashboard/processos", label: "Meus processos", icon: "Briefcase" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/dashboard/documentos", label: "Documentos", icon: "FolderOpen" },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: "MessageSquare" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  const associado = profile.role === "associado";

  return (
    <AppShell
      items={associado ? NAV_ASSOCIADO : NAV_ADMIN}
      contexto={associado ? "Advogado(a) associado(a)" : "Dashboard"}
      user={{ nome: profile.nome, email: profile.email, papel: profile.role }}
    >
      {children}
    </AppShell>
  );
}
