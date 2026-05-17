import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    html: {
      backgroundColor: "#F5F3FF",
    },
    body: {
      backgroundColor: "#F5F3FF",
      color: "#1E1B4B",
      margin: "0 auto",
    },
    "html, body": {
      fontFamily: "'Inter', sans-serif",
    },
    "code, pre, kbd, samp": {
      fontFamily: "'Roboto Mono', monospace",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body: { value: "'Inter', sans-serif" },
        mono: { value: "'Roboto Mono', monospace" },
      },
      colors: {
        brand: {
          50: { value: "#EEF2FF" },
          100: { value: "#E0E7FF" },
          200: { value: "#C7D2FE" },
          300: { value: "#A5B4FC" },
          400: { value: "#818CF8" },
          500: { value: "#6366F1" },
          600: { value: "#4F46E5" },
          700: { value: "#4338CA" },
          800: { value: "#3730A3" },
          900: { value: "#312E81" },
        },
      },
    },
    breakpoints: {
      sm: "550px",
      md: "900px",
      lg: "1200px",
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
