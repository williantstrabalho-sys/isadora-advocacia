import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { getConfig } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade e tratamento de dados pessoais em conformidade com a LGPD (Lei 13.709/2018).",
};

export const dynamic = "force-dynamic";

export default async function PoliticaPrivacidadePage() {
  const cfg = await getConfig();
  return (
    <>
      <SiteHeader />
      <main className="container py-16">
        <article className="prose-brand mx-auto max-w-3xl">
          <h1>Política de Privacidade</h1>
          <p className="text-brand-muted">
            Última atualização: {new Date().getFullYear()}. Esta política descreve
            como {cfg.escritorio_nome} trata dados pessoais, em conformidade com a Lei
            Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
          </p>

          <h2>1. Controlador dos dados</h2>
          <p>
            O controlador é {cfg.escritorio_nome}, {cfg.oab}, com endereço em{" "}
            {cfg.endereco}. Contato para assuntos de privacidade:{" "}
            {cfg.email}.
          </p>

          <h2>2. Dados que coletamos</h2>
          <ul>
            <li>
              <strong>Formulário de contato:</strong> nome, e-mail, assunto e
              mensagem, mediante consentimento explícito.
            </li>
            <li>
              <strong>Clientes (área restrita):</strong> dados cadastrais e
              processuais necessários à prestação do serviço advocatício,
              incluindo dados sensíveis como CPF e CTPS.
            </li>
            <li>
              <strong>Cookies:</strong> apenas essenciais por padrão; cookies de
              análise dependem do seu aceite no banner de consentimento.
            </li>
          </ul>

          <h2>3. Finalidade do tratamento</h2>
          <p>
            Os dados são tratados para resposta a contatos, prestação de serviços
            jurídicos, cumprimento de obrigações legais e exercício regular de
            direitos em processo judicial ou administrativo.
          </p>

          <h2>4. Segurança e dados sensíveis</h2>
          <p>
            Dados sensíveis (como CPF e CTPS) são armazenados de forma
            criptografada (pgcrypto). O acesso a documentos ocorre exclusivamente
            por meio de URLs assinadas com expiração máxima de 1 hora. O acesso aos
            dados é regido por políticas de segurança em nível de linha (RLS).
          </p>

          <h2>5. Compartilhamento</h2>
          <p>
            Não comercializamos dados pessoais. O compartilhamento ocorre apenas
            quando necessário ao cumprimento de obrigação legal, ordem judicial ou
            à prestação do serviço contratado.
          </p>

          <h2>6. Direitos do titular</h2>
          <p>
            Você pode solicitar confirmação de tratamento, acesso, correção,
            anonimização, portabilidade e eliminação dos seus dados. Clientes
            cadastrados podem exercer o <strong>direito ao esquecimento</strong>{" "}
            diretamente pela área do cliente, com a exclusão da conta e dos dados
            de acesso vinculados.
          </p>

          <h2>7. Retenção</h2>
          <p>
            Os dados são mantidos pelo tempo necessário às finalidades informadas e
            ao cumprimento de obrigações legais e regulatórias da advocacia.
          </p>

          <h2>8. Contato do encarregado</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de
            dados, entre em contato pelo e-mail {cfg.email}.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
