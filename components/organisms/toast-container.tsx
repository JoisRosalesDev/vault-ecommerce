"use client";

import { useToastStore, Toast } from "@/hooks/useToastStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-4 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  const getBrandStyles = () => {
    switch (toast.brand) {
      case "ferrari":
        return {
          glow: "border border-red-500/20 bg-neutral-950/80 backdrop-blur-md text-white shadow-[0_0_20px_rgba(220,38,38,0.25)]",
          indicator: "bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.6)]",
          btnColor: "text-neutral-400 hover:text-white",
        };
      case "lamborghini":
        return {
          glow: "border border-amber-500/20 bg-neutral-950/80 backdrop-blur-md text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          indicator: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
          btnColor: "text-neutral-400 hover:text-white",
        };
      case "bugatti":
        return {
          glow: "border border-blue-500/20 bg-neutral-950/80 backdrop-blur-md text-white shadow-[0_0_20px_rgba(37,99,235,0.25)]",
          indicator: "bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]",
          btnColor: "text-neutral-400 hover:text-white",
        };
      default:
        return {
          glow: "border border-white/10 bg-neutral-950/80 backdrop-blur-md text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]",
          indicator: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]",
          btnColor: "text-neutral-400 hover:text-white",
        };
    }
  };

  const brandStyles = getBrandStyles();

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 font-sans ${
        visible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
      } ${brandStyles.glow}`}
    >
      <div className="flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${brandStyles.indicator} animate-pulse`} />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wider leading-snug font-heading">
            {toast.message}
          </p>
          <button
            onClick={handleDismiss}
            className={`${brandStyles.btnColor} transition-colors cursor-pointer`}
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
        {toast.description && (
          <p className="mt-1.5 text-[9px] font-mono tracking-tight leading-relaxed opacity-80">
            {toast.description}
          </p>
        )}
      </div>
    </div>
  );
}
