import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Renova a sessão do Supabase a cada request e aplica proteção de rotas.
 * Chamado pelo middleware raiz (src/middleware.ts).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPortal = path.startsWith("/portal");
  const isDashboard = path.startsWith("/dashboard");

  // Rotas protegidas exigem sessão
  if ((isPortal || isDashboard) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Controle de acesso por papel
  if (user && (isPortal || isDashboard)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const isStaff = role === "advogada" || role === "associado";

    // Cliente não acessa dashboard; staff (advogada/associado) sim.
    if (isDashboard && !isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }
    // Só cliente acessa o portal.
    if (isPortal && role !== "cliente") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Associado: acesso limitado dentro do dashboard.
    if (isDashboard && role === "associado") {
      const permitido = [
        "/dashboard/processos",
        "/dashboard/agenda",
        "/dashboard/documentos",
        "/dashboard/mensagens",
      ];
      const liberado = permitido.some(
        (p) => path === p || path.startsWith(p + "/")
      );
      if (!liberado) {
        // qualquer outra rota do dashboard (incl. a visão geral e áreas de
        // admin) leva o associado para a sua lista de processos.
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/processos";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
