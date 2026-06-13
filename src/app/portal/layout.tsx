import { AppShell } from "@/components/app/app-shell";
import type { NavItem } from "@/components/app/sidebar-nav";
import { requireProfile } from "@/lib/auth";
import { getTema } from "@/lib/settings";
import { temaClaroEscuro, temaParaVars, schemeDe } from "@/lib/cores";
import { PortalThemeToggle } from "@/components/app/portal-theme-toggle";

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

  // Tema claro/escuro derivado da cor da marca, para o cliente escolher.
  const site = await getTema();
  const { claro, escuro } = temaClaroEscuro(site.accent);
  const padrao: "claro" | "escuro" = schemeDe(site) === "light" ? "claro" : "escuro";
  const mapa = JSON.stringify({
    claro: { vars: temaParaVars(claro), scheme: schemeDe(claro) },
    escuro: { vars: temaParaVars(escuro), scheme: schemeDe(escuro) },
  });

  return (
    <>
      {/* Aplica a preferência salva antes da pintura (evita "flash") */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var M=${mapa};var t=localStorage.getItem('portal-tema');if(t!=='claro'&&t!=='escuro')t='${padrao}';var d=M[t],e=document.documentElement;for(var k in d.vars){e.style.setProperty(k,d.vars[k]);}e.style.colorScheme=d.scheme;}catch(_){}})();`,
        }}
      />
      <AppShell
        items={NAV}
        contexto="Portal do Cliente"
        user={{ nome: profile.nome, email: profile.email, papel: profile.role }}
      >
        {children}
      </AppShell>
      <PortalThemeToggle claro={claro} escuro={escuro} padrao={padrao} />
    </>
  );
}
