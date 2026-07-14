import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Always use the direct standard postgres:// protocol for the native pg client
const connectionString = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database and setting up system records...");
  
  // Clear any existing products (User requested empty catalog by default)
  await prisma.product.deleteMany({});
  console.log("Products table cleared.");

  // Seed default admin user if not exists (so admin panel is accessible)
  const defaultUserId = "00000000-0000-0000-0000-000000000000";
  await prisma.user.upsert({
    where: { id: defaultUserId },
    update: {},
    create: {
      id: defaultUserId,
      email: "admin@vault.com",
      role: "ADMIN",
    },
  });
  console.log("System admin record validated.");
  
  console.log("Database initialized. Ready for admin CRUD operations.");
}

main()
  .catch((e) => {
    console.error("Error during database initialization:", e);
  })
  .finally(async () => {
    await pool.end();
  });
