# 🚀 Topline Quick Start Guide

Get your Topline sales intelligence platform running in 10 minutes!

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL database** - Options:
   - Local: [Install PostgreSQL](https://www.postgresql.org/download/)
   - Cloud: [Supabase](https://supabase.com) (free tier)
   - Cloud: [Railway](https://railway.app) (free tier)

## Step 1: Clone & Install

```bash
# Clone your repo
git clone git@github.com:neejgore/topline.git
cd topline

# Install dependencies
npm install
```

## Step 2: Set Up Database

### Option A: Using Supabase (Recommended for quick start)
1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your connection string from Project Settings > Database
3. It will look like: `postgresql://postgres:[password]@[host]:5432/postgres`

### Option B: Local PostgreSQL
```bash
# Create database locally
createdb topline
```

## Step 3: Configure Environment

```bash
# Create .env file from template
cp env.config.txt .env
```

Edit `.env` with your settings:
```bash
# Required for webapp
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="make-this-a-long-random-string"

# Your email for admin access
ADMIN_EMAIL="your-email@gmail.com"
```

## Step 4: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Add sample content (articles & metrics)
npm run seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** - you should see:
- ✅ Homepage with sample articles and metrics
- ✅ Newsletter signup form (won't send emails yet)
- ✅ Archive page with search functionality

## 🎉 You're Ready!

Your Topline platform is now running locally with sample content from your specification:

### Sample Articles:
- "CMOs Double Down on AI Budgets" 
- "FTC Greenlights Omnicom-IPG Merger"
- "Cookieless Future Accelerates"

### Sample Metrics:
- "88% of Marketers Using AI Daily"
- "72% Digital Spend Share" 
- "38% Customer Acquisition Cost Increase"

## Next Steps

### For Development:
1. **Add your own content** via the database
2. **Customize styling** in `tailwind.config.js`
3. **Test the archive and search** functionality

### For Production (Vercel):
1. **Push to GitHub**: `git push origin main`
2. **Connect to Vercel**: Import your GitHub repo
3. **Add environment variables** in Vercel dashboard
4. **Deploy!**

### For Newsletter (Later):
1. Set up Brevo account
2. Add Brevo API key to environment
3. Configure newsletter scheduling

## Troubleshooting

**Database connection issues?**
- Check your DATABASE_URL format
- For Supabase, ensure you're using the connection pooler URL

**Build errors?**
- Run `npm run db:generate` to update Prisma client
- Clear `.next` folder: `rm -rf .next`

**Sample data not showing?**
- Check if `npm run seed` completed successfully
- Verify database connection in logs

---
**Need help?** Check the full README.md or create an issue in your repo. 