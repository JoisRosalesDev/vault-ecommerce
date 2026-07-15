"use client";

import { supabase } from "@/lib/supabase";
import { LogOut, FolderKanban, Sun, Moon } from "lucide-react";
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white flex flex-col transition-colors duration-200">
      {/* Admin Sidebar & Header Shell */}
      <header className="sticky top-0 z-40 w-full border-b-4 border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-black tracking-widest text-neutral-950 dark:text-white uppercase flex items-center">
              VAULT <span className="text-[9px] font-mono font-black tracking-wider border border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-2 py-0.5 ml-2 uppercase rounded-none">ADMIN</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-black uppercase text-neutral-500 dark:text-neutral-400">
              <Link
                href="/admin/products"
                className="hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 stroke-[2.5]" />
                Productos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 border-2 border-neutral-950 dark:border-white bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer flex items-center justify-center rounded-none"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white hover:bg-red-650 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:shadow-none font-mono font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
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
