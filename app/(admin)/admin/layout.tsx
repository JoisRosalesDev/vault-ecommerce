"use client";

import { supabase } from "@/lib/supabase";
import { LogOut, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col transition-colors duration-200">
      {/* Admin Sidebar & Header Shell */}
      <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-black tracking-[0.2em] text-white uppercase flex items-center font-heading">
              VAULT <span className="text-[8px] font-mono font-black tracking-[0.25em] border border-white/20 bg-white/5 text-white px-2.5 py-0.5 ml-2 uppercase rounded-full">ADMIN</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-black uppercase text-neutral-450">
              <Link
                href="/admin/products"
                className="hover:text-white transition-colors flex items-center gap-2 font-mono text-[10px] tracking-wider"
              >
                <FolderKanban className="w-4 h-4 stroke-[1.5]" />
                Productos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-white/10 bg-white/5 text-neutral-350 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 transition-all duration-300 font-mono font-bold text-xs uppercase cursor-pointer disabled:opacity-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.5)]"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
              <span className="hidden sm:inline">{isLoggingOut ? "Cerrando..." : "Salir"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
}
