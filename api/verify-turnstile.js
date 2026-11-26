import { verifyTurnstileToken } from "../server/turnstile.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false });
  }

  const origin = request.headers.origin;
  const host = request.headers.host;
  let sameOrigin = true;
  try { if (origin) sameOrigin = new URL(origin).host === host; } catch { sameOrigin = false; }
  if (!sameOrigin) return response.status(403).json({ success: false });

  let body = request.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const token = body && typeof body === "object" ? body.token : "";
  const success = await verifyTurnstileToken(token, process.env.TURNSTILE_SECRET_KEY);
  return response.status(success ? 200 : 400).json({ success });
}
