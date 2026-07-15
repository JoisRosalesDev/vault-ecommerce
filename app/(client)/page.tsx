import { CatalogView } from "@/components/templates/catalog-view";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Cache on Vercel Edge for 1 hour (ISR)

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map Prisma Decimal to Javascript number
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function CatalogPage() {
  const products = await getProducts();

  return <CatalogView initialProducts={products} />;
}
