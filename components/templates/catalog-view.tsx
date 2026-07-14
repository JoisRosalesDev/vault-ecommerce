"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ProductGrid, Product } from "../organisms/product-grid";
import { CartDrawer } from "../organisms/cart-drawer";
import { ShoppingBag, Lock, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";

interface CatalogViewProps {
  initialProducts: Product[];
}

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "ferrari" | "lamborghini" | "bugatti">("all");

  const containerRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef(0);

  // Reactive cart selections
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
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

      // 3. Staggered reveal of Catalog Header and Filters
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

  // GSAP Cart Button Micro-interaction on add-to-cart
  useEffect(() => {
    if (hasHydrated && itemCount > prevCountRef.current) {
      if (cartButtonRef.current) {
        gsap.fromTo(
          cartButtonRef.current,
          { scale: 0.9, rotate: -4 },
          {
            scale: 1.12,
            rotate: 4,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "back.out(2.5)",
          }
        );
      }
    }
    prevCountRef.current = itemCount;
  }, [itemCount, hasHydrated]);

  // Brand Filtering
  const filteredProducts = initialProducts.filter((product) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "lamborghini") {
      return product.name.toLowerCase().includes("lamborghini") || product.name.toLowerCase().includes("lambo");
    }
    return product.name.toLowerCase().includes(activeFilter);
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col justify-between bg-neutral-950 relative overflow-hidden font-sans select-none"
    >
      {/* Premium ambient top-glow gradient (Ferrari, Lamborghini, Bugatti brand lights merged) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,204,0,0.05),rgba(224,30,38,0.03),rgba(10,70,228,0.03),transparent)] pointer-events-none -z-10 filter blur-3xl" />
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none -z-20" />

      {/* Header / Navbar */}
      <header className="animate-nav sticky top-0 z-40 w-full border-b border-white/5 bg-neutral-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-[0.25em] text-white font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
              VAULT
            </span>
            <span className="hidden sm:inline-block h-4 w-px bg-white/10" />
            <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest text-amber-500 uppercase">
              Hypercars
            </span>
          </div>

          <button
            ref={cartButtonRef}
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.04] hover:border-amber-500/30 text-neutral-300 hover:text-white transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {hasHydrated && itemCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-neutral-950 font-mono">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        {/* Hero Section */}
        <section className="mb-20 max-w-3xl">
          <div className="animate-hero-item inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-mono mb-6 tracking-wider uppercase font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Colección de Élite
          </div>
          <h1 className="animate-hero-item text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-450 leading-[0.95] font-heading uppercase">
            VAULT HYPERCARS
          </h1>
          <p className="animate-hero-item mt-6 text-sm sm:text-base text-neutral-400 leading-relaxed font-sans max-w-2xl">
            Acceso exclusivo al sanctum sanctorum de la ingeniería automotriz. Una selección de hiperdeportivos de alta gama de <span className="text-red-400 font-semibold">Ferrari</span>, <span className="text-amber-400 font-semibold">Lamborghini</span> y <span className="text-blue-400 font-semibold">Bugatti</span>. Rendimiento extremo, legados inigualables y diseño de vanguardia.
          </p>
        </section>

        {/* Brand Filters */}
        <section className="mb-12">
          <div className="animate-catalog-item flex flex-wrap gap-2.5 mb-10 border-b border-white/5 pb-6">
            {["all", "ferrari", "lamborghini", "bugatti"].map((filter) => {
              const isActive = activeFilter === filter;
              const label = filter === "all" ? "Todos" : filter.charAt(0).toUpperCase() + filter.slice(1);
              
              const getFilterStyles = () => {
                if (!isActive) {
                  return "border-white/5 bg-white/[0.01] text-neutral-400 hover:text-white hover:border-white/10 hover:bg-white/[0.03]";
                }
                switch (filter) {
                  case "ferrari":
                    return "border-red-500/40 bg-red-950/20 text-red-400 shadow-[0_0_15px_rgba(224,30,38,0.12)] font-semibold";
                  case "lamborghini":
                    return "border-amber-500/40 bg-amber-950/20 text-amber-400 shadow-[0_0_15px_rgba(255,204,0,0.12)] font-semibold";
                  case "bugatti":
                    return "border-blue-500/40 bg-blue-950/20 text-blue-400 shadow-[0_0_15px_rgba(10,70,228,0.12)] font-semibold";
                  default:
                    return "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] font-semibold";
                }
              };

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-mono tracking-widest uppercase transition-all duration-300 transform active:scale-95 cursor-pointer ${getFilterStyles()}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Catalog Section Header */}
          <div className="animate-catalog-item flex items-center justify-between mb-8">
            <h2 className="text-lg font-medium text-neutral-100 tracking-tight font-heading">
              Hiperdeportivos Disponibles
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Modelo" : "Modelos"}
            </span>
          </div>

          {/* Product Grid */}
          <div className="animate-catalog-item">
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="py-20 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
                <p className="text-neutral-400 text-sm">No hay hiperdeportivos disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md py-8 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
            <span>&copy; 2026 VAULT HYPERCARS. Todos los derechos reservados.</span>
          </div>
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
