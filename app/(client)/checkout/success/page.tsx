"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  // Clear local cart storage upon successful checkout redirect
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="relative z-10 max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Animated Check Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
          <CheckCircle className="h-8 w-8 stroke-[2]" />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
          Transacción Exitosa
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white leading-tight">
          ¡Gracias por su Compra!
        </h1>
        <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
          Su pedido ha sido procesado de manera correcta. Recibirá un correo electrónico de confirmación con los detalles de su orden en breve.
        </p>

        <div className="mt-8 pt-6 border-t border-neutral-800/50 flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-semibold transition-all transform active:scale-[0.98] shadow-md shadow-neutral-950/30"
          >
            Volver al Catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
