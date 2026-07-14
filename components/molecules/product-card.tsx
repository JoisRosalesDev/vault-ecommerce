"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const imageSrc = product.images[0] || "/placeholder-product.jpg";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/5 p-4 transition-all duration-500 hover:border-amber-500/30 hover:bg-white/[0.04] flex flex-col justify-between h-[420px] shadow-2xl hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]">
      {/* Decorative ambient gradient overlay inside card */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Product Image Area */}
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-neutral-950/80 border border-white/5">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-102"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-neutral-950/85 flex items-center justify-center backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-450 border border-neutral-800 px-3 py-1 rounded-full bg-neutral-900/60">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-medium text-neutral-100 tracking-tight leading-snug group-hover:text-white transition-colors duration-300 font-heading">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-medium">
              Precio
            </span>
            <span className="text-base font-bold text-neutral-100 font-mono mt-0.5">
              ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center p-3 rounded-xl bg-amber-500 text-neutral-950 transition-all duration-300 transform active:scale-95 shadow-md shadow-amber-500/10 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              aria-label="Agregar al carrito"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center p-3 rounded-xl bg-neutral-900 border border-white/5 text-neutral-600 cursor-not-allowed"
              aria-label="Agotado"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
