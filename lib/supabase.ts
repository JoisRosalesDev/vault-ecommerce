import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Gracefully handle missing variables during build environments
  console.warn("Supabase public environment variables are missing.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

/**
 * Uploads a file to the product images Supabase storage bucket.
 * Bucket name defaults to 'product-images' based on project specification.
 */
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

    // Retrieve and return the public URL for the uploaded asset
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Supabase image upload failed:", err);
    return null;
  }
}
