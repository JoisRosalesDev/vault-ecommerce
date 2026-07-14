"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductGrid, Product } from "../organisms/product-grid";
import { CartDrawer } from "../organisms/cart-drawer";
import { ShoppingBag, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";

interface CatalogViewProps {
  initialProducts: Product[];
}

const slidesData = [
  {
    brand: "ferrari",
    title: "Ferrari",
    subtitle: "Rendimiento Extremo y Legado F1",
    image: "/images/ferrari-sf90.jpg",
    color: "#EF4444",
  },
  {
    brand: "lamborghini",
    title: "Lamborghini",
    subtitle: "Diseño Audaz y Emoción V12",
    image: "/images/lambo-revuelto.jpg",
    color: "#F59E0B",
  },
  {
    brand: "bugatti",
    title: "Bugatti",
    subtitle: "La Cúspide de la Velocidad y el Lujo",
    image: "/images/bugatti-chiron.jpg",
    color: "#3B82F6",
  },
];

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "ferrari" | "lamborghini" | "bugatti">("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef(0);

  // Reactive cart selections
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Sync activeFilter with slider slide index
  useEffect(() => {
    if (activeFilter === "ferrari") {
      setCurrentSlide(0);
    } else if (activeFilter === "lamborghini") {
      setCurrentSlide(1);
    } else if (activeFilter === "bugatti") {
      setCurrentSlide(2);
    }
  }, [activeFilter]);

  // Auto-rotate slides only if "All" is active
  useEffect(() => {
    if (activeFilter !== "all" || !hasHydrated) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeFilter, hasHydrated]);

  // Register GSAP ScrollTrigger and run animations
  useEffect(() => {
    if (!hasHydrated) return;

    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Navbar entrance
      tl.from(".animate-nav", {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: "power3.out",
      });

      // 2. Banner entrance
      tl.from(
        ".animate-banner",
        {
          opacity: 0,
          scale: 0.98,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.4"
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

      // Scroll-based Parallax Effect for Background Images
      gsap.utils.toArray(".parallax-bg").forEach((bg: any) => {
        gsap.to(bg, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: ".banner-container",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // Scroll-based Parallax Effect for Content / Text
      gsap.to(".parallax-text", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".banner-container",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, [hasHydrated]);

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
    return (product.brand || "").toLowerCase() === activeFilter;
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col justify-between bg-neutral-950 relative overflow-hidden font-sans select-none"
    >
      {/* Premium ambient top-glow gradient (Ferrari, Lamborghini, Bugatti brand lights merged) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,204,0,0.04),rgba(224,30,38,0.02),rgba(10,70,228,0.02),transparent)] pointer-events-none -z-10 filter blur-3xl" />
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none -z-20" />

      {/* Header / Navbar */}
      <header className="animate-nav sticky top-0 z-40 w-full border-b border-white/5 bg-neutral-950/65 backdrop-blur-md">
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        
        {/* PARALLAX SLIDESHOW BANNER */}
        <section className="animate-banner banner-container relative w-full h-[55vh] sm:h-[65vh] rounded-3xl overflow-hidden border border-white/5 mb-16 shadow-2xl">
          <div className="absolute inset-0">
            {slidesData.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.brand}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {/* Background Image with parallax layout */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="parallax-bg w-full h-[120%] bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${slide.image})`,
                        transform: "translateY(-10%)"
                      }}
                    />
                    {/* Shadow Gradient Overlays for luxury text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/10 to-transparent" />
                  </div>

                  {/* Floating Content */}
                  <div className="absolute inset-x-0 bottom-0 top-0 max-w-5xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 relative z-20">
                    <div className="parallax-text max-w-xl">
                      <span
                        className="text-[10px] font-mono tracking-[0.35em] uppercase block mb-3.5 font-bold"
                        style={{ color: slide.color }}
                      >
                        {slide.subtitle}
                      </span>
                      <h2 className="text-5xl sm:text-6xl md:text-7xl font-black font-heading tracking-tight leading-none text-white uppercase select-none">
                        {slide.title}
                      </h2>
                      <button
                        onClick={() => {
                          setActiveFilter(slide.brand as any);
                          // Smooth scroll to catalog section
                          document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-6 px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-mono uppercase tracking-widest text-neutral-250 hover:text-white transition-all transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Ver Colección</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator Controls */}
          <div className="absolute bottom-6 right-8 z-30 flex gap-2">
            {slidesData.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setActiveFilter(slide.brand as any);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Mostrar slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog-section" className="scroll-mt-24">
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
