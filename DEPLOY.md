# 🚀 Deploy Topline to Vercel

Step-by-step guide to deploy your Topline platform to production.

## Prerequisites

- ✅ Local development working (see QUICKSTART.md)
- ✅ GitHub repo: `git@github.com:neejgore/topline.git`
- ✅ Vercel account (free tier is fine)

## Step 1: Prepare Production Database

### Option A: Supabase (Recommended)
1. Create a **production** project at [supabase.com](https://supabase.com)
2. Get the connection string from Settings > Database
3. Note: Use a different project than your local development

### Option B: Railway
1. Create account at [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Get connection string from Variables tab

## Step 2: Deploy to Vercel

### Via Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import `neejgore/topline` from GitHub
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)

## Step 3: Add Environment Variables

In Vercel project dashboard, go to Settings > Environment Variables:

```bash
# Database (Required)
DATABASE_URL="your-production-postgresql-url"

# Auth (Required)
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="long-random-production-secret"

# App Settings
APP_URL="https://your-app-name.vercel.app"
ADMIN_EMAIL="your-email@gmail.com"

# Brevo (Add later for newsletter)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="Topline"
```

## Step 4: Deploy & Set Up Database

1. **Deploy**: Click "Deploy" in Vercel
2. **Set up production database** once deployed:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run database commands in production
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma db seed
```

## Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain (e.g., `topline.yourdomain.com`)
3. Update `NEXTAUTH_URL` and `APP_URL` environment variables
4. Redeploy

## Step 6: Verify Deployment

Visit your Vercel URL and check:

- ✅ Homepage loads with articles and metrics
- ✅ Archive page works with search
- ✅ Newsletter signup shows success message
- ✅ No console errors

## Environment Variables Reference

### Required for Basic Webapp:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="production-secret"
APP_URL="https://your-app.vercel.app"
ADMIN_EMAIL="your-email@gmail.com"
```

### Optional for Newsletter (Add Later):
```bash
BREVO_API_KEY="your-brevo-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="Topline"
```

## Troubleshooting

### Database Issues:
- Ensure DATABASE_URL is the production connection string
- Check Vercel Function Logs for Prisma errors
- Verify database migration completed: `npx prisma migrate status`

### Build Errors:
- Check Vercel build logs
- Ensure all environment variables are set
- Try building locally first: `npm run build`

### Domain Issues:
- DNS propagation can take up to 24 hours
- Use Vercel's SSL (automatic with custom domains)

## Next Steps

1. **Content Management**: Add your own articles and metrics via database
2. **Brevo Integration**: Set up newsletter sending
3. **Monitoring**: Set up Vercel Analytics
4. **Backups**: Configure database backups

## Brevo Newsletter Setup (Later)

Once your webapp is working:

1. **Create Brevo account** at [brevo.com](https://brevo.com)
2. **Get API key** from Settings > API Keys
3. **Add to Vercel env vars**: `BREVO_API_KEY`
4. **Test newsletter signup** functionality
5. **Create newsletter template** in Brevo
6. **Schedule weekly sends** for Monday 7am

---

**Questions?** Check the main README.md or create an issue in your GitHub repo. 