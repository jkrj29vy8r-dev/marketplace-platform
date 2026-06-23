import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "nexar_session";

// Edge-safe re-implementation of session verification (the server/auth
// module uses next/headers, which middleware can't import). Keep the
// JWT claims shape identical to server/auth/session.ts.
async function readRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await readRole(req);

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isClientRoute = pathname.startsWith("/dashboard/client");
  const isProviderRoute = pathname.startsWith("/dashboard/provider");

  const allowed =
    (isAdminRoute && role === "admin") ||
    (isClientRoute && (role === "client" || role === "admin")) ||
    (isProviderRoute && (role === "provider" || role === "admin"));

  if (!allowed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
