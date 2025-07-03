-- Drop all tables to start fresh
DROP TABLE IF EXISTS "newsletter_sent" CASCADE;
DROP TABLE IF EXISTS "newsletter_metrics" CASCADE;
DROP TABLE IF EXISTS "newsletter_articles" CASCADE;
DROP TABLE IF EXISTS "article_tags" CASCADE;
DROP TABLE IF EXISTS "metric_tags" CASCADE;
DROP TABLE IF EXISTS "newsletters" CASCADE;
DROP TABLE IF EXISTS "articles" CASCADE;
DROP TABLE IF EXISTS "metrics" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "sources" CASCADE;
DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Priority" CASCADE;
DROP TYPE IF EXISTS "Status" CASCADE;
DROP TYPE IF EXISTS "NewsletterStatus" CASCADE;

-- Create enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'SUBSCRIBER');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "NewsletterStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT');

-- Create tables
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SUBSCRIBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "whyItMatters" TEXT,
    "talkTrack" TEXT,
    "category" TEXT NOT NULL DEFAULT 'NEWS',
    "vertical" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importanceScore" INTEGER DEFAULT 0,
    "reasoning" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "context" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "whyItMatters" TEXT,
    "talkTrack" TEXT,
    "category" TEXT NOT NULL DEFAULT 'METRICS',
    "vertical" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "articles_sourceUrl_key" ON "articles"("sourceUrl");
CREATE UNIQUE INDEX "articles_title_sourceName_key" ON "articles"("title", "sourceName");
CREATE UNIQUE INDEX "metrics_title_source_key" ON "metrics"("title", "source");
CREATE UNIQUE INDEX "metrics_sourceUrl_key" ON "metrics"("sourceUrl");
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- Add foreign keys
ALTER TABLE "articles" ADD CONSTRAINT "articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; 