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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-neutral-50 dark:bg-neutral-900 border-4 border-neutral-950 dark:border-white rounded-none p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center">
        {/* Keyhole icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-none bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-950 dark:border-white text-neutral-950 dark:text-white mb-6">
          <Lock className="h-6 w-6 stroke-[2.5]" />
        </div>

        <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 dark:text-neutral-400 font-bold">
          Acceso Privado
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight uppercase leading-none text-center font-sans">
          Administración VAULT
        </h1>
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center font-mono leading-relaxed max-w-[280px]">
          Inicie sesión con su cuenta autorizada para gestionar el catálogo.
        </p>

        {displayError && (
          <div className="w-full mt-6 p-4 rounded-none bg-red-600 border-2 border-neutral-950 dark:border-white text-white font-mono text-xs text-center leading-relaxed">
            {displayError}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black uppercase tracking-widest text-xs border-2 border-neutral-950 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
        >
          <LogIn className="w-5 h-5 stroke-[2.5]" />
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
