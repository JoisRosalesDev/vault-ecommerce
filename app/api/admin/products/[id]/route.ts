import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, stock, images, isActive } = body;

    // Validate inputs
    if (price !== undefined && Number(price) < 0) {
      return NextResponse.json(
        { error: "El precio debe ser un número positivo." },
        { status: 400 }
      );
    }

    if (stock !== undefined && Number(stock) < 0) {
      return NextResponse.json(
        { error: "El stock debe ser un número positivo." },
        { status: 400 }
      );
    }

    // Perform updates
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(images && { images }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Invalidate static cache
    revalidatePath("/");

    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto en la base de datos." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if the product has been ordered in the past to prevent database constraint issues
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Soft delete: Set isActive = false to preserve client purchase history
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      // Invalidate static cache
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        message: "Producto desactivado correctamente para conservar el historial de ventas.",
        product,
      });
    }

    // Hard delete: Product was never ordered, safe to clean up
    await prisma.product.delete({
      where: { id },
    });

    // Invalidate static cache
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Producto eliminado definitivamente de la base de datos.",
    });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el producto de la base de datos." },
      { status: 500 }
    );
  }
}
