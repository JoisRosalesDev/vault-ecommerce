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
        cardBorder: "hover:border-red-600/40 hover:shadow-[0_0_25px_rgba(224,30,38,0.15)]",
        btnBg: "bg-red-600 hover:bg-red-500 text-white border border-white/10 hover:border-white/20",
        btnAddedBg: "bg-emerald-600 text-white border border-white/10",
      };
    }
    if (activeBrand === "lamborghini" || activeBrand === "lambo") {
      return {
        id: "lamborghini" as const,
        name: "Lamborghini",
        cardBorder: "hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
        btnBg: "bg-amber-500 hover:bg-amber-400 text-neutral-950 border border-white/10 hover:border-white/20",
        btnAddedBg: "bg-emerald-500 text-neutral-950 border border-white/10",
      };
    }
    if (activeBrand === "bugatti") {
      return {
        id: "bugatti" as const,
        name: "Bugatti",
        cardBorder: "hover:border-blue-600/40 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]",
        btnBg: "bg-blue-600 hover:bg-blue-500 text-white border border-white/10 hover:border-white/20",
        btnAddedBg: "bg-emerald-600 text-white border border-white/10",
      };
    }
    return {
      id: "default" as const,
      name: "",
      cardBorder: "hover:border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]",
      btnBg: "bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 hover:border-white/20",
      btnAddedBg: "bg-emerald-600 text-white border border-white/10",
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
    <div className={`group relative bg-neutral-950 rounded-2xl p-5 border border-white/5 shadow-[4px_4px_12px_rgba(0,0,0,0.5),-2px_-2px_12px_rgba(255,255,255,0.01)] transition-all duration-300 flex flex-col justify-between h-[440px] ${brand.cardBorder}`}>
      {/* Product Image Area */}
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 group-hover:border-white/10 transition-colors duration-300">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-white/10 px-4 py-1.5 rounded-full bg-neutral-950">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase group-hover:text-amber-400 transition-colors duration-300 font-heading">
              {product.name}
            </h3>
            {brand.name && (
              <span className="text-[8px] font-mono font-bold tracking-widest px-2.5 py-1 border border-white/10 bg-white/5 text-neutral-300 uppercase shrink-0 rounded-full">
                {brand.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-dashed border-white/10">
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
              className={`flex items-center justify-center p-3 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.02)] active:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.6)] ${
                isAdded ? brand.btnAddedBg : brand.btnBg
              }`}
              aria-label="Agregar al carrito"
            >
              {isAdded ? (
                <Check className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center p-3 rounded-full bg-neutral-900 border border-white/5 text-neutral-600 cursor-not-allowed"
              aria-label="Agotado"
            >
              <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
