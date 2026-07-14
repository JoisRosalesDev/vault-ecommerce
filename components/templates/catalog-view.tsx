"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ProductGrid, Product } from "../organisms/product-grid";
import { CartDrawer } from "../organisms/cart-drawer";
import { ShoppingBag, Lock } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";

interface CatalogViewProps {
  initialProducts: Product[];
}

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const getItemCount = useCartStore((state) => state.getItemCount);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    // Run GSAP timeline entrance animations in a context
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Slide & Fade in the Navbar
      tl.from(".animate-nav", {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: "power3.out",
      });

      // 2. Animate Hero Header Section items in a stagger
      tl.from(
        ".animate-hero-item",
        {
          opacity: 0,
          y: 40,
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
        },
        "-=0.5"
      );

      // 3. Staggered reveal of Catalog Header and Product Cards
      tl.from(
        ".animate-catalog-item",
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col justify-between bg-neutral-950 relative overflow-hidden font-sans select-none"
    >
      {/* Premium ambient top-glow gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),rgba(0,0,0,0))] pointer-events-none -z-10" />
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-20" />

      {/* Header / Navbar Molecule */}
      <header className="animate-nav sticky top-0 z-45 w-full border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-widest text-white font-mono uppercase">
            VAULT
          </span>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-amber-500/30 text-neutral-350 hover:text-white transition-all transform active:scale-95 flex items-center gap-2"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {hasHydrated && getItemCount() > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-neutral-950 font-mono">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
        {/* Hero Section */}
        <section className="mb-20 max-w-2xl">
          <div className="animate-hero-item inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-200 text-[10px] font-mono mb-4 tracking-wider uppercase font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Edición Limitada
          </div>
          <h1 className="animate-hero-item text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-500 leading-none font-heading">
            VAULT
          </h1>
          <p className="animate-hero-item mt-6 text-sm sm:text-base text-neutral-400 leading-relaxed font-sans max-w-lg">
            Curaduría exclusiva de piezas de diseño contemporáneo. Colección digital de lujo con acabados únicos y materiales de la más alta calidad.
          </p>
        </section>

        {/* Catalog Section */}
        <section>
          <div className="animate-catalog-item flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h2 className="text-lg font-medium text-neutral-100 tracking-tight font-heading">
              Catálogo
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              {initialProducts.length} {initialProducts.length === 1 ? "Artículo" : "Artículos"}
            </span>
          </div>

          <div className="animate-catalog-item">
            <ProductGrid products={initialProducts} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md py-8 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-500">
          <span>&copy; 2026 VAULT E-commerce. Todos los derechos reservados.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">Términos</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacidad</a>
            <Link
              href="/admin/products"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 border border-white/5 hover:border-amber-500/25 px-2.5 py-1 rounded-lg bg-white/[0.01]"
              aria-label="Acceso Administración"
            >
              <Lock className="w-3 h-3 text-neutral-500 group-hover:text-amber-400" />
              <span>Portal Admin</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
