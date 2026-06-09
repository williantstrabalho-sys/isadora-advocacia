import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      // Preenche a largura da tela (sem cap de 1200px), com folga lateral
      // crescente em telas maiores. O conteúdo de texto tem max-w próprios.
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2.5rem",
        xl: "3.5rem",
        "2xl": "5rem",
      },
      screens: {
        "2xl": "100%",
      },
    },
    extend: {
      colors: {
        // Paleta da marca — derivada do logo
        brand: {
          bg: "#0a0a0a",
          surface: "#111111",
          elevated: "#1a1a1a",
          accent: "#d4691e",
          "accent-hover": "#e8842b",
          text: "#f0f0f0",
          muted: "#8a8a8a",
          border: "#2a2a2a",
        },
        // Tokens shadcn mapeados para a marca
        border: "#2a2a2a",
        input: "#2a2a2a",
        ring: "#d4691e",
        background: "#0a0a0a",
        foreground: "#f0f0f0",
        primary: {
          DEFAULT: "#d4691e",
          foreground: "#0a0a0a",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#f0f0f0",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#f0f0f0",
        },
        muted: {
          DEFAULT: "#111111",
          foreground: "#8a8a8a",
        },
        accent: {
          DEFAULT: "#1a1a1a",
          foreground: "#f0f0f0",
        },
        popover: {
          DEFAULT: "#111111",
          foreground: "#f0f0f0",
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#f0f0f0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
