"use client";

import { useEffect, useState } from "react";
import { ProductGrid, Product } from "../organisms/product-grid";
import { CartDrawer } from "../organisms/cart-drawer";
import { ShoppingBag, Lock, ShieldCheck, ChevronRight, Sun, Moon } from "lucide-react";
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Reactive cart selections
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    setHasHydrated(true);
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Brand Filtering
  const filteredProducts = initialProducts.filter((product) => {
    if (activeFilter === "all") return true;
    return (product.brand || "").toLowerCase() === activeFilter;
  });

  const slide = slidesData[currentSlide];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-sans select-none transition-colors duration-200">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-neutral-950 border-b-4 border-neutral-950 dark:border-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-widest text-neutral-950 dark:text-white uppercase font-sans">
              VAULT
            </span>
            <span className="h-6 w-1 bg-neutral-950 dark:bg-white" />
            <span className="text-[10px] font-mono tracking-widest text-amber-500 dark:text-amber-400 font-bold uppercase">
              HYPERCARS
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 border-2 border-neutral-950 dark:border-white bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer flex items-center justify-center rounded-none"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 sm:px-5 py-2.5 border-2 border-neutral-950 dark:border-white bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2 cursor-pointer font-mono font-bold text-xs uppercase rounded-none"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Carrito</span>
              {hasHydrated && itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center border-2 border-neutral-950 dark:border-white bg-amber-500 px-1 text-[10px] font-black text-neutral-950 font-mono">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION (Non-pinned, responsive Brutalist split design) */}
      <section className="w-full border-b-4 border-neutral-950 dark:border-white grid grid-cols-1 lg:grid-cols-12 min-h-[500px] bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
        {/* Left Side Info Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-16 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 relative overflow-hidden transition-colors duration-200">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="relative z-10 animate-brutal-pop">
            <span className="inline-block border-2 border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-[10px] font-black tracking-widest px-3.5 py-1 uppercase mb-6 rounded-none">
              {slide.brand}
            </span>
            <span className="block text-[10px] font-mono font-bold tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-2 uppercase">
              {slide.subtitle}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none text-neutral-950 dark:text-white break-words font-sans">
              {slide.title}
            </h1>
            <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl font-sans leading-relaxed">
              {slide.description}
            </p>
            
            <button
              onClick={() => {
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 px-7 py-3.5 border-2 border-neutral-950 dark:border-white bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100 font-mono font-black text-xs uppercase tracking-widest cursor-pointer flex items-center gap-2"
            >
              <span>Ver Colección</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Selector Tabs at the bottom */}
          <div className="mt-12 relative z-10 border-2 border-neutral-950 dark:border-white flex">
            {slidesData.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`flex-1 py-4 text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase border-r-2 last:border-r-0 border-neutral-950 dark:border-white transition-all duration-150 cursor-pointer ${
                  idx === currentSlide
                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950"
                    : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {item.brand}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Image Panel */}
        <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-neutral-950 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-100"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Stark overlay instead of smooth gradient */}
          <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
        </div>
      </section>

      {/* CATALOG SECTION */}
      <main className="bg-white dark:bg-neutral-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-brutal-pop">
          <section id="catalog-section" className="scroll-mt-24">
            {/* Brutalist Brand Filters */}
            <div className="flex flex-wrap gap-3 mb-12 border-b-4 border-dashed border-neutral-200 dark:border-white/20 pb-8">
              {["all", "ferrari", "lamborghini", "bugatti"].map((filter) => {
                const isActive = activeFilter === filter;
                const label = filter === "all" ? "Todos" : filter.charAt(0).toUpperCase() + filter.slice(1);
                
                const getFilterStyles = () => {
                  if (!isActive) {
                    return "border-neutral-950 dark:border-white bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]";
                  }
                  switch (filter) {
                    case "ferrari":
                      return "border-neutral-950 dark:border-white bg-red-600 text-white shadow-none translate-x-[2px] translate-y-[2px]";
                    case "lamborghini":
                      return "border-neutral-950 dark:border-white bg-amber-500 text-neutral-950 shadow-none translate-x-[2px] translate-y-[2px]";
                    case "bugatti":
                      return "border-neutral-950 dark:border-white bg-blue-600 text-white shadow-none translate-x-[2px] translate-y-[2px]";
                    default:
                      return "border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-none translate-x-[2px] translate-y-[2px]";
                  }
                };

                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-5 py-2.5 border-2 text-xs font-mono font-black tracking-widest uppercase transition-all duration-100 cursor-pointer ${getFilterStyles()}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-10">
              <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-neutral-950 dark:text-white font-sans">
                Hiperdeportivos Disponibles
              </h2>
              <span className="font-mono text-xs text-neutral-550 dark:text-neutral-400 font-bold uppercase tracking-widest">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Modelo" : "Modelos"}
              </span>
            </div>

            {/* Product Grid */}
            <div>
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <div className="py-24 text-center border-4 border-dashed border-neutral-200 dark:border-white/20 bg-neutral-50 dark:bg-neutral-900">
                  <p className="text-neutral-500 dark:text-neutral-450 font-mono text-sm uppercase tracking-widest">No hay hiperdeportivos disponibles en esta categoría.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>&copy; 2026 VAULT HYPERCARS. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Privacidad</a>
            <Link
              href="/admin/products"
              className="hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 border-2 border-neutral-950 dark:border-white px-3.5 py-1.5 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:shadow-none flex items-center gap-1.5"
              aria-label="Acceso Administración"
            >
              <Lock className="w-3.5 h-3.5" />
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
