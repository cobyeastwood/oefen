import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@oefen/database';
import { Pool } from 'pg';

type PrismaContext = {
  prisma: PrismaClient;
  pool: Pool;
};

const globalForPrisma = globalThis as unknown as {
  prismaContext: PrismaContext | undefined;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
}

async function createPrismaContext(): Promise<PrismaContext> {
  const pool = createPool();

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });

  return { prisma, pool };
}

export async function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prismaContext) {
    globalForPrisma.prismaContext = await createPrismaContext();
  }

  return globalForPrisma.prismaContext.prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (!globalForPrisma.prismaContext) {
    return;
  }

  await globalForPrisma.prismaContext.prisma.$disconnect();
  await globalForPrisma.prismaContext.pool.end();
  globalForPrisma.prismaContext = undefined;
}
