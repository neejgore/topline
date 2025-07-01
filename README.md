# 🛠 Topline - Sales Intelligence Platform

Topline is a curated, weekly sales intelligence platform that delivers the top news and metrics relevant to enterprise sales professionals in marketing, media, and technology. It combines sharp editorial insight, strategic interpretation, and easy distribution across web and email.

**Last deployment check: 2025-07-01 05:02 UTC**

## 🔧 Key Features

### 1. Weekly Curation Engine
- **Top News** (≤10 articles): Selected for relevance to martech/adtech sellers
- **Top Metrics** (≤10 data points): Sourced from research, analyst briefs, earnings calls
- Smart prioritization based on tech shifts, market moves, and industry themes

### 2. Interpretation Layer
- **For News**: 2-3 sentence summaries with "Why it Matters" bullets
- **For Metrics**: Context with "How to Use This" sections and talk track examples
- Built-in objection-handling aids and conversation starters

### 3. Publishing Formats
- **Webpage**: Mobile-responsive with searchable archive
- **Newsletter**: Monday 7am delivery, scan-then-click design
- **API**: RESTful endpoints for content integration

### 4. Content Management
- AI-assisted triage & summarization
- Manual editorial vetting
- CMS with tagging system
- Automated refresh cycles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SMTP server for newsletters

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd topline
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/topline"

# Email Configuration  
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@topline.zetaglobal.com"

# Application
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

3. **Set up database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run seed
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage

### For Subscribers
- **Homepage**: View this week's curated content
- **Archive**: Search and browse past insights
- **Newsletter**: Subscribe for Monday morning delivery

### For Editors (Admin Panel)
- **Content Management**: Add, edit, and publish articles/metrics
- **Source Management**: Configure RSS feeds and monitoring
- **Newsletter Creation**: Compose and schedule weekly editions
- **Analytics**: Track engagement and subscription metrics

## 🎯 Use Cases by Persona

| Persona | Use Case |
|---------|----------|
| Account Exec | Pre-call prep & insight-driven outreach |
| Sales Manager | Weekly team huddle material |  
| Sales Enablement | Add to onboarding or pitch library |
| CMO/VP Sales | Forecast where buyers are headed |
| RevOps | Align messaging with market realities |

## 📊 Sample Content Structure

### Article Example
```
Title: "CMOs Double Down on AI Budgets"
Summary: "71% of CMOs plan to invest $10M+ in AI this year (BCG @ Cannes Lions)"
➡️ Why it matters: AI is no longer experimental; it's an arms race. CMOs are looking for execution partners—this is your wedge.
💬 Talk Track: Ask "Where are your biggest content bottlenecks?" then position AI as competitive necessity.
```

### Metric Example  
```
88% of Marketers Now Use AI Daily (SurveyMonkey)
➡️ Use it like this: Ask "Where are your content ops bottlenecks today?"—then offer automation insights.
💬 Talk track: "Most of your competitors are already using AI daily. What's your team's strategy?"
```

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM  
- **Email**: Nodemailer with SMTP
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
topline/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   └── archive/           # Content archive
├── components/            # Reusable UI components  
├── lib/                   # Utility functions
├── prisma/                # Database schema & migrations
├── scripts/               # Database seeding & utilities
└── styles/                # Global styles
```

## 🔌 API Endpoints

- `GET /api/content/current` - This week's articles & metrics
- `GET /api/content/archive` - Historical content  
- `GET /api/content/search?q=query` - Search content
- `POST /api/newsletter/subscribe` - Newsletter subscription
- `POST /api/admin/articles` - Create article (auth required)
- `POST /api/admin/metrics` - Create metric (auth required)
- `/api/reset-content` - Populate database with fresh articles
- `/api/debug-content` - Check database status
- `/api/content/filtered` - Get filtered articles and metrics

## 🚀 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure SMTP email service
3. Set production environment variables

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Database Migration
```bash
# Production database setup
npx prisma migrate deploy
npx prisma generate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email admin@zetaglobal.com or create an issue in this repository.

---

**Built with ❤️ by the Zeta Global Team** 