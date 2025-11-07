import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function securityHeadersPlugin() {
  return {
    name: "security-headers",
    enforce: "post",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: { host: "0.0.0.0", port: 5173 },
});
