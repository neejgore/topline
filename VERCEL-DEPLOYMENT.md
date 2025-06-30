# 🚀 Vercel Deployment Guide

Deploy your Topline sales intelligence platform to Vercel in minutes!

## ✅ Prerequisites Complete

- ✅ **Code pushed to GitHub:** `git@github.com:neejgore/topline.git`
- ✅ **Vercel configuration:** `vercel.json` created
- ✅ **Cron job setup:** Weekly content refresh (Tuesday 12am PST)
- ✅ **Production database:** Ready for PostgreSQL/Supabase

## Step 1: Connect to Vercel

1. **Visit:** [vercel.com](https://vercel.com)
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your `neejgore/topline` repository
5. **Framework:** Next.js (auto-detected)

## Step 2: Configure Environment Variables

In Vercel dashboard, add these environment variables:

### Required Variables:
```bash
# Database
DATABASE_URL="your-production-database-url"

# App Settings  
APP_URL="https://your-domain.vercel.app"
ADMIN_EMAIL="your-email@gmail.com"

# Content Refresh Security
CRON_SECRET="generate-a-secure-random-string"

# Content Schedule
CONTENT_REFRESH_DAY="TUESDAY"
CONTENT_REFRESH_TIME="00:00"
CONTENT_TIMEZONE="America/Los_Angeles"
```

### Optional (For Enhanced Features):
```bash
# Newsletter (Brevo)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@topline.zetaglobal.com"  
BREVO_SENDER_NAME="Topline"

# AI-Powered Insights
OPENAI_API_KEY="your-openai-api-key"
NEWS_API_KEY="your-news-api-key"
```

## Step 3: Database Setup Options

### Option A: Supabase (Recommended)
1. **Create project:** [supabase.com](https://supabase.com)
2. **Get connection string:** Settings → Database → Connection string
3. **Format:** `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`
4. **Add to Vercel:** Environment variable `DATABASE_URL`

### Option B: Vercel Postgres
1. **In Vercel dashboard:** Storage → Create Database → Postgres
2. **Auto-connects** to your project
3. **Environment variables** added automatically

### Option C: PlanetScale MySQL
1. **Create database:** [planetscale.com](https://planetscale.com)
2. **Get connection URL**
3. **Update `prisma/schema.prisma`:** Change `postgresql` to `mysql`

## Step 4: Deploy!

1. **Click "Deploy"** in Vercel
2. **Wait 2-3 minutes** for build completion
3. **Visit your URL:** `https://topline-[random].vercel.app`

## Step 5: Initialize Production Database

After successful deployment:

```bash
# Option A: Use Vercel CLI
npx vercel env pull .env.local
npm run db:push
npm run seed

# Option B: Use production API
curl -X POST https://your-domain.vercel.app/api/setup
```

## Step 6: Test Automated Content Refresh

```bash
# Test the cron endpoint manually
curl -H "Authorization: Bearer your-cron-secret" \
     https://your-domain.vercel.app/api/cron/refresh-content
```

## Step 7: Custom Domain (Optional)

1. **Vercel Dashboard:** Settings → Domains
2. **Add domain:** `topline.zetaglobal.com`
3. **Configure DNS:** Add CNAME record
4. **SSL:** Automatically provisioned

## 🔧 Build Configuration

Your `vercel.json` includes:

- **Cron Jobs:** Tuesday 12am PST content refresh
- **Function Timeout:** 30s for content ingestion
- **Build Optimization:** Prisma configuration
- **Region:** US East (fast for your audience)

## 📊 Monitoring & Maintenance

### Content Health Check
- **Dashboard:** Vercel Functions logs
- **Manual refresh:** `/api/cron/refresh-content`
- **Content stats:** Check homepage for recent articles

### Weekly Tasks
- ✅ **Content auto-refreshes** every Tuesday 12am PST
- ✅ **Expired content** automatically removed
- ✅ **New articles** from 6 industry sources

### Alerts Setup
1. **Vercel:** Enable function error notifications
2. **Email alerts:** Failed content refresh notifications
3. **Uptime monitoring:** Use tools like UptimeRobot

## 🚨 Troubleshooting

### Build Fails
- **Check logs:** Vercel deployment log
- **Common fix:** Environment variables missing
- **Database:** Ensure `DATABASE_URL` is correct

### Content Not Updating
- **Check cron logs:** Vercel Functions dashboard
- **Verify:** `CRON_SECRET` environment variable
- **Manual test:** Call API endpoint directly

### Database Connection Issues
- **Supabase:** Check connection pooling settings
- **Timeout:** Increase in `vercel.json` if needed
- **Migrations:** Run `npm run db:push` after schema changes

## 📈 Performance Optimization

### Already Configured:
- ✅ **Static generation** for homepage
- ✅ **Image optimization** with Next.js
- ✅ **Database indexing** on key fields
- ✅ **Content expiration** (7-day cleanup)

### Additional Optimizations:
- **CDN:** Vercel global edge network
- **Caching:** API responses cached appropriately
- **Compression:** Automatic with Vercel
- **Analytics:** Add Vercel Analytics if needed

## ✨ What's Deployed

Your live Topline platform includes:

🏠 **Homepage:** Latest curated articles + metrics
🔍 **Search & Archive:** Full-text search with filters  
📧 **Newsletter Signup:** Ready for Brevo integration
📱 **Mobile Responsive:** Works on all devices
🔄 **Auto-Refresh:** Weekly content updates
🎯 **Sales Intelligence:** AI-powered insights

## 🎉 Success!

Your Topline platform is now live at:
**https://your-domain.vercel.app**

Share the link with your sales team and start delivering weekly sales intelligence!

---

**Questions?** Check the deployment logs or create an issue on GitHub. 