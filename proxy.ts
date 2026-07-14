import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible in-memory rate-limiter cache
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS = 10; // Max 10 logins per minute

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate-limiting for auth callback endpoints (G1 requirement)
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

  // 2. Protect Admin Dashboard (Admin vs. Client RBAC)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Verify Supabase session access token cookie
    const accessToken = request.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      // Redirect unauthorized users to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // A full cryptographic validation of the JWT payload would be performed here
    // to check user.app_metadata.role === 'ADMIN'.
  }

  return NextResponse.next();
}

// Map the proxy matchers
export const config = {
  matcher: ["/admin/:path*", "/api/auth/callback"],
};
