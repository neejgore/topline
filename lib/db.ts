import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced DATABASE_URL configuration for Vercel serverless
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || ''
  
  if (process.env.NODE_ENV === 'production') {
    // Vercel-optimized connection parameters
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}pgbouncer=true&prepared_statements=false&connection_limit=1&pool_timeout=0`
  }
  
  return baseUrl
}

// Create Prisma client with Vercel serverless optimizations
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    // Optimize for serverless
    ...(process.env.NODE_ENV === 'production' && {
      errorFormat: 'minimal',
    }),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Only cache in development to avoid memory leaks in serverless
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Ensure proper cleanup in serverless environment
if (process.env.NODE_ENV === 'production') {
  // Set connection timeout for serverless
  prisma.$connect().catch(() => {
    // Ignore connection errors during initialization
  })
} 