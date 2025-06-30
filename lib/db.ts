import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Modify DATABASE_URL to disable prepared statements in production
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || ''
  
  if (process.env.NODE_ENV === 'production') {
    // Add parameters to disable prepared statements for PostgreSQL in serverless
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}pgbouncer=true&prepared_statements=false`
  }
  
  return baseUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 