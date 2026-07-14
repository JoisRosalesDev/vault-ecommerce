import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Map Decimal database type to javascript number
    const formatted = products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    return NextResponse.json(
      { error: "Error al recuperar los productos del catálogo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, images } = body;

    // Strict validation
    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para el producto." },
        { status: 400 }
      );
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return NextResponse.json(
        { error: "El precio y el stock deben ser números positivos." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images: images || [],
        isActive: true,
      },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el producto en la base de datos." },
      { status: 500 }
    );
  }
}
