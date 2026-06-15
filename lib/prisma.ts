import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

function createPrismaClient() {
  // Resolve the file: URL to an absolute path for the adapter.
  const filePath = dbUrl.startsWith("file:")
    ? dbUrl.slice("file:".length)
    : dbUrl;
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);

  const adapter = new PrismaBetterSqlite3({ url: absolute });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
