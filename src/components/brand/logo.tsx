import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marca do escritório — usa exclusivamente o arquivo original public/logo.png
 * (monograma + tagline já embutidos na arte). O arquivo não é alterado:
 * apenas exibido e dimensionado. Sem texto adicional ao lado.
 *
 * Use `className` para ajustar o tamanho por contexto (ex.: "h-20 w-auto").
 */
export function Logo({
  className,
}: {
  className?: string;
  /** mantido por compatibilidade — não tem efeito (a arte já contém o texto) */
  showText?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Isadora Gonçalves — Advocacia e Consultoria Jurídica"
      width={1494}
      height={946}
      priority
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}
