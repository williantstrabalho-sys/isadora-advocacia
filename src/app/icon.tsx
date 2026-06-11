import { ImageResponse } from "next/og";

export const runtime = "edge";

// Favicon gerado dinamicamente (monograma "IG" na cor de marca).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#d4691e",
          fontSize: 40,
          fontWeight: 700,
          fontFamily: "serif",
          borderRadius: 12,
        }}
      >
        IG
      </div>
    ),
    { ...size }
  );
}
