import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🔄 Starting database schema migration...')

    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Execute raw SQL to create tables if they don't exist
    console.log('🏗️  Creating database schema...')
    
    // Create tables in the correct order (considering foreign keys)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'SUBSCRIBER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "color" TEXT NOT NULL DEFAULT '#3B82F6'
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "sources" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "url" TEXT NOT NULL,
        "rssUrl" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastChecked" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "content" TEXT,
        "sourceUrl" TEXT NOT NULL,
        "sourceName" TEXT NOT NULL,
        "imageUrl" TEXT,
        "whyItMatters" TEXT,
        "talkTrack" TEXT,
        "category" TEXT NOT NULL DEFAULT 'NEWS',
        "vertical" TEXT,
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "publishedAt" TIMESTAMP(3),
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "authorId" TEXT,
        FOREIGN KEY ("authorId") REFERENCES "users"("id")
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "metrics" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "description" TEXT,
        "source" TEXT NOT NULL,
        "sourceUrl" TEXT,
        "howToUse" TEXT,
        "talkTrack" TEXT,
        "vertical" TEXT,
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "publishedAt" TIMESTAMP(3),
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "authorId" TEXT,
        FOREIGN KEY ("authorId") REFERENCES "users"("id")
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "newsletters" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "content" TEXT,
        "scheduledFor" TIMESTAMP(3) NOT NULL,
        "sentAt" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "article_tags" (
        "articleId" TEXT NOT NULL,
        "tagId" TEXT NOT NULL,
        PRIMARY KEY ("articleId", "tagId"),
        FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE,
        FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "metric_tags" (
        "metricId" TEXT NOT NULL,
        "tagId" TEXT NOT NULL,
        PRIMARY KEY ("metricId", "tagId"),
        FOREIGN KEY ("metricId") REFERENCES "metrics"("id") ON DELETE CASCADE,
        FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "newsletter_articles" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "newsletterId" TEXT NOT NULL,
        "articleId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        UNIQUE ("newsletterId", "articleId"),
        FOREIGN KEY ("newsletterId") REFERENCES "newsletters"("id") ON DELETE CASCADE,
        FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "newsletter_metrics" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "newsletterId" TEXT NOT NULL,
        "metricId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        UNIQUE ("newsletterId", "metricId"),
        FOREIGN KEY ("newsletterId") REFERENCES "newsletters"("id") ON DELETE CASCADE,
        FOREIGN KEY ("metricId") REFERENCES "metrics"("id") ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "newsletter_sent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "newsletterId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "opened" BOOLEAN NOT NULL DEFAULT false,
        "openedAt" TIMESTAMP(3),
        UNIQUE ("newsletterId", "userId"),
        FOREIGN KEY ("newsletterId") REFERENCES "newsletters"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `

    console.log('✅ Database schema created successfully')

    const response = {
      success: true,
      message: 'Database schema migration completed successfully!',
      timestamp: new Date().toISOString(),
      tablesCreated: [
        'users', 'tags', 'sources', 'articles', 'metrics', 
        'newsletters', 'article_tags', 'metric_tags', 
        'newsletter_articles', 'newsletter_metrics', 'newsletter_sent'
      ]
    }

    console.log('🎉 Migration completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Database migration failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  // Allow GET for easy testing
  return POST()
} 