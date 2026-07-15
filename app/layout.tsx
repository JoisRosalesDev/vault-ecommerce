import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/organisms/toast-container";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VAULT | Comercio Electrónico Premium",
  description: "Explore la colección exclusiva de VAULT. Diseños innovadores, catálogo de alta calidad y pasarela de pago segura.",
  keywords: ["e-commerce", "comercio electrónico", "premium", "diseño exclusivo", "compras en línea"],
  authors: [{ name: "VAULT Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500/20 selection:text-amber-200">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
