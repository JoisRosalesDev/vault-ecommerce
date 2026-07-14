import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function getConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL variable is not set. Using local placeholder connection string.");
    return "postgresql://postgres:postgres@localhost:5432/postgres";
  }
  if (url.startsWith("prisma+postgres://")) {
    return "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
  }
  return url;
}

const connectionString = getConnectionString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database and setting up system records...");
  
  // Clear any existing order items, orders, and products to prevent FK violations
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("Products and orders tables cleared.");

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

  // Seed premium luxury hypercars
  const hypercars = [
    {
      name: "Ferrari SF90 Stradale",
      brand: "ferrari",
      currency: "USD",
      description: "El primer híbrido enchufable de Ferrari, que ofrece 1000 CV de potencia combinada de un motor V8 turboalimentado y tres motores eléctricos. Una obra maestra de la aerodinámica y la ingeniería de Maranello.",
      price: 524000.00,
      stock: 5,
      images: ["/images/ferrari-sf90.jpg"],
      isActive: true,
    },
    {
      name: "Lamborghini Revuelto",
      brand: "lamborghini",
      currency: "CLP",
      description: "El primer superdeportivo híbrido V12 enchufable HPEV (High Performance Electrified Vehicle). Combina un motor V12 de aspiración natural con tres motores eléctricos para desatar 1015 CV.",
      price: 608000000.00,
      stock: 3,
      images: ["/images/lambo-revuelto.jpg"],
      isActive: true,
    },
    {
      name: "Bugatti Chiron Super Sport",
      brand: "bugatti",
      currency: "EUR",
      description: "La cúspide de la velocidad y el lujo. Impulsado por el legendario motor W16 de 8.0 litros con cuatro turbocompresores, que produce 1600 CV de pura potencia y confort inigualable.",
      price: 3900000.00,
      stock: 2,
      images: ["/images/bugatti-chiron.jpg"],
      isActive: true,
    }
  ];

  for (const car of hypercars) {
    await prisma.product.create({
      data: car,
    });
  }
  console.log("Premium hypercars seeded successfully.");
  
  console.log("Database initialized. Ready for admin CRUD operations.");
}

main()
  .catch((e) => {
    console.error("Error during database initialization:", e);
  })
  .finally(async () => {
    await pool.end();
  });
