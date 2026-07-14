import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing upload with public anon client...");
  // Create a tiny dummy image buffer
  const dummyContent = typeof Blob !== 'undefined' 
    ? new Blob(["dummy image data"], { type: "image/png" })
    : Buffer.from("dummy image data");
    
  const path = `test-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(path, dummyContent, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: true
    });

  if (error) {
    console.error("Upload failed with error:", error);
    process.exit(1);
  } else {
    console.log("Upload succeeded! File data:", data);
    
    // Clean up test file
    console.log("Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from("product-images")
      .remove([path]);
      
    if (deleteError) {
      console.warn("Failed to delete test file:", deleteError);
    } else {
      console.log("Cleaned up successfully.");
    }
  }
}

test().catch(console.error);
