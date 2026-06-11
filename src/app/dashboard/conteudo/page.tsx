import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConteudo } from "@/lib/settings";
import { PageHeader } from "@/components/app/ui-bits";
import {
  HeroEditor,
  EspecialidadesEditor,
  SobreEditor,
  FaqEditor,
  TitulosEditor,
  ImagensEditor,
} from "./conteudo-editores";

export const dynamic = "force-dynamic";

export default async function DashboardConteudo() {
  await requireProfile("advogada");
  const c = await getConteudo();

  return (
    <>
      <PageHeader
        titulo="Conteúdo do site"
        descricao="Edite os textos e as imagens da página inicial. As alterações aparecem no site assim que você salva."
        acao={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
          >
            Ver site <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-6">
        <ImagensEditor inicial={c.imagens} />
        <HeroEditor inicial={c.hero} />
        <EspecialidadesEditor inicial={c.especialidades} />
        <SobreEditor inicial={c.sobre} />
        <TitulosEditor
          chave="depoimentos"
          titulo="Seção de depoimentos (título)"
          inicial={c.depoimentos}
        />
        <FaqEditor inicial={c.faq} />
        <TitulosEditor
          chave="contato"
          titulo="Seção de contato (título)"
          inicial={c.contato}
        />
      </div>

      <p className="mt-6 text-xs text-brand-muted">
        Dica: os depoimentos em si são gerenciados na aba “Depoimentos”, e os
        dados de contato (telefone, OAB, endereço, e-mail) em “Configurações”.
      </p>
    </>
  );
}
