import { cn } from "@/lib/utils";
import { CONTEUDO_PADRAO } from "@/lib/cms-defaults";

/**
 * Marca do escritório. A imagem (`src`) é configurável pelo admin (CMS); por
 * padrão usa public/logo.png. Usamos <img> simples para aceitar tanto o arquivo
 * local quanto uma URL do Storage (logo enviada pelo próprio usuário).
 *
 * Use `className` para ajustar o tamanho por contexto (ex.: "h-20 w-auto").
 */
export function Logo({
  className,
  src,
}: {
  className?: string;
  src?: string;
  /** mantido por compatibilidade — não tem efeito */
  showText?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || CONTEUDO_PADRAO.imagens.logo}
      alt="Isadora Gonçalves — Advocacia e Consultoria Jurídica"
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}
