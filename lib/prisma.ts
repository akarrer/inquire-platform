import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeonHttp(sql)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
