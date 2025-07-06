# Newsletter System Documentation

## Overview

The Topline newsletter system automatically generates and sends daily newsletters to subscribers using the Brevo email service. The newsletter includes the daily metric and latest articles.

## Features

- **Responsive HTML Email Template**: Beautiful, mobile-friendly newsletter design
- **Daily Content**: Includes the need-to-know metric and 3 latest articles
- **Subscriber Management**: Integrates with your Supabase database
- **Preview Page**: Live preview of newsletter content at `/newsletter/preview`
- **Manual & Automated Sending**: Can be triggered manually or scheduled

## URLs

- **Preview Page**: https://topline-tlwi.vercel.app/newsletter/preview
- **Newsletter API**: https://topline-tlwi.vercel.app/api/newsletter/send

## How It Works

1. **Content Generation**: Fetches daily metric and latest articles from your APIs
2. **HTML Template**: Generates responsive HTML email using the content
3. **Subscriber List**: Gets active subscribers from your database
4. **Email Sending**: Uses Brevo API to send newsletters to all subscribers

## Manual Newsletter Sending

### Option 1: Run Script Locally
```bash
# Set up environment variables first
node scripts/send-newsletter.js
```

### Option 2: Use API Endpoint
```bash
curl -X POST "https://topline-tlwi.vercel.app/api/newsletter/send?secret=pasdogawegmasdngasd"
```

## Newsletter Content

The newsletter includes:
- **Header**: Topline branding with current date
- **Daily Metric**: 3-column layout (Metric/Description, How to Use, Talk Track)
- **Latest Articles**: 3 most recent articles with summaries
- **CTA Section**: Link back to your website
- **Footer**: Unsubscribe info and copyright

## Scheduling Options

Since Vercel has a 2-cron job limit, you can schedule newsletters using:

### Option 1: GitHub Actions
Create `.github/workflows/newsletter.yml`:
```yaml
name: Send Daily Newsletter
on:
  schedule:
    - cron: '0 12 * * 1-5' # 7am EST on weekdays
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Send Newsletter
        run: |
          curl -X POST "https://topline-tlwi.vercel.app/api/newsletter/send?secret=pasdogawegmasdngasd"
```

### Option 2: External Cron Service
Use services like:
- Cron-job.org
- EasyCron
- UptimeRobot

Set them to hit: `https://topline-tlwi.vercel.app/api/newsletter/send?secret=pasdogawegmasdngasd`

### Option 3: Local Cron Job
Add to your crontab:
```bash
# Send newsletter at 7am EST on weekdays
0 7 * * 1-5 cd /path/to/topline && node scripts/send-newsletter.js
```

## Testing

### Test Newsletter Content
```bash
# Preview content without sending
curl "https://topline-tlwi.vercel.app/api/newsletter/send?test=true"
```

### Test Full System
```bash
# Run interactive test
node scripts/test-newsletter.js
```

## Environment Variables Required

- `BREVO_API_KEY`: Your Brevo API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `CRON_SECRET`: Secret for API authentication

## Monitoring

- Newsletter sends are logged to `newsletter-log.txt`
- Check Vercel Function logs for detailed error information
- Monitor Brevo dashboard for delivery statistics

## Troubleshooting

1. **No subscribers**: Check `newsletter_subscribers` table in Supabase
2. **Brevo errors**: Verify API key and check Brevo dashboard
3. **Content issues**: Visit preview page to debug content generation
4. **Authentication errors**: Verify CRON_SECRET matches in environment

## Future Enhancements

- Add email templates for different content types
- Include subscriber segmentation
- Add A/B testing for subject lines
- Implement email analytics tracking 