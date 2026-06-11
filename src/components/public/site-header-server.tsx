import { SiteHeader } from "@/components/public/site-header";
import { getConteudo } from "@/lib/settings";

/**
 * Wrapper de servidor: busca a logo configurada (CMS) e injeta no cabeçalho
 * (que é client). Use este componente nas páginas públicas.
 */
export async function SiteHeaderServer() {
  const conteudo = await getConteudo();
  return <SiteHeader logoSrc={conteudo.imagens.logo} />;
}
