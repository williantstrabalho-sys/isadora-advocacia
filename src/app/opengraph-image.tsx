import { ImageResponse } from "next/og";
import { ESCRITORIO } from "@/lib/constants";

export const runtime = "edge";

// Imagem de pré-visualização ao compartilhar o link (WhatsApp, redes, Google).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${ESCRITORIO.nomeCurto} — Direito Trabalhista em Brasília/DF`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#f0f0f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1a1a1a",
              color: "#d4691e",
              fontSize: 40,
              fontWeight: 700,
              borderRadius: 14,
              fontFamily: "serif",
            }}
          >
            IG
          </div>
          <span style={{ fontSize: 26, color: "#8a8a8a" }}>
            {ESCRITORIO.advogada} · {ESCRITORIO.oab}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0 18px",
            marginTop: 48,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 980,
          }}
        >
          <span>Defesa técnica dos seus</span>
          <span style={{ color: "#d4691e" }}>direitos trabalhistas</span>
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#8a8a8a" }}>
          Advocacia especializada em Direito Trabalhista · Brasília/DF
        </div>
      </div>
    ),
    { ...size }
  );
}
