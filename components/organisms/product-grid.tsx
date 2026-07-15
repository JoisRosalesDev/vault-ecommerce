"use client";

import { Skeleton } from "@/components/atoms/skeleton";
import { ProductCard } from "@/components/molecules/product-card";

export interface Product {
  id: string;
  name: string;
  brand: string;
  currency: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-none bg-neutral-900 border-2 border-white/20 p-5 h-[440px] flex flex-col justify-between"
          >
            {/* Image Skeleton */}
            <Skeleton className="w-full h-[220px] rounded-none" />

            {/* Content Skeletons */}
            <div className="mt-5 flex-grow flex flex-col justify-between">
              <div>
                <Skeleton className="w-3/4 h-5 rounded-none" />
                <Skeleton className="w-full h-4 mt-2 rounded-none" />
                <Skeleton className="w-5/6 h-4 mt-1 rounded-none" />
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-dashed border-white/10">
                <div className="flex flex-col gap-1">
                  <Skeleton className="w-10 h-3 rounded-none" />
                  <Skeleton className="w-20 h-5 rounded-none" />
                </div>
                <Skeleton className="w-10 h-10 rounded-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-neutral-400 font-medium">
          No se encontraron productos disponibles.
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Por favor, vuelve a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
