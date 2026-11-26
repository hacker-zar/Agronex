import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { verifyTurnstileToken } from "./server/turnstile.js";

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

function turnstileDevRoute(secretKey) {
  return {
    name: "agronex-turnstile-dev-route",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split("?")[0] !== "/api/verify-turnstile") return next();
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("Allow", "POST");
          response.end(JSON.stringify({ success: false }));
          return;
        }
        const origin = request.headers.origin;
        const host = request.headers.host;
        let sameOrigin = true;
        try { if (origin) sameOrigin = new URL(origin).host === host; } catch { sameOrigin = false; }
        if (!sameOrigin) {
          response.statusCode = 403;
          response.end(JSON.stringify({ success: false }));
          return;
        }
        let body = "";
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 8192) {
            response.statusCode = 413;
            response.end(JSON.stringify({ success: false }));
            return;
          }
        }
        let token = "";
        try { token = JSON.parse(body).token || ""; } catch { /* rejected below */ }
        const result = await verifyTurnstileToken(token, secretKey);
        response.statusCode = result ? 200 : 400;
        response.end(JSON.stringify({ success: result }));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const secretKey = env.TURNSTILE_SECRET_KEY || (mode === "development" ? "1x0000000000000000000000000000000AA" : "");
  return {
    plugins: [landingRoute(), turnstileDevRoute(secretKey), react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          app: resolve(projectRoot, "index.html"),
          landing: resolve(projectRoot, "landing/index.html"),
        },
      },
    },
  };
});
