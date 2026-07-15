"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { useToastStore } from "@/hooks/useToastStore";
import { Plus, Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    currency: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);
  const [isAdded, setIsAdded] = useState(false);

  // Brand detection based on database brand field
  const getBrandDetails = () => {
    const activeBrand = (product.brand || "").toLowerCase();
    if (activeBrand === "ferrari") {
      return {
        id: "ferrari" as const,
        name: "Ferrari",
        cardBorder: "border-2 border-red-600/40 hover:border-red-600 hover:shadow-[6px_6px_0px_0px_#E01E26]",
        btnBg: "bg-red-600 hover:bg-red-500 text-white border border-white shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        btnAddedBg: "bg-emerald-600 text-white border border-white shadow-none",
      };
    }
    if (activeBrand === "lamborghini" || activeBrand === "lambo") {
      return {
        id: "lamborghini" as const,
        name: "Lamborghini",
        cardBorder: "border-2 border-amber-500/40 hover:border-amber-500 hover:shadow-[6px_6px_0px_0px_#FFCC00]",
        btnBg: "bg-amber-500 hover:bg-amber-400 text-neutral-950 border border-white/80 shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        btnAddedBg: "bg-emerald-500 text-neutral-950 border border-white/80 shadow-none",
      };
    }
    if (activeBrand === "bugatti") {
      return {
        id: "bugatti" as const,
        name: "Bugatti",
        cardBorder: "border-2 border-blue-600/40 hover:border-blue-600 hover:shadow-[6px_6px_0px_0px_#0A46E4]",
        btnBg: "bg-blue-600 hover:bg-blue-500 text-white border border-white shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        btnAddedBg: "bg-emerald-600 text-white border border-white shadow-none",
      };
    }
    return {
      id: "default" as const,
      name: "",
      cardBorder: "border-2 border-white/20 hover:border-white hover:shadow-[6px_6px_0px_0px_#ffffff]",
      btnBg: "bg-neutral-800 hover:bg-neutral-700 text-white border border-white shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      btnAddedBg: "bg-emerald-600 text-white border border-white shadow-none",
    };
  };

  const brand = getBrandDetails();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;

    addItem(product);
    setIsAdded(true);

    // Trigger Toast Notification
    addToast({
      message: `¡${product.name} añadido al carrito!`,
      description: brand.name ? `Reserva confirmada en el catálogo ${brand.name}` : "Añadido a tus selecciones premium",
      brand: brand.id,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const imageSrc = product.images[0] || "/placeholder-product.jpg";

  return (
    <div className={`group relative bg-neutral-900 rounded-none p-5 transition-all duration-300 flex flex-col justify-between h-[440px] ${brand.cardBorder}`}>
      {/* Product Image Area */}
      <div className="relative w-full h-[220px] rounded-none overflow-hidden bg-neutral-950 border border-white/10 group-hover:border-white/30 transition-colors duration-300">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-2 border-neutral-700 px-4 py-1.5 rounded-none bg-neutral-950">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase group-hover:text-amber-400 transition-colors duration-300 font-sans">
              {product.name}
            </h3>
            {brand.name && (
              <span className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 border border-white bg-white text-neutral-950 uppercase shrink-0">
                {brand.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-dashed border-white/10">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
              Precio
            </span>
            <span className="text-lg font-black text-white font-mono mt-0.5">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className={`flex items-center justify-center p-3 rounded-none transition-all duration-200 cursor-pointer ${
                isAdded ? brand.btnAddedBg : brand.btnBg
              }`}
              aria-label="Agregar al carrito"
            >
              {isAdded ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[3]" />
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center p-3 rounded-none bg-neutral-800 border-2 border-white/10 text-neutral-600 cursor-not-allowed"
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
