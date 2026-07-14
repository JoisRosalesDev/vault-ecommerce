"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { useToastStore } from "@/hooks/useToastStore";
import { Plus, Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap } from "gsap";

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
  const addToast = useToastStore((state) => state.addToast);
  const [isAdded, setIsAdded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Brand detection helper
  const getBrandDetails = () => {
    const lowerName = product.name.toLowerCase();
    if (lowerName.includes("ferrari")) {
      return {
        id: "ferrari" as const,
        name: "Ferrari",
        hoverBorder: "hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(224,30,38,0.12)]",
        glow: "bg-red-500/10",
        btnBg: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/10 hover:shadow-[0_0_15px_rgba(224,30,38,0.4)]",
        btnAddedBg: "bg-emerald-600 text-white shadow-emerald-600/10",
      };
    }
    if (lowerName.includes("lamborghini") || lowerName.includes("lambo")) {
      return {
        id: "lamborghini" as const,
        name: "Lamborghini",
        hoverBorder: "hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(255,204,0,0.12)]",
        glow: "bg-amber-500/10",
        btnBg: "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/10 hover:shadow-[0_0_15px_rgba(255,204,0,0.4)]",
        btnAddedBg: "bg-emerald-500 text-neutral-950 shadow-emerald-500/10",
      };
    }
    if (lowerName.includes("bugatti")) {
      return {
        id: "bugatti" as const,
        name: "Bugatti",
        hoverBorder: "hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(10,70,228,0.12)]",
        glow: "bg-blue-500/10",
        btnBg: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/10 hover:shadow-[0_0_15px_rgba(10,70,228,0.4)]",
        btnAddedBg: "bg-emerald-600 text-white shadow-emerald-600/10",
      };
    }
    return {
      id: "default" as const,
      name: "",
      hoverBorder: "hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]",
      glow: "bg-amber-500/5",
      btnBg: "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]",
      btnAddedBg: "bg-emerald-500 text-neutral-950 shadow-emerald-500/10",
    };
  };

  const brand = getBrandDetails();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;

    addItem(product);
    setIsAdded(true);

    // GSAP button pop animation
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.8 },
        { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: "back.out(2)" }
      );
    }

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
    <div className={`group relative overflow-hidden rounded-2xl bg-white/[0.015] backdrop-blur-md border border-white/5 p-4 transition-all duration-500 flex flex-col justify-between h-[420px] shadow-2xl ${brand.hoverBorder}`}>
      {/* Decorative ambient gradient overlay inside card */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 ${brand.glow}`} />

      {/* Product Image Area */}
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-neutral-950/90 border border-white/5">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-103"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-neutral-950/85 flex items-center justify-center backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-800 px-3 py-1 rounded-full bg-neutral-900/60">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-medium text-neutral-100 tracking-tight leading-snug group-hover:text-white transition-colors duration-300 font-heading">
              {product.name}
            </h3>
            {brand.name && (
              <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.02] text-neutral-400">
                {brand.name.toUpperCase()}
              </span>
            )}
          </div>
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
              ref={buttonRef}
              onClick={handleAdd}
              className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
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
