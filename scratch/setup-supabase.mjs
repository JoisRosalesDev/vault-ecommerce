import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env");
  process.exit(1);
}

// 1. Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Initialize Prisma Client using direct connection
function getConnectionString() {
  const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DIRECT_DATABASE_URL or DATABASE_URL in .env");
    process.exit(1);
  }
  return url;
}

const connectionString = getConnectionString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- 1. CONFIGURING SUPABASE STORAGE BUCKET ---");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    process.exit(1);
  }

  const bucketName = "product-images";
  const hasBucket = buckets.some((b) => b.name === bucketName);

  if (!hasBucket) {
    console.log(`Bucket '${bucketName}' does not exist. Creating it...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });

    if (createError) {
      console.error("Failed to create bucket:", createError);
      process.exit(1);
    }
    console.log(`Bucket '${bucketName}' created as PUBLIC.`);
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
    const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
      public: true,
    });
    if (updateError) {
      console.warn("Failed to ensure bucket is public:", updateError);
    } else {
      console.log(`Bucket '${bucketName}' verified as PUBLIC.`);
    }
  }

  console.log("\n--- 2. CREATING DATABASE RLS POLICIES FOR STORAGE ---");
  try {
    // Enable RLS on storage.objects just in case
    await prisma.$executeRawUnsafe(`
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    `);
    console.log("Row Level Security enabled on storage.objects.");

    // Create policy for Select/Read
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Allow public read of product-images" ON storage.objects;
      CREATE POLICY "Allow public read of product-images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'product-images');
    `);
    console.log("SELECT policy created for 'product-images'.");

    // Create policy for Insert/Upload
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Allow public upload to product-images" ON storage.objects;
      CREATE POLICY "Allow public upload to product-images"
      ON storage.objects FOR INSERT
      TO public
      WITH CHECK (bucket_id = 'product-images');
    `);
    console.log("INSERT policy created for 'product-images'.");

    // Create policy for Update/Delete
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Allow public delete/update of product-images" ON storage.objects;
      CREATE POLICY "Allow public delete/update of product-images"
      ON storage.objects FOR ALL
      TO public
      USING (bucket_id = 'product-images')
      WITH CHECK (bucket_id = 'product-images');
    `);
    console.log("ALL (UPDATE/DELETE) policy created for 'product-images'.");

    console.log("\nSupabase Storage and RLS Policies configured successfully!");
  } catch (sqlError) {
    console.error("Failed to execute database SQL policies:", sqlError);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
