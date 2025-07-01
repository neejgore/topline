// Real content sources for Topline sales intelligence
export const CONTENT_SOURCES = {
  rssFeeds: [
    {
      name: 'AdExchanger',
      url: 'https://www.adexchanger.com/feed/',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'MarTech Today',
      url: 'https://martech.org/feed/',
      category: 'Technology & Media', 
      priority: 'HIGH'
    },
    {
      name: 'Digiday',
      url: 'https://digiday.com/feed/',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Ad Age',
      url: 'https://adage.com/rss.xml',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Marketing Land',
      url: 'https://marketingland.com/feed',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Campaign US',
      url: 'https://www.campaignlive.com/rss',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'MediaPost - Online Media Daily',
      url: 'http://feeds.mediapost.com/online-media-daily',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'MediaPost - Media Daily News',
      url: 'http://feeds.mediapost.com/mediadailynews',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'MediaPost - TV News Daily',
      url: 'http://feeds.mediapost.com/television-news-daily',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'MediaPost - Social Media Marketing',
      url: 'http://feeds.mediapost.com/social-media-marketing-daily',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'VentureBeat Marketing',
      url: 'https://venturebeat.com/category/marketing/feed/',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'Advertising Age Marketing',
      url: 'https://adage.com/section/marketing/rss',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Chief Marketer',
      url: 'https://www.chiefmarketer.com/feed/',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'Mobile Marketer',
      url: 'https://www.mobilemarketer.com/rss.xml',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'Retail Dive',
      url: 'https://www.retaildive.com/feeds/news/',
      category: 'Consumer & Retail',
      priority: 'MEDIUM'
    },
    {
      name: 'Marketing Brew',
      url: 'https://www.marketingbrew.com/feed',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Adweek',
      url: 'https://www.adweek.com/feed/',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'eMarketer',
      url: 'https://www.emarketer.com/rss/all/',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      category: 'Technology & Media',
      priority: 'MEDIUM'
    },
    {
      name: 'Wall Street Journal CMO',
      url: 'https://feeds.wsj.com/WSJ-com/RSS/WSJCOM-marketing',
      category: 'Technology & Media',
      priority: 'HIGH'
    },
    {
      name: 'Forbes CMO Network',
      url: 'https://www.forbes.com/sites/cmo/feed/',
      category: 'Services',
      priority: 'MEDIUM'
    },
    {
      name: 'Harvard Business Review Marketing',
      url: 'https://feeds.hbr.org/harvardbusiness/marketing',
      category: 'Services',
      priority: 'HIGH'
    },
    {
      name: 'Modern Healthcare',
      url: 'https://www.modernhealthcare.com/rss.xml',
      category: 'Healthcare',
      priority: 'MEDIUM'
    },
    {
      name: 'American Banker',
      url: 'https://www.americanbanker.com/feed',
      category: 'Financial Services',
      priority: 'MEDIUM'
    },
    {
      name: 'Automotive News',
      url: 'https://www.autonews.com/rss.xml',
      category: 'Automotive',
      priority: 'MEDIUM'
    }
  ],
  
  keywordFilters: [
    // AI/ML Keywords
    'artificial intelligence', 'machine learning', 'AI advertising', 'programmatic AI',
    'generative AI', 'AI marketing', 'chatGPT', 'automation',
    
    // Privacy/Compliance
    'third-party cookies', 'privacy regulations', 'GDPR', 'CCPA', 'data privacy',
    'consent management', 'first-party data', 'cookieless',
    
    // MarTech
    'customer data platform', 'CDP', 'marketing automation', 'personalization',
    'attribution', 'marketing mix modeling', 'MMM', 'martech stack',
    'customer journey', 'omnichannel', 'marketing technology',
    
    // AdTech
    'programmatic advertising', 'demand side platform', 'DSP', 'supply side platform', 'SSP',
    'header bidding', 'real-time bidding', 'RTB', 'connected TV', 'CTV',
    'addressable advertising', 'ad fraud', 'viewability',
    
    // Business Intelligence
    'merger', 'acquisition', 'funding', 'IPO', 'valuation', 'partnership',
    'revenue', 'growth', 'earnings', 'investment',
    
    // Sales/Revenue Operations
    'revenue operations', 'sales enablement', 'lead generation', 'conversion optimization',
    'sales technology', 'CRM', 'pipeline', 'forecasting',
    
    // Digital Marketing
    'social media marketing', 'influencer marketing', 'content marketing',
    'email marketing', 'search marketing', 'SEO', 'SEM', 'PPC',
    
    // Retail & E-commerce
    'retail media', 'e-commerce', 'omnichannel retail', 'direct-to-consumer',
    'marketplace advertising', 'product discovery',
    
    // Measurement & Analytics
    'marketing measurement', 'attribution modeling', 'incrementality',
    'marketing ROI', 'cross-channel measurement', 'unified measurement'
  ],
  
  excludeKeywords: [
    'celebrity', 'entertainment', 'sports', 'politics', 'weather',
    'gossip', 'fashion', 'lifestyle', 'travel', 'food'
  ]
}

export const CONTENT_SCHEDULE = {
  // Tuesday 12:00 AM EST (UTC-5, or UTC-4 during DST)
  refreshDay: 'TUESDAY',
  refreshTime: '00:00',
  timezone: 'America/New_York',
  
  // Content age limits - 6 day lookback window
  maxAgeHours: 144, // 6 days
  preferredAgeHours: 144, // Prefer content within 6 days
  
  // Content limits per week
  maxArticles: 50, // Increased for comprehensive coverage
  maxMetrics: 15
}

export const METRICS_SOURCES = [
  {
    name: 'eMarketer',
    type: 'research',
    topics: ['digital advertising spend', 'mobile advertising', 'programmatic growth']
  },
  {
    name: 'Gartner',
    type: 'analyst',
    topics: ['martech adoption', 'AI in marketing', 'customer experience']
  },
  {
    name: 'Salesforce State of Marketing',
    type: 'survey',
    topics: ['marketing budgets', 'channel effectiveness', 'personalization']
  },
  {
    name: 'HubSpot Research',
    type: 'survey',
    topics: ['sales enablement', 'lead generation', 'conversion rates']
  }
] 