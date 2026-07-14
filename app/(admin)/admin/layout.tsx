"use client";

import { supabase } from "@/lib/supabase";
import { LogOut, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // Clear Supabase session cookies or session state
      await supabase.auth.signOut();
      
      // Clear cookie explicitly for middleware edge protection
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      router.push("/admin/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Admin Sidebar & Header Shell */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-widest text-white font-mono uppercase">
              VAULT <span className="text-[10px] font-normal tracking-wide text-neutral-500">ADMIN</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-mono text-neutral-400">
              <Link
                href="/admin/products"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4" />
                Productos
              </Link>
            </nav>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-neutral-400 transition-all font-mono text-xs disabled:opacity-50"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Cerrando..." : "Salir"}</span>
          </button>
        </div>
      </header>

      {/* Main dashboard content area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
}
