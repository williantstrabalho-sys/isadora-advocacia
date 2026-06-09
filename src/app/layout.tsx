import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ESCRITORIO } from "@/lib/constants";
import { CookieConsent } from "@/components/public/cookie-consent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-brand-bg font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
