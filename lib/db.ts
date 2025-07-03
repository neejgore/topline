import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// For backward compatibility, export the same client
export const db = supabase

// For development, use a single instance to avoid too many connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  // Set connection timeout for serverless
  prisma.$connect().catch(() => {
    // Ignore connection errors during initialization
  })
} 