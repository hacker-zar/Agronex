import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

function landingRoute() {
  const rewrite = (request, _response, next) => {
    if (request.url === "/landing" || request.url?.startsWith("/landing?")) {
      request.url = request.url.replace(/^\/landing(?=\?|$)/, "/landing/");
    }
    next();
  };

  return {
    name: "agronex-landing-route",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [landingRoute(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(projectRoot, "index.html"),
        landing: resolve(projectRoot, "landing/index.html"),
      },
    },
  },
});
