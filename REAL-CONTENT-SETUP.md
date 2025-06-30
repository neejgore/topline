# 🔄 Real Content Setup Guide

This guide helps you replace example content with **real, current sales intelligence** and set up **automated weekly refresh on Tuesday 12am PST**.

## 🎯 Current Status

Your Topline platform currently shows **example content** for demonstration. Let's make it real!

## Step 1: Install RSS Parser Dependency

The content ingestion system needs the RSS parser:

```bash
npm install rss-parser
```

## Step 2: Replace Example Content with Real Content

```bash
# This will:
# 1. Remove all example articles and metrics
# 2. Fetch real content from industry RSS feeds
# 3. Generate "Why it Matters" and "Talk Track" insights
npm run fetch-content
```

**Content Sources:**
- 📰 **AdExchanger** - Programmatic advertising & adtech news
- 📰 **MarTech Today** - Marketing technology insights  
- 📰 **Digiday** - Digital marketing & media
- 📰 **Marketing Land** - Marketing strategy & tools
- 📰 **AdAge** - Advertising industry news
- 📰 **VentureBeat Marketing** - Marketing technology trends

**Content Filtering:**
- ✅ **Includes:** AI, privacy, programmatic, CDP, attribution, M&A, sales enablement
- ❌ **Excludes:** Celebrity, entertainment, sports, politics

## Step 3: Set Up Weekly Automation (Tuesday 12am PST)

### Option A: Using Vercel Cron Jobs (Recommended)

Create `app/api/cron/refresh-content/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { ContentIngestionService } from '@/lib/content-ingestion'

export async function GET(request: Request) {
  // Verify this is a cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const contentService = new ContentIngestionService()
    
    // Clean up expired content
    await contentService.cleanupExpiredContent()
    
    // Fetch new content
    const result = await contentService.ingestFromRSSFeeds()
    
    return NextResponse.json({
      success: true,
      articlesAdded: result.articles,
      articlesSkipped: result.skipped,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Content refresh failed:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-content",
      "schedule": "0 8 * * 2"
    }
  ]
}
```

**Note:** `0 8 * * 2` = Tuesday at 8am UTC (12am PST during standard time)

### Option B: Using GitHub Actions

Create `.github/workflows/content-refresh.yml`:

```yaml
name: Weekly Content Refresh
on:
  schedule:
    - cron: '0 8 * * 2'  # Tuesday 8am UTC (12am PST)
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run fetch-content
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Step 4: Add Environment Variables

Update your `.env` file:

```bash
# Content automation
CRON_SECRET="your-secure-cron-secret"
CONTENT_REFRESH_DAY="TUESDAY"
CONTENT_REFRESH_TIME="00:00"
CONTENT_TIMEZONE="America/Los_Angeles"

# Optional: AI-powered insights
OPENAI_API_KEY="your-openai-key"  # For better summaries and talk tracks
```

## Step 5: Enhanced AI Integration (Optional)

For better "Why it Matters" and "Talk Track" generation, add OpenAI integration:

```typescript
// In lib/content-ingestion.ts
private async generateInsights(title: string, summary: string): Promise<{
  whyItMatters: string
  talkTrack: string
}> {
  if (process.env.OPENAI_API_KEY) {
    // Use OpenAI to generate contextual insights
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a sales intelligence expert. Generate 'Why it Matters' and 'Talk Track' insights for enterprise sales professionals in martech/adtech."
        },
        {
          role: "user", 
          content: `Article: "${title}"\nSummary: "${summary}"\n\nGenerate:\n1. Why it matters (1-2 sentences)\n2. Talk track for sales conversations`
        }
      ]
    })
    
    // Parse response and return structured insights
  }
  
  // Fallback to template-based insights
  return this.generateTemplateInsights(title, summary)
}
```

## Step 6: Content Quality Monitoring

### Manual Content Review

```bash
# Check content stats
npm run check

# View recent content
npm run fetch-content  # Shows sample of new articles
```

### Automated Quality Checks

The system automatically:
- ✅ **Filters irrelevant content** using keyword matching
- ✅ **Removes duplicates** by checking source URLs
- ✅ **Expires old content** after 7 days
- ✅ **Limits volume** to top 10 articles per week

## Step 7: Metrics Integration

For real metrics data, consider:

1. **API Integration:**
   - eMarketer API for advertising spend data
   - Salesforce Research APIs
   - HubSpot State of Marketing data

2. **Manual Entry:**
   - Weekly research review
   - Quarterly report highlights
   - Earnings call insights

## Testing Your Setup

```bash
# 1. Test content fetching
npm run fetch-content

# 2. Check your website
# Visit http://localhost:3000
# Should show real articles with insights

# 3. Test search functionality  
# Visit http://localhost:3000/archive
# Search for specific topics
```

## Production Deployment

When deploying to Vercel:

1. **Add environment variables** in Vercel dashboard
2. **Enable cron jobs** with Vercel Pro plan
3. **Set up monitoring** for content refresh success/failure
4. **Configure alerts** for failed content fetches

## Content Guidelines

**Target Content:**
- 🎯 **Martech/Adtech industry news**
- 🎯 **AI and automation in marketing**
- 🎯 **Privacy and data regulations**
- 🎯 **M&A and industry consolidation**
- 🎯 **Sales enablement trends**

**Content Quality:**
- ✅ **Recent** (within 3 days preferred)
- ✅ **Relevant** to enterprise sales professionals
- ✅ **Actionable** insights for customer conversations
- ✅ **Authoritative** sources (AdExchanger, MarTech, etc.)

---

**Questions?** Check the main README.md or create an issue for support. 