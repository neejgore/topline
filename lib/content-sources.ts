// Real content sources for Topline sales intelligence
export const CONTENT_SOURCES = {
  rssFeeds: [
    {
      name: 'AdExchanger',
      url: 'https://www.adexchanger.com/feed/',
      category: 'ADTECH',
      priority: 'HIGH'
    },
    {
      name: 'MarTech Today',
      url: 'https://martech.org/feed/',
      category: 'MARTECH', 
      priority: 'HIGH'
    },
    {
      name: 'Digiday',
      url: 'https://digiday.com/feed/',
      category: 'ADTECH',
      priority: 'MEDIUM'
    },
    {
      name: 'Marketing Land',
      url: 'https://marketingland.com/feed',
      category: 'MARTECH',
      priority: 'MEDIUM'
    },
    {
      name: 'AdAge',
      url: 'https://adage.com/rss.xml',
      category: 'ADTECH',
      priority: 'HIGH'
    },
    {
      name: 'VentureBeat Marketing',
      url: 'https://venturebeat.com/category/marketing/feed/',
      category: 'MARTECH',
      priority: 'MEDIUM'
    }
  ],
  
  keywordFilters: [
    // AI/ML Keywords
    'artificial intelligence', 'machine learning', 'AI advertising', 'programmatic AI',
    
    // Privacy/Compliance
    'third-party cookies', 'privacy regulations', 'GDPR', 'CCPA', 'data privacy',
    
    // MarTech
    'customer data platform', 'CDP', 'marketing automation', 'personalization',
    'attribution', 'marketing mix modeling', 'MMM',
    
    // AdTech
    'programmatic advertising', 'demand side platform', 'DSP', 'supply side platform', 'SSP',
    'header bidding', 'real-time bidding', 'RTB',
    
    // Business Intelligence
    'merger', 'acquisition', 'funding', 'IPO', 'valuation', 'partnership',
    
    // Sales/Revenue
    'revenue operations', 'sales enablement', 'lead generation', 'conversion optimization'
  ],
  
  excludeKeywords: [
    'celebrity', 'entertainment', 'sports', 'politics', 'weather'
  ]
}

export const CONTENT_SCHEDULE = {
  // Tuesday 12:00 AM PST (UTC-8, or UTC-7 during DST)
  refreshDay: 'TUESDAY',
  refreshTime: '00:00',
  timezone: 'America/Los_Angeles',
  
  // Content age limits
  maxAgeHours: 168, // 7 days
  preferredAgeHours: 72, // Prefer content within 3 days
  
  // Content limits per week
  maxArticles: 10,
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