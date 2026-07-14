"use client";

import { supabase } from "@/lib/supabase";
import { Lock, LogIn } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/api/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Login failed:", err);
      const error = err as Error;
      setErrorMsg(
        error.message || "Error al iniciar sesión con Google. Inténtelo de nuevo."
      );
      setIsLoading(false);
    }
  };

  let displayError = errorMsg;
  if (!displayError) {
    if (errorParam === "unauthorized") {
      displayError = "Acceso denegado. Esta cuenta de Google no está autorizada para administrar VAULT.";
    } else if (errorParam === "auth_failed") {
      displayError = "Fallo de autenticación. Por favor, intente iniciar sesión de nuevo.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col items-center">
        {/* Keyhole icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neutral-850 border border-neutral-800 text-neutral-300 mb-6">
          <Lock className="h-6 w-6" />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
          Acceso Privado
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white leading-tight text-center font-heading">
          Administración VAULT
        </h1>
        <p className="mt-2 text-xs text-neutral-400 text-center leading-relaxed max-w-[280px]">
          Inicie sesión con su cuenta autorizada para gestionar el catálogo.
        </p>

        {displayError && (
          <div className="w-full mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center leading-relaxed">
            {displayError}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-semibold transition-all transform active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-xl shadow-neutral-950/50"
        >
          <LogIn className="w-5 h-5" />
          {isLoading ? "Conectando..." : "Acceder con Google"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">
        Cargando portal...
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
