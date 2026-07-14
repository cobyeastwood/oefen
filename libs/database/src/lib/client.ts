import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getDatabaseUrl(): string {
  const directUrl = process.env['DIRECT_URL'];
  if (process.env['NODE_ENV'] !== 'production' && directUrl) {
    return directUrl;
  }

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return databaseUrl;
}

function createPool(): Pool {
  const databaseUrl = getDatabaseUrl();

  return new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost')
      ? undefined
      : { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5_000,
  });
}

export async function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prisma) {
    const pool = createPool();
    const adapter = new PrismaPg(pool);
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env['NODE_ENV'] === 'development' ? ['error'] : ['error'],
    });
  }

  return globalForPrisma.prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
  if (globalForPrisma.pool) {
    await globalForPrisma.pool.end();
    globalForPrisma.pool = undefined;
  }
}
