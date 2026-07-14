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
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-500"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl h-full transition-transform duration-500 transform translate-x-0">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-400" />
              Su Carrito
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message Toast / Banner inside drawer */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items Area */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {!hasHydrated ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-sm font-mono text-neutral-500">Cargando carrito...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-600 stroke-[1.5] mb-4" />
                <p className="text-base text-neutral-400 font-medium">Su carrito está vacío</p>
                <p className="text-sm text-neutral-500 mt-1">Explore el catálogo para añadir artículos.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex py-4 border-b border-neutral-800/50 last:border-0 items-start justify-between"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex-shrink-0">
                      <Image
                        src={item.images[0] || "/placeholder-product.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="ml-4 flex-1 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-sm font-medium text-white line-clamp-1 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 mt-1">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-neutral-800 bg-neutral-950 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium text-center min-w-[24px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors disabled:text-neutral-700 disabled:cursor-not-allowed"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer checkout area */}
          {hasHydrated && items.length > 0 && (
            <div className="border-t border-neutral-800 px-6 py-6 bg-neutral-900/60 backdrop-blur-xs">
              <div className="flex justify-between items-start text-base font-medium text-white mb-6">
                <span className="text-neutral-400 font-normal mt-1">Subtotal</span>
                <div className="flex flex-col items-end gap-1.5">
                  {getSubtotals().map(({ currency, amount }) => (
                    <span key={currency} className="font-mono text-lg font-bold text-white">
                      {formatPrice(amount, currency)}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl bg-neutral-100 text-neutral-950 font-semibold hover:bg-white transition-all transform active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-xl shadow-neutral-950/50"
              >
                {isCheckoutLoading ? "Procesando pago..." : "Proceder al Pago"}
              </button>
              <div className="mt-4 text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-neutral-500 hover:text-neutral-300 font-mono transition-colors"
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
