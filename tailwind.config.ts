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
        // Paleta da marca — variáveis CSS (editáveis em runtime pelo tema).
        // Os valores padrão ficam em globals.css :root.
        brand: {
          bg: "rgb(var(--brand-bg) / <alpha-value>)",
          surface: "rgb(var(--brand-surface) / <alpha-value>)",
          elevated: "rgb(var(--brand-elevated) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--brand-accent-hover) / <alpha-value>)",
          text: "rgb(var(--brand-text) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",
          border: "rgb(var(--brand-border) / <alpha-value>)",
        },
        // Tokens shadcn mapeados para as mesmas variáveis da marca
        border: "rgb(var(--brand-border) / <alpha-value>)",
        input: "rgb(var(--brand-border) / <alpha-value>)",
        ring: "rgb(var(--brand-accent) / <alpha-value>)",
        background: "rgb(var(--brand-bg) / <alpha-value>)",
        foreground: "rgb(var(--brand-text) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--brand-accent) / <alpha-value>)",
          foreground: "rgb(var(--brand-bg) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--brand-elevated) / <alpha-value>)",
          foreground: "rgb(var(--brand-text) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#f0f0f0",
        },
        muted: {
          DEFAULT: "rgb(var(--brand-surface) / <alpha-value>)",
          foreground: "rgb(var(--brand-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--brand-elevated) / <alpha-value>)",
          foreground: "rgb(var(--brand-text) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--brand-surface) / <alpha-value>)",
          foreground: "rgb(var(--brand-text) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--brand-surface) / <alpha-value>)",
          foreground: "rgb(var(--brand-text) / <alpha-value>)",
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
