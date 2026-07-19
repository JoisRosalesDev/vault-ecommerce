"use client";

import { supabase } from "@/lib/supabase";
import { Lock, LogIn } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const router = useRouter();

  useEffect(() => {
    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        setIsLoading(true);
        try {
          // Set access token cookie for edge middleware protection
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;

          // Sync user session to local database and assign role
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: session.user.id,
              email: session.user.email,
            }),
          });

          router.push("/admin/products");
        } catch (err) {
          console.error("Auth sync handler failed:", err);
          setErrorMsg("Error al sincronizar la cuenta de administrador.");
          setIsLoading(false);
        }
      }
    });

    // Check if session already exists on load
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
        router.push("/admin/products");
      }
    };
    checkActiveSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/admin/login`;
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cockpit ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col items-center z-10">
        {/* Keyhole icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/5 border border-white/10 text-white mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <Lock className="h-6 w-6 stroke-[1.5]" />
        </div>

        <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-red-500 font-extrabold">
          Acceso Privado
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-wide uppercase leading-none text-center font-heading bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
          Administración VAULT
        </h1>
        <p className="mt-4 text-xs text-neutral-400 text-center font-mono leading-relaxed max-w-[280px]">
          Inicie sesión con su cuenta autorizada para gestionar el catálogo.
        </p>

        {displayError && (
          <div className="w-full mt-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 font-mono text-xs text-center leading-relaxed shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            {displayError}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-black uppercase tracking-widest text-xs border border-white/10 shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
        >
          <LogIn className="w-5 h-5 stroke-[1.5]" />
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
