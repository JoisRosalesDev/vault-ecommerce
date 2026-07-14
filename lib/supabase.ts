import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url.includes("[ref]") || url.includes("[PROJECT-REF]")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : "https://placeholder-url.supabase.co";
const finalAnonKey = (supabaseAnonKey && !supabaseAnonKey.includes("...")) ? supabaseAnonKey : "placeholder-anon-key";

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes("...")) {
  console.warn("Supabase public environment variables are missing or placeholders.");
}

export const supabase = createClient(finalUrl, finalAnonKey);

export async function uploadProductImage(file: File, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Supabase image upload failed:", err);
    return null;
  }
}
