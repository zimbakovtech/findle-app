import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    html: {
      backgroundColor: "#F8FAFC",
    },
    body: {
      backgroundColor: "#F8FAFC",
      color: "#0F172A",
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
        heading: { value: "'Plus Jakarta Sans', 'Inter', sans-serif" },
        body: { value: "'Inter', sans-serif" },
        mono: { value: "'Roboto Mono', monospace" },
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
