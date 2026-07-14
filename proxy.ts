import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW = 60 * 1000;
const MAX_AUTH_REQUESTS = 10;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/callback")) {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (rateData && now < rateData.resetTime) {
      rateData.count += 1;
      if (rateData.count > MAX_AUTH_REQUESTS) {
        return new NextResponse(
          JSON.stringify({
            error: "Demasiados intentos de autenticación. Por favor, inténtelo de nuevo más tarde.",
            code: "AUTH_RATE_LIMIT",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW });
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const accessToken = request.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/callback"],
};
