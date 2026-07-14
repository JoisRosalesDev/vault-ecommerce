"use client";

import { useToastStore, Toast } from "@/hooks/useToastStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { gsap } from "gsap";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const getBrandStyles = () => {
    switch (toast.brand) {
      case "ferrari":
        return {
          glow: "shadow-[0_0_20px_rgba(224,30,38,0.15)] border-red-500/30 bg-red-950/20 backdrop-blur-md",
          indicator: "bg-red-500",
          text: "text-red-400",
        };
      case "lamborghini":
        return {
          glow: "shadow-[0_0_20px_rgba(255,204,0,0.15)] border-amber-500/30 bg-amber-950/20 backdrop-blur-md",
          indicator: "bg-amber-500",
          text: "text-amber-400",
        };
      case "bugatti":
        return {
          glow: "shadow-[0_0_20px_rgba(10,70,228,0.15)] border-blue-500/30 bg-blue-950/20 backdrop-blur-md",
          indicator: "bg-blue-500",
          text: "text-blue-400",
        };
      default:
        return {
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.08)] border-white/10 bg-neutral-900/90 backdrop-blur-md",
          indicator: "bg-amber-500",
          text: "text-amber-500",
        };
    }
  };

  const brandStyles = getBrandStyles();

  useEffect(() => {
    gsap.fromTo(
      `#toast-${toast.id}`,
      { x: 120, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, [toast.id]);

  const handleDismiss = () => {
    gsap.to(`#toast-${toast.id}`, {
      x: 120,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: onDismiss,
    });
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-300 font-sans ${brandStyles.glow}`}
    >
      <div className="flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${brandStyles.indicator} animate-pulse`} />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-neutral-100 tracking-tight leading-snug">
            {toast.message}
          </p>
          <button
            onClick={handleDismiss}
            className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {toast.description && (
          <p className="mt-1 text-[10px] text-neutral-400 font-mono tracking-tight leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
    </div>
  );
}
