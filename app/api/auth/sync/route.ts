import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, id } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@vault.com";
    const isSystemAdmin = email.toLowerCase() === adminEmail.toLowerCase();
    const role = isSystemAdmin ? "ADMIN" : "CLIENT";

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email: email,
        role: role,
      },
      create: {
        id: id,
        email: email,
        role: role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Error al sincronizar el usuario." }, { status: 500 });
  }
}
