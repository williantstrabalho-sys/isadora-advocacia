import { redirect } from "next/navigation";

// O editor de conteúdo passou a ser um subtópico de "Configurações".
export default function ConteudoRedirect() {
  redirect("/dashboard/configuracoes");
}
