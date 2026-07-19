import { useCartStore } from "@/hooks/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { items, removeItem, updateQuantity } = useCartStore();

  // Guard hydration mismatch in Next.js Server Side Rendering
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    setErrorMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // Strict 10 seconds timeout

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Ocurrió un error inesperado al procesar el pago."
        );
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Checkout submission failed:", error);

      const err = error as Error;
      if (err.name === "AbortError") {
        setErrorMsg(
          "Estamos procesando un alto volumen de solicitudes. Por favor, inténtalo de nuevo en unos segundos."
        );
      } else {
        setErrorMsg(
          err.message ||
            "No se pudo conectar con el servidor de pagos. Inténtelo de nuevo en unos segundos."
        );
      }
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Group items by currency for subtotal calculations
  const getSubtotals = () => {
    const subtotals: Record<string, number> = {};
    items.forEach((item) => {
      const cur = item.currency || "USD";
      subtotals[cur] = (subtotals[cur] || 0) + item.price * item.quantity;
    });
    return Object.entries(subtotals).map(([currency, amount]) => ({
      currency,
      amount,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-neutral-950/90 backdrop-blur-xl border-l border-white/10 text-white flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-500 transform translate-x-0">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-neutral-900/40 backdrop-blur-md">
            <h2 className="text-xl font-black tracking-wider uppercase flex items-center gap-2 font-heading text-white">
              <ShoppingBag className="w-5 h-5 text-red-500 stroke-[1.5]" />
              Su Carrito
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.5)]"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Error Message Toast / Banner inside drawer */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-4 border border-red-500/20 bg-red-950/30 rounded-xl text-red-400 text-xs font-mono font-bold leading-relaxed flex items-start gap-3 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 stroke-[1.5]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items Area */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {!hasHydrated ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-xs font-mono font-bold uppercase text-neutral-500">Cargando carrito...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-600 stroke-[1.5] mb-4" />
                <p className="text-base text-neutral-450 font-black uppercase font-heading">Su carrito está vacío</p>
                <p className="text-xs text-neutral-500 mt-1.5 font-mono">Explore el catálogo para añadir artículos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const activeBrand = (item.brand || "").toLowerCase();
                  const brandBorder = activeBrand === "ferrari" 
                    ? "hover:border-red-500/20" 
                    : activeBrand === "lamborghini" || activeBrand === "lambo" 
                    ? "hover:border-amber-500/20" 
                    : activeBrand === "bugatti" 
                    ? "hover:border-blue-500/20" 
                    : "hover:border-white/15";

                  return (
                    <div
                      key={item.id}
                      className={`flex p-4 rounded-xl border border-white/5 bg-white/2.5 items-start justify-between relative overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.3)] transition-all duration-300 ${brandBorder}`}
                    >
                      {/* Item Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                        <Image
                          src={item.images[0] || "/placeholder-product.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="ml-4 flex-1 flex flex-col justify-between h-full min-w-0">
                        <div>
                          <h3 className="text-sm font-black text-white uppercase line-clamp-1 leading-none font-heading">
                            {item.name}
                          </h3>
                          <p className="text-xs font-mono font-bold text-neutral-400 mt-1">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex items-center gap-3 mt-3.5">
                          <div className="flex items-center border border-white/10 bg-neutral-900/60 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3 stroke-[1.5]" />
                            </button>
                            <span className="px-3.5 text-xs font-mono font-black text-center min-w-[24px] text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3 stroke-[1.5]" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-red-500 p-2 rounded-full border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer checkout area */}
          {hasHydrated && items.length > 0 && (
            <div className="border-t border-white/10 px-6 py-6 bg-neutral-900/50 backdrop-blur-md">
              <div className="flex justify-between items-start text-base font-black text-white mb-6 uppercase">
                <span className="text-neutral-400 mt-1 font-heading tracking-widest text-xs">Subtotal</span>
                <div className="flex flex-col items-end gap-1.5">
                  {getSubtotals().map(({ currency, amount }) => (
                    <span key={currency} className="font-mono text-lg font-black text-white">
                      {formatPrice(amount, currency)}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full flex items-center justify-center px-6 py-4 rounded-full border border-white/10 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCheckoutLoading ? "Procesando pago..." : "Proceder al Pago"}
              </button>
              <div className="mt-4 text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-white font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  o Continuar Comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
