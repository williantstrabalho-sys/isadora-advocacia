import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ESCRITORIO, SITE_URL } from "@/lib/constants";
import { CookieConsent } from "@/components/public/cookie-consent";
import { getTema } from "@/lib/settings";
import { temaParaVars } from "@/lib/cores";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${ESCRITORIO.nomeCurto} — Direito Trabalhista em Brasília/DF`,
    template: `%s | ${ESCRITORIO.nomeCurto}`,
  },
  description:
    "Escritório especializado em Direito Trabalhista em Brasília/DF. Atuação em rescisão indireta, horas extras, assédio moral, FGTS, verbas rescisórias e acidente de trabalho.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: ESCRITORIO.nomeCurto,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tema = await getTema();

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} dark`}
      style={temaParaVars(tema) as React.CSSProperties}
    >
      <body className="min-h-screen bg-brand-bg font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
