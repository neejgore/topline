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
      name: 'MediaPost',
      url: 'https://www.mediapost.com/rss/',
      category: 'Technology & Media',
      priority: 'MEDIUM'
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
  // Tuesday 12:00 AM PST (UTC-8, or UTC-7 during DST)
  refreshDay: 'TUESDAY',
  refreshTime: '00:00',
  timezone: 'America/Los_Angeles',
  
  // Content age limits - 4 day lookback window
  maxAgeHours: 96, // 4 days
  preferredAgeHours: 96, // Prefer content within 4 days
  
  // Content limits per week
  maxArticles: 15, // Increased for more sources
  maxMetrics: 10
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