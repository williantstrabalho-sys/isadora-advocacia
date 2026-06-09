import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AVISO_OAB } from "@/lib/constants";
import { getConfig } from "@/lib/settings";

export async function SiteFooter() {
  const cfg = await getConfig();
  return (
    <footer className="border-t border-brand-border bg-brand-surface">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo className="h-20 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-brand-muted">
              Advocacia especializada em Direito Trabalhista, com atuação em
              {" "}
              {cfg.cidade}.
            </p>
          </div>

          <div className="text-sm text-brand-muted">
            <h4 className="mb-3 font-medium text-brand-text">Escritório</h4>
            <ul className="space-y-1.5">
              <li>{cfg.advogada_nome}</li>
              <li>{cfg.oab}</li>
              <li>{cfg.endereco}</li>
              <li>{cfg.telefone}</li>
            </ul>
          </div>

          <div className="text-sm text-brand-muted">
            <h4 className="mb-3 font-medium text-brand-text">Links</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/blog" className="hover:text-brand-text">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidade"
                  className="hover:text-brand-text"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-text">
                  Área do cliente
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-border pt-6">
          <p className="text-xs leading-relaxed text-brand-muted">
            {AVISO_OAB}
          </p>
          <p className="mt-2 text-xs text-brand-muted">
            © {new Date().getFullYear()} {cfg.escritorio_nome}. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
