import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL variable is not set. Using local placeholder connection string.");
    return "postgresql://postgres:postgres@localhost:5432/postgres";
  }
  if (url.startsWith("prisma+postgres://")) {
    return "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
  }
  if (url.includes("[ref]") || url.includes("[password]") || url.includes("[region]")) {
    console.warn("DATABASE_URL contains placeholder values. Using local placeholder connection string.");
    return "postgresql://postgres:postgres@localhost:5432/postgres";
  }
  return url;
}

if (process.env.NODE_ENV === "production") {
  const connectionString = getConnectionString();
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const connectionString = getConnectionString();
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export { prisma };
