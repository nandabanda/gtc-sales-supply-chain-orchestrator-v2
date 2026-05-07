import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a1628",
        navy: "#0f2038",
        "navy-deep": "#081222",
        panel: "#132a45",
        ivory: "#f4f0e8",
        muted: "#9eb0c8",
        electric: "#1a9fff",
        cyan: "#1a9fff",
        emerald: "#3dd68c",
        amber: "#e8b84a",
        danger: "#f0718c",
      },
      boxShadow: {
        glow: "0 0 48px rgba(26,159,255,.22)",
        soft: "0 28px 90px rgba(0,0,0,.35)",
        insetLine: "inset 0 1px 0 rgba(244,240,232,.06)",
      },
    },
  },
  plugins: [],
};
export default config;
