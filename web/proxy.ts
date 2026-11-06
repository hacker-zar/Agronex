import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { loginPath } from "@/lib/auth/redirect";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  if (!request.nextUrl.pathname.startsWith("/app")) return response;
  if (user) return response;
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const redirect = NextResponse.redirect(new URL(loginPath(destination), request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
