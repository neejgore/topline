// Real content sources for Topline sales intelligence
export const CONTENT_SOURCES = [
  {
    name: 'AdExchanger',
    rssUrl: 'https://www.adexchanger.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'MarTech Today',
    rssUrl: 'https://martech.org/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Digiday',
    rssUrl: 'https://digiday.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Ad Age',
    rssUrl: 'https://adage.com/rss.xml',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: false // temporarily disabled; endpoint 404s
  },
  {
    name: 'Marketing Land',
    rssUrl: 'https://marketingland.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Campaign US',
    rssUrl: 'https://www.campaignlive.com/rss',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: false // temporarily disabled; endpoint 404s
  },
  {
    name: 'MediaPost - Social Media Marketing',
    rssUrl: 'http://feeds.mediapost.com/social-media-marketing-daily',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Marketing Brew',
    rssUrl: 'https://www.marketingbrew.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: false // temporarily disabled; endpoint 404s
  },
  {
    name: 'Search Engine Land',
    rssUrl: 'https://searchengineland.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Content Marketing Institute',
    rssUrl: 'https://contentmarketinginstitute.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'MarketingProfs',
    rssUrl: 'https://www.marketingprofs.com/feed.xml',
    vertical: 'Technology & Media',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'HubSpot Marketing Blog',
    rssUrl: 'https://blog.hubspot.com/marketing/rss.xml',
    vertical: 'Technology & Media',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'TechCrunch',
    rssUrl: 'https://techcrunch.com/feed/',
    vertical: 'Technology & Media',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'Forbes CMO Network',
    rssUrl: 'https://www.forbes.com/sites/cmo/feed/',
    vertical: 'Services',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'Retail Dive',
    rssUrl: 'https://www.retaildive.com/feeds/news/',
    vertical: 'Consumer & Retail',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'Modern Healthcare',
    rssUrl: 'https://www.modernhealthcare.com/rss.xml',
    vertical: 'Healthcare',
    priority: 'MEDIUM',
    enabled: false // temporarily disabled; endpoint 404s
  },
  {
    name: 'American Banker',
    rssUrl: 'https://www.americanbanker.com/feed.rss',
    vertical: 'Financial Services',
    priority: 'MEDIUM',
    enabled: true // Re-enabled with correct RSS URL
  },
  {
    name: 'Banking Dive',
    rssUrl: 'https://www.bankingdive.com/feeds/news/',
    vertical: 'Financial Services',
    priority: 'MEDIUM',
    enabled: true
  },
  // Added reliable alternatives to ensure daily volume
  {
    name: 'Search Engine Journal',
    rssUrl: 'https://www.searchenginejournal.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    enabled: true
  },
  {
    name: 'Marketing Week',
    rssUrl: 'https://www.marketingweek.com/feed/',
    vertical: 'Technology & Media',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    name: 'CMSWire Marketing',
    rssUrl: 'https://www.cmswire.com/marketing/rss/',
    vertical: 'Technology & Media',
    priority: 'MEDIUM',
    enabled: true
  }
]

// Keywords to identify relevant content
export const RELEVANT_KEYWORDS = [
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
  
  // Digital Marketing
  'social media marketing', 'influencer marketing', 'content marketing',
  'email marketing', 'search marketing', 'SEO', 'SEM', 'PPC',
  
  // Retail & E-commerce
  'retail media', 'e-commerce', 'omnichannel retail', 'direct-to-consumer',
  'marketplace advertising', 'product discovery'
]

// Keywords to exclude content
export const EXCLUDE_KEYWORDS = [
  'celebrity', 'entertainment', 'sports', 'politics', 'weather',
  'gossip', 'fashion', 'lifestyle', 'travel', 'food'
]

// Valid verticals
export const VERTICALS = [
  'Technology & Media',
  'Consumer & Retail',
  'Healthcare',
  'Financial Services',
  'Insurance',
  'Automotive',
  'Travel & Hospitality',
  'Education',
  'Telecom',
  'Services',
  'Political Candidate & Advocacy',
  'Other'
] as const

export type Vertical = typeof VERTICALS[number]

export const CONTENT_SCHEDULE = {
  // Daily at 12:00 AM EST
  refreshDay: 'DAILY',
  refreshTime: '00:00',
  timezone: 'America/New_York',
  
  // Content age limits - 24 hour lookback window
  maxAgeHours: 24, // 1 day
  preferredAgeHours: 24, // Prefer content within 24 hours
  
  // Content limits per day
  maxArticles: 25, // Adjusted for daily coverage
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