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
    title: "Ferrari SF90 Stradale",
    subtitle: "RACING DNA & PERFORMANCE EXTREMA",
    description: "La sinergia perfecta entre un motor V8 biturbo y tres motores eléctricos con 1000 CV de potencia pura.",
    image: "/images/ferrari-sf90.jpg",
    color: "#E01E26",
    accentColor: "rgba(224,30,38,0.2)",
    alignment: "items-start text-left",
    titleClass: "font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-white",
    subtitleClass: "text-red-500 font-mono tracking-[0.4em] font-semibold text-xs",
    descClass: "text-neutral-350 max-w-lg mt-3 text-sm font-sans leading-relaxed",
    glowClass: "bg-red-600/10 shadow-[0_0_80px_rgba(224,30,38,0.15)]",
    pattern: "ferrari-grid",
  },
  {
    brand: "lamborghini",
    title: "Lambo Revuelto",
    subtitle: "DISEÑO HEXAGONAL Y MOTOR V12",
    description: "El primer superdeportivo híbrido enchufable V12 HPEV de la firma italiana, redefiniendo la potencia con 1015 CV.",
    image: "/images/lambo-revuelto.jpg",
    color: "#FFCC00",
    accentColor: "rgba(255,204,0,0.2)",
    alignment: "items-end text-right ml-auto",
    titleClass: "font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-l from-amber-400 via-yellow-500 to-white uppercase",
    subtitleClass: "text-amber-500 font-mono tracking-[0.45em] font-semibold text-xs",
    descClass: "text-neutral-350 max-w-lg mt-3 text-sm font-sans leading-relaxed ml-auto",
    glowClass: "bg-amber-600/10 shadow-[0_0_80px_rgba(255,204,0,0.15)]",
    pattern: "lambo-hex",
  },
  {
    brand: "bugatti",
    title: "Bugatti Chiron",
    subtitle: "MOLSHEIM KINGS & PURE SPEED",
    description: "Una obra de arte de la ingeniería automotriz impulsada por un motor W16 de 8.0 litros y 1500 CV de potencia inimaginable.",
    image: "/images/bugatti-chiron.jpg",
    color: "#0A46E4",
    accentColor: "rgba(10,70,228,0.2)",
    alignment: "items-center text-center mx-auto",
    titleClass: "font-light tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-blue-300 font-serif font-semibold",
    subtitleClass: "text-blue-400 font-mono tracking-[0.5em] text-xs",
    descClass: "text-neutral-350 max-w-xl mt-3 text-sm font-sans leading-relaxed",
    glowClass: "bg-blue-600/10 shadow-[0_0_80px_rgba(10,70,228,0.15)]",
    pattern: "bugatti-concentric",
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

  // Helper to programmatically scroll to the correct height of the pinned section
  const scrollToSlide = (idx: number) => {
    const trigger = ScrollTrigger.getById("hero-scroll-trigger");
    if (!trigger) return;
    const start = trigger.start;
    const end = trigger.end;
    const targetScroll = start + (idx / 2) * (end - start);
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth"
    });
  };



  // Register GSAP ScrollTrigger and build the pinned, scroll-driven slideshow
  useEffect(() => {
    if (!hasHydrated) return;

    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      // 1. Entrance timeline
      const entranceTl = gsap.timeline();
      entranceTl.from(".animate-nav", {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: "power3.out",
      });

      entranceTl.from(
        ".animate-banner",
        {
          opacity: 0,
          scale: 0.98,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.4"
      );

      entranceTl.from(
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

      // 2. Scroll-driven pinned slideshow timeline
      const pinTl = gsap.timeline({
        scrollTrigger: {
          id: "hero-scroll-trigger",
          trigger: ".banner-container",
          start: "top top",
          end: "+=250%", // 2.5 viewports of scroll distance
          pin: true,
          scrub: 1, // Smooth scrubbing
          anticipatePin: 1,
          onUpdate: (self) => {
            // Update active dot index
            const progress = self.progress;
            let activeIdx = 0;
            if (progress > 0.65) {
              activeIdx = 2;
            } else if (progress > 0.3) {
              activeIdx = 1;
            } else {
              activeIdx = 0;
            }
            setCurrentSlide(activeIdx);
          }
        }
      });

      // --- ANIMATING TRANSITION 0 -> 1 (Ferrari -> Lamborghini) ---
      
      // Ferrari content fades out and slides up
      pinTl.to(".slide-content-0", {
        opacity: 0,
        y: -100,
        duration: 1,
        ease: "power1.inOut"
      }, 0);

      // Ferrari background image pans up slightly and scales down
      pinTl.to(".slide-bg-img-0", {
        yPercent: -15,
        scale: 0.95,
        duration: 1,
        ease: "none"
      }, 0);

      // Lamborghini wrapper sweeps in from the bottom
      pinTl.fromTo(".slide-wrapper-1", 
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "none" },
        0.1
      );

      // Lamborghini background image starts scaled up and pans down
      pinTl.fromTo(".slide-bg-img-1",
        { scale: 1.3, yPercent: 15 },
        { scale: 1.05, yPercent: 0, duration: 1.2, ease: "none" },
        0.1
      );

      // Lamborghini content fades in and slides up
      pinTl.fromTo(".slide-content-1",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        0.3
      );

      // --- ANIMATING TRANSITION 1 -> 2 (Lamborghini -> Bugatti) ---

      // Lamborghini content fades out and slides up
      pinTl.to(".slide-content-1", {
        opacity: 0,
        y: -100,
        duration: 1,
        ease: "power1.inOut"
      }, 1.5);

      // Lamborghini background image pans up slightly and scales down
      pinTl.to(".slide-bg-img-1", {
        yPercent: -15,
        scale: 0.95,
        duration: 1,
        ease: "none"
      }, 1.5);

      // Bugatti wrapper sweeps in from the bottom
      pinTl.fromTo(".slide-wrapper-2", 
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "none" },
        1.6
      );

      // Bugatti background image starts scaled up and pans down
      pinTl.fromTo(".slide-bg-img-2",
        { scale: 1.3, yPercent: 15 },
        { scale: 1.05, yPercent: 0, duration: 1.2, ease: "none" },
        1.6
      );

      // Bugatti content fades in and slides up
      pinTl.fromTo(".slide-content-2",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        1.8
      );

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
      className="min-h-screen bg-neutral-950 relative font-sans select-none"
    >
      {/* Premium ambient top-glow gradient (Ferrari, Lamborghini, Bugatti brand lights merged) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,204,0,0.04),rgba(224,30,38,0.02),rgba(10,70,228,0.02),transparent)] pointer-events-none -z-10 filter blur-3xl" />
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none -z-20" />

      {/* FULL-WIDTH VIEWPORT PARALLAX SLIDESHOW BANNER (No margins or borders) */}
      <section className="animate-banner banner-container relative w-full h-screen overflow-hidden bg-neutral-950 shadow-2xl">
        {/* Header / Navbar with Liquid Glass Effect (Inside the pinned hero container so it pins correctly) */}
        <header className="animate-nav absolute top-0 left-0 right-0 z-50 w-full bg-neutral-950/20 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
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

        <div className="absolute inset-0">
          {slidesData.map((slide, idx) => {
            return (
              <div
                key={slide.brand}
                className={`slide-wrapper slide-wrapper-${idx} absolute inset-0 overflow-hidden`}
                style={{
                  zIndex: 10 + idx,
                  clipPath: idx === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                }}
              >
                {/* Background Image with parallax layout */}
                <div className="absolute inset-0 overflow-hidden bg-black">
                  <div
                    className={`slide-bg-img slide-bg-img-${idx} w-full h-[120%] bg-cover bg-center`}
                    style={{ 
                      backgroundImage: `url(${slide.image})`,
                      transform: "translateY(-10%)"
                    }}
                  />
                  {/* Shadow Gradient Overlays for luxury text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/20 to-transparent z-10" />
                </div>

                {/* Brand-specific decorative pattern overlay */}
                {slide.brand === "ferrari" && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(224,30,38,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(224,30,38,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60 pointer-events-none z-10 mix-blend-overlay" />
                )}
                {slide.brand === "lamborghini" && (
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,204,0,0.03)_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-60 pointer-events-none z-10 mix-blend-overlay" />
                )}
                {slide.brand === "bugatti" && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,70,228,0.04)_1px,transparent_2px)] bg-[size:48px_48px] opacity-50 pointer-events-none z-10 mix-blend-overlay" />
                )}

                {/* Floating Content */}
                <div className="absolute inset-x-0 bottom-0 top-0 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-center pt-20 relative z-20">
                  {/* Ambient Glow */}
                  <div className={`absolute w-96 h-96 rounded-full filter blur-3xl opacity-40 pointer-events-none -z-10 slide-decor ${slide.glowClass}`} style={{ top: "30%", left: slide.brand === "lamborghini" ? "auto" : "10%", right: slide.brand === "lamborghini" ? "10%" : "auto" }} />

                  {/* Text block */}
                  <div className={`slide-content slide-content-${idx} max-w-2xl flex flex-col ${slide.brand === "lamborghini" ? "items-end text-right ml-auto" : slide.brand === "bugatti" ? "items-center text-center mx-auto" : "items-start text-left"}`}>
                    <span className={`slide-subtitle ${slide.subtitleClass} mb-4 block`}>
                      {slide.subtitle}
                    </span>
                    <h2 className="slide-title text-4xl sm:text-5xl md:text-7xl font-bold font-heading tracking-tight leading-none text-white select-none">
                      {slide.title}
                    </h2>
                    <p className={`slide-desc ${slide.descClass}`}>
                      {slide.description}
                    </p>
                    
                    {/* Brand Custom Action Button */}
                    <button
                      onClick={() => {
                        // Smooth scroll to catalog section
                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`slide-btn mt-8 px-7 py-3.5 rounded-xl border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                        slide.brand === "ferrari"
                          ? "bg-red-600 hover:bg-red-500 text-white border-red-600/30 hover:border-red-500/50 shadow-lg shadow-red-950/20"
                          : slide.brand === "lamborghini"
                          ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-500/30 hover:border-amber-400/50 shadow-lg shadow-amber-950/20"
                          : "bg-white/5 hover:bg-white/10 text-white border-white/15 hover:border-white/25 shadow-lg shadow-black/40"
                      }`}
                    >
                      <span>Ver Colección</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Indicator Controls */}
        <div className="absolute bottom-8 right-8 sm:right-12 z-30 flex gap-2">
          {slidesData.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => {
                scrollToSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Mostrar slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Main Catalog View with detailed brand-specific mesh gradient background */}
      <main className="catalog-main w-full bg-neutral-950 border-t border-white/5 py-16 md:py-24 relative z-20" style={{ background: 'linear-gradient(135deg, rgba(224,30,38,0.04) 0%, transparent 25%), linear-gradient(225deg, rgba(255,204,0,0.03) 0%, transparent 25%), linear-gradient(315deg, rgba(10,70,228,0.04) 0%, transparent 30%), radial-gradient(ellipse at 20% 50%, rgba(224,30,38,0.03), transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(255,204,0,0.025), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(10,70,228,0.035), transparent 50%), #0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
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
