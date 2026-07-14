import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = "USD"): string {
  const cleanCurrency = (currency || "USD").toUpperCase();
  if (cleanCurrency === "CLP") {
    // CLP doesn't use decimals, uses dots for thousands
    return `$${Math.round(price).toLocaleString("es-CL")}`;
  }
  if (cleanCurrency === "EUR") {
    // EUR uses dots for thousands and commas for decimals
    return `€${price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  // Default USD format: commas for thousands and dots for decimals
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
