import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Documento } from "@/lib/types";

/**
 * Download seguro de documento.
 * A RLS de `documentos` garante que apenas a advogada ou o cliente dono
 * consigam ler a linha. Geramos então uma URL assinada com validade de 1h
 * (requisito LGPD) e redirecionamos.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: doc } = await supabase
    .from("documentos")
    .select("storage_path")
    .eq("id", params.id)
    .single<Pick<Documento, "storage_path">>();

  if (!doc) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 }
    );
  }

  const { data: signed, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(doc.storage_path, 3600); // 1 hora

  if (error || !signed) {
    return NextResponse.json(
      { error: "Falha ao gerar link" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
