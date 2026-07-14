import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "La configuración de almacenamiento no está disponible en el servidor." },
        { status: 500 }
      );
    }

    // Initialize Supabase client with Service Role Key (bypasses RLS for secure uploads)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const uniqueFileName = `product-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(uniqueFileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage admin upload error:", error);
      return NextResponse.json(
        { error: `Error en almacenamiento: ${error.message}` },
        { status: 500 }
      );
    }

    // Get Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Failed to upload image on server:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el archivo en el servidor." },
      { status: 500 }
    );
  }
}
