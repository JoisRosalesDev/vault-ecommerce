import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/products";

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        const userEmail = data.session.user.email;
        const userId = data.session.user.id;

        // Retrieve designated admin email from environmental config (defaulting to system fallback)
        const adminEmail = process.env.ADMIN_EMAIL || "admin@vault.com";
        const isSystemAdmin = userEmail?.toLowerCase() === adminEmail.toLowerCase();
        const role = isSystemAdmin ? "ADMIN" : "CLIENT";

        // Sync or register user with their designated privileges in database
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            email: userEmail || "",
            role: role,
          },
          create: {
            id: userId,
            email: userEmail || "",
            role: role,
          },
        });

        const response = NextResponse.redirect(`${origin}${next}`);

        // Set secure HTTP-only cookie for edge middleware authentication check
        response.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: data.session.expires_in,
        });

        return response;
      }
    } catch (err) {
      console.error("Auth callback exception:", err);
    }
  }

  // Redirect to login page with clear error indicator
  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
