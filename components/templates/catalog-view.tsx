"use client";

import { useEffect, useState } from "react";
import { ProductGrid, Product } from "../organisms/product-grid";
import { CartDrawer } from "../organisms/cart-drawer";
import { ShoppingBag, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CatalogViewProps {
  initialProducts: Product[];
}

const slidesData = [
  {
    brand: "ferrari",
    title: "Ferrari SF90 Stradale",
    subtitle: "RACING DNA & PERFORMANCE EXTREMA",
    description: "La sinergia perfecta entre un motor V8 biturbo y tres motores eléctricos con 1000 CV de potencia pura.",
    image: "/images/ferrari-sf90.jpg",
  },
  {
    brand: "lamborghini",
    title: "Lambo Revuelto",
    subtitle: "DISEÑO HEXAGONAL Y MOTOR V12",
    description: "El primer superdeportivo híbrido enchufable V12 HPEV de la firma italiana, redefiniendo la potencia con 1015 CV.",
    image: "/images/lambo-revuelto.jpg",
  },
  {
    brand: "bugatti",
    title: "Bugatti Chiron",
    subtitle: "MOLSHEIM KINGS & PURE SPEED",
    description: "Una obra de arte de la ingeniería automotriz impulsada por un motor W16 de 8.0 litros y 1500 CV de potencia inimaginable.",
    image: "/images/bugatti-chiron.jpg",
  },
];

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "ferrari" | "lamborghini" | "bugatti">("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reactive cart selections
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    setHasHydrated(true);
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial load animation for navbar
    gsap.fromTo(
      ".navbar-animate",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    // Parallax scroll effect on hero image
    const trigger = ScrollTrigger.create({
      trigger: "#hero-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        gsap.set(".hero-image-parallax", {
          y: self.progress * 120,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    // Animate text elements with stagger
    gsap.fromTo(
      ".hero-text-animate",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
    );

    // Animate the image scale/fade
    gsap.fromTo(
      ".hero-image-animate",
      { scale: 1.12, opacity: 0.6 },
      { scale: 1.0, opacity: 1, duration: 1.0, ease: "power3.out" }
    );
  }, [currentSlide, hasHydrated]);

  // Brand Filtering
  const filteredProducts = initialProducts.filter((product) => {
    if (activeFilter === "all") return true;
    return (product.brand || "").toLowerCase() === activeFilter;
  });

  const slide = slidesData[currentSlide];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-sans select-none transition-colors duration-200">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-neutral-950/80 backdrop-blur-md border-b border-white/10 transition-all duration-300 navbar-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-[0.2em] text-white uppercase font-heading">
              VAULT
            </span>
            <span className="h-6 w-px bg-white/20" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-red-500 font-extrabold uppercase">
              HYPERCARS
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 sm:px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-neutral-350 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer font-mono font-bold text-xs uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.5)]"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span className="hidden sm:inline">Carrito</span>
              {hasHydrated && itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-red-600 to-amber-500 px-1 text-[9px] font-black text-white font-mono shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION (Dashboard design) */}
      <section id="hero-section" className="w-full border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 min-h-[600px] bg-neutral-950 relative overflow-hidden">
        {/* Glow backgrounds for premium hypercar cockpit ambient lighting */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        {/* Left Side Info Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-neutral-950/60 backdrop-blur-md relative overflow-hidden transition-colors duration-200 z-10">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="hero-text-animate inline-block border border-white/10 bg-white/5 backdrop-blur-sm text-neutral-300 font-mono text-[9px] font-black tracking-[0.2em] px-3.5 py-1.5 uppercase mb-6 rounded-full">
              {slide.brand}
            </span>
            <span className="hero-text-animate block text-[10px] font-mono font-extrabold tracking-[0.3em] text-red-500/80 mb-3 uppercase">
              {slide.subtitle}
            </span>
            <h1 className="hero-text-animate text-4xl sm:text-5xl lg:text-7xl font-black tracking-wide uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500 font-heading break-words">
              {slide.title}
            </h1>
            <p className="hero-text-animate mt-6 text-sm text-neutral-400 max-w-xl font-sans leading-relaxed">
              {slide.description}
            </p>
            
            <button
              onClick={() => {
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hero-text-animate mt-8 px-8 py-4 rounded-full border border-white/10 bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest cursor-pointer flex items-center gap-2 w-fit"
            >
              <span>Ver Colección</span>
              <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Slide dot indicators at the bottom */}
          <div className="mt-12 relative z-10 flex gap-2 w-fit">
            {slidesData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? "w-8 bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side Image Panel */}
        <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-full bg-neutral-950 overflow-hidden">
          {/* Dashboard reflection overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent z-10 pointer-events-none lg:block hidden" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none lg:hidden block" />
          
          <div
            className="hero-image-animate hero-image-parallax absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Subtle color grading overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-blue-600/5 mix-blend-color-dodge z-10 pointer-events-none" />
        </div>
      </section>

      {/* CATALOG SECTION */}
      <main className="bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <section id="catalog-section" className="scroll-mt-24">
            {/* Premium Brand Filters */}
            <div className="flex flex-wrap gap-3 mb-12 border-b border-white/10 pb-8">
              {["all", "ferrari", "lamborghini", "bugatti"].map((filter) => {
                const isActive = activeFilter === filter;
                const label = filter === "all" ? "Todos" : filter.charAt(0).toUpperCase() + filter.slice(1);
                
                const getFilterStyles = () => {
                  if (!isActive) {
                    return "border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/25 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.3)]";
                  }
                  switch (filter) {
                    case "ferrari":
                      return "border border-red-500/30 bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                    case "lamborghini":
                      return "border border-amber-500/30 bg-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                    case "bugatti":
                      return "border border-blue-500/30 bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]";
                    default:
                      return "border border-white/20 bg-white text-neutral-950 shadow-[0_0_15px_rgba(255,255,255,0.1)]";
                  }
                };

                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as "all" | "ferrari" | "lamborghini" | "bugatti")}
                    className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${getFilterStyles()}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-10">
              <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-wide text-white font-heading">
                Hiperdeportivos Disponibles
              </h2>
              <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Modelo" : "Modelos"}
              </span>
            </div>

            {/* Product Grid */}
            <div>
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <div className="py-24 text-center border border-dashed border-white/10 bg-neutral-900/40 backdrop-blur-md rounded-2xl">
                  <p className="text-neutral-400 font-mono text-sm uppercase tracking-widest">No hay hiperdeportivos disponibles en esta categoría.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-950 border-t border-white/10 py-12 relative overflow-hidden">
        {/* Subtle footer cockpit ambient light */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-red-600/5 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono font-bold text-neutral-500 tracking-widest relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
            <span>&copy; 2026 VAULT HYPERCARS. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <Link
              href="/admin/products"
              className="hover:bg-white/10 hover:text-white border border-white/10 px-4 py-2 bg-white/5 text-neutral-300 transition-all duration-300 rounded-full active:scale-95 flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.5)] cursor-pointer"
              aria-label="Acceso Administración"
            >
              <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
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
