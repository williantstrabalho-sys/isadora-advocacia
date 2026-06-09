import { format, formatDistanceToNow, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatData(
  value: string | Date | null | undefined,
  pattern = "dd/MM/yyyy"
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return format(d, pattern, { locale: ptBR });
}

export function formatDataHora(value: string | Date | null | undefined): string {
  return formatData(value, "dd/MM/yyyy 'às' HH:mm");
}

export function desde(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function diasAte(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return null;
  return differenceInCalendarDays(d, new Date());
}

/** Mascara CPF para exibição parcial: 123.***.**9-00 */
export function mascararCPF(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.**${digits.slice(8, 9)}-${digits.slice(9)}`;
}

/** Formata CPF completo: 123.456.789-00 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Formata número CNJ: 0000000-00.0000.0.00.0000 */
export function formatCNJ(cnj: string | null | undefined): string {
  if (!cnj) return "—";
  const d = cnj.replace(/\D/g, "");
  if (d.length !== 20) return cnj;
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(
    13,
    14
  )}.${d.slice(14, 16)}.${d.slice(16)}`;
}

export function formatTamanho(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
