const { OpenAI } = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Valid verticals for content classification
const VERTICALS = [
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
]

/**
 * Autonomous content classifier that determines the correct vertical based on article content
 * @param {string} title - Article title
 * @param {string} content - Article content/summary
 * @param {string} sourceName - Source publication name
 * @returns {string} - Correct vertical classification
 */
function classifyVertical(title, content, sourceName) {
  const fullText = `${title} ${content}`.toLowerCase()
  
  // Define company/brand patterns for each vertical
  const verticalPatterns = {
    'Consumer & Retail': {
      companies: [
        'amazon', 'walmart', 'target', 'best buy', 'costco', 'home depot', 'lowe\'s',
        'nike', 'adidas', 'starbucks', 'mcdonald\'s', 'coca-cola', 'pepsi',
        'procter & gamble', 'unilever', 'johnson & johnson', 'nestle',
        'ford', 'toyota', 'honda', 'bmw', 'tesla', 'general motors',
        'zara', 'h&m', 'gap', 'macy\'s', 'nordstrom', 'sephora',
        'cleveland kitchen', 'kraft', 'kellogg', 'general mills', 'mars'
      ],
      keywords: [
        'e-commerce', 'consumer goods', 'cpg', 'fmcg',
        'product marketing', 'brand advertising', 'shopper marketing', 
        'consumer insights', 'marketplace', 'direct-to-consumer', 
        'omnichannel retail', 'brick and mortar', 'retail technology', 
        'point of sale', 'consumer behavior', 'brand loyalty', 'customer experience'
      ]
    },
    
    'Financial Services': {
      companies: [
        'jpmorgan', 'bank of america', 'wells fargo', 'chase', 'citigroup',
        'goldman sachs', 'morgan stanley', 'american express', 'visa',
        'mastercard', 'paypal', 'square', 'stripe', 'robinhood',
        'charles schwab', 'fidelity', 'vanguard', 'blackrock',
        'capital one', 'discover', 'td bank', 'pnc', 'us bank'
      ],
      keywords: [
        'banking', 'fintech', 'financial services', 'investment',
        'lending', 'credit', 'payments', 'cryptocurrency', 'blockchain',
        'wealth management', 'asset management', 'insurance',
        'financial technology', 'digital banking', 'mobile banking',
        'financial advertising', 'credit cards', 'mortgages'
      ]
    },
    
    'Healthcare': {
      companies: [
        'pfizer', 'johnson & johnson', 'merck', 'abbott', 'bristol myers',
        'moderna', 'astrazeneca', 'novartis', 'roche', 'gsk',
        'unitedhealth', 'anthem', 'cigna', 'humana', 'aetna',
        'cvs health', 'walgreens', 'rite aid', 'teladoc', 'dexcom'
      ],
      keywords: [
        'healthcare', 'pharmaceutical', 'medical', 'hospital',
        'telehealth', 'telemedicine', 'health insurance', 'medicare',
        'medicaid', 'clinical trials', 'medical devices', 'biotech',
        'healthcare technology', 'patient care', 'medical marketing',
        'pharmaceutical advertising', 'health tech', 'digital health'
      ]
    },
    
    'Technology & Media': {
      companies: [
        'google', 'facebook', 'meta', 'apple', 'microsoft', 'amazon aws',
        'netflix', 'disney', 'comcast', 'verizon', 'at&t', 't-mobile',
        'salesforce', 'adobe', 'oracle', 'sap', 'servicenow',
        'zoom', 'slack', 'dropbox', 'spotify', 'twitter', 'linkedin',
        'tiktok', 'snapchat', 'pinterest', 'reddit', 'youtube',
        'programmatic', 'dsp', 'ssp', 'ad tech', 'mar tech'
      ],
      keywords: [
        'advertising technology', 'marketing technology', 'martech', 'adtech',
        'programmatic advertising', 'digital advertising', 'ad tech',
        'marketing automation', 'crm', 'customer data platform',
        'personalization', 'attribution', 'marketing analytics',
        'social media marketing', 'content marketing', 'email marketing',
        'seo', 'sem', 'ppc', 'display advertising', 'video advertising',
        'connected tv', 'ctv', 'ott', 'streaming', 'digital media',
        'marketing measurement', 'campaign measurement', 'media measurement',
        'marketing metrics', 'advertising metrics', 'campaign analytics',
        'paid media', 'digital campaigns', 'marketing data', 'ad measurement',
        'marketing roi', 'advertising roi', 'campaign optimization',
        'marketing performance', 'advertising performance', 'media mix modeling',
        'attribution modeling', 'conversion tracking', 'audience targeting',
        'programmatic', 'real-time bidding', 'header bidding', 'demand side platform',
        'retail media', 'retail advertising', 'retail analytics', 'advertising channels',
        'media channels', 'emerging channels', 'third-party data', 'first-party data',
        'advertiser spend', 'ad spend', 'advertising spend', 'media spend', 'marketing spend',
        'podcast advertising', 'audio advertising', 'streaming advertising', 'digital audio',
        'content monetization', 'media monetization', 'advertising revenue', 'media revenue'
      ]
    },
    
    'Services': {
      companies: [
        'accenture', 'deloitte', 'mckinsey', 'bcg', 'pwc', 'kpmg',
        'ibm', 'cognizant', 'infosys', 'wipro', 'tcs', 'capgemini',
        'fedex', 'ups', 'dhl', 'uber', 'lyft', 'doordash',
        'airbnb', 'booking.com', 'expedia', 'tripadvisor'
      ],
      keywords: [
        'consulting', 'professional services', 'business services',
        'logistics', 'transportation', 'shipping', 'delivery',
        'travel', 'hospitality', 'tourism', 'business consulting',
        'management consulting', 'it services', 'outsourcing'
      ]
    },
    
    'Automotive': {
      companies: [
        'ford', 'general motors', 'gm', 'toyota', 'honda', 'nissan',
        'bmw', 'mercedes', 'audi', 'volkswagen', 'hyundai', 'kia',
        'tesla', 'rivian', 'lucid', 'ferrari', 'porsche', 'jaguar',
        'land rover', 'volvo', 'subaru', 'mazda', 'mitsubishi'
      ],
      keywords: [
        'automotive industry', 'auto industry', 'car manufacturer', 'vehicle manufacturer', 'automobile industry',
        'electric vehicle', 'autonomous driving', 'self-driving car', 'self-driving vehicle',
        'automotive technology', 'connected car', 'automotive advertising', 'car marketing',
        'auto sales', 'car sales', 'vehicle sales', 'automotive market', 'car market'
      ]
    },
    
    'Travel & Hospitality': {
      companies: [
        'marriott', 'hilton', 'hyatt', 'ihg', 'accor', 'wyndham',
        'airbnb', 'booking.com', 'expedia', 'tripadvisor', 'kayak',
        'american airlines', 'delta', 'united', 'southwest', 'jetblue',
        'carnival', 'royal caribbean', 'norwegian', 'disney cruise'
      ],
      keywords: [
        'travel', 'tourism', 'hospitality', 'hotel', 'airline',
        'vacation', 'cruise', 'resort', 'booking', 'reservation',
        'travel technology', 'hospitality technology', 'travel marketing',
        'destination marketing', 'travel advertising', 'hotel marketing'
      ]
    },
    
    'Education': {
      companies: [
        'pearson', 'mcgraw-hill', 'cengage', 'blackboard', 'canvas',
        'coursera', 'udemy', 'edx', 'khan academy', 'duolingo',
        'chegg', 'university of phoenix', 'apollo education'
      ],
      keywords: [
        'education', 'e-learning', 'online learning', 'university',
        'college', 'school', 'educational technology', 'edtech',
        'learning management', 'student', 'academic', 'curriculum',
        'educational marketing', 'higher education', 'k-12'
      ]
    },
    
    'Insurance': {
      companies: [
        'state farm', 'geico', 'progressive', 'allstate', 'farmers',
        'liberty mutual', 'usaa', 'nationwide', 'travelers',
        'aig', 'chubb', 'zurich', 'allianz', 'axa', 'prudential',
        'metlife', 'new york life', 'northwestern mutual'
      ],
      keywords: [
        'insurance', 'life insurance', 'health insurance', 'auto insurance',
        'home insurance', 'property insurance', 'casualty insurance',
        'insurtech', 'insurance technology', 'risk management',
        'actuarial', 'underwriting', 'claims', 'insurance marketing'
      ]
    },
    
    'Telecom': {
      companies: [
        'verizon', 'at&t', 't-mobile', 'sprint', 'comcast', 'charter',
        'dish', 'directv', 'frontier', 'centurylink', 'lumen',
        'vodafone', 'orange', 'telefonica', 'deutsche telekom'
      ],
      keywords: [
        'telecommunications', 'telecom', 'wireless', 'broadband',
        'internet service', 'isp', 'mobile', 'cellular', '5g',
        'fiber optic', 'satellite', 'cable', 'phone service',
        'network', 'connectivity', 'telecom marketing'
      ]
    }
  }

  // Score each vertical based on content matches
  const scores = {}
  const debug = process.env.DEBUG_CLASSIFIER === 'true'
  
  for (const [vertical, patterns] of Object.entries(verticalPatterns)) {
    scores[vertical] = 0
    let companyMatches = []
    let keywordMatches = []
    
    // Check company mentions (higher weight)
    for (const company of patterns.companies) {
      // Use word boundaries to avoid false positives like "aig" in "synergistic"
      const regex = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(fullText)) {
        scores[vertical] += 3
        companyMatches.push(company)
      }
    }
    
    // Check keyword mentions (lower weight)
    for (const keyword of patterns.keywords) {
      // Use word boundaries for keywords to avoid false positives
      // For multi-word keywords, check if the full phrase exists
      if (keyword.includes(' ')) {
        if (fullText.includes(keyword)) {
          scores[vertical] += 1
          keywordMatches.push(keyword)
        }
      } else {
        // For single words, use word boundaries
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (regex.test(fullText)) {
          scores[vertical] += 1
          keywordMatches.push(keyword)
        }
      }
    }
    
    if (debug && (companyMatches.length > 0 || keywordMatches.length > 0)) {
      console.log(`${vertical}: score=${scores[vertical]}, companies=[${companyMatches.join(', ')}], keywords=[${keywordMatches.join(', ')}]`)
    }
  }
  
  // Find the vertical with the highest score
  let bestVertical = 'Technology & Media' // Default fallback
  let bestScore = 0
  
  for (const [vertical, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestVertical = vertical
    }
  }
  
  if (debug) {
    console.log(`Best: ${bestVertical} with score ${bestScore}`)
  }
  
  // If no clear winner, use intelligent fallback logic
  if (bestScore === 0) {
    // Check if it's clearly about marketing/advertising technology
    if (fullText.includes('marketing') || fullText.includes('advertising') || 
        fullText.includes('campaign') || fullText.includes('digital') ||
        fullText.includes('ai') || fullText.includes('automation')) {
      bestVertical = 'Technology & Media'
    } else {
      bestVertical = 'Other'
    }
  }
  
  // If the score is low but contains strong marketing/advertising signals, favor Technology & Media
  if (bestScore < 3 && (
    fullText.includes('marketing') || fullText.includes('advertising') || 
    fullText.includes('campaign') || fullText.includes('measurement') ||
    fullText.includes('metrics') || fullText.includes('analytics') ||
    fullText.includes('paid media') || fullText.includes('digital')
  )) {
    // Check if it's not clearly about a specific industry
    const hasSpecificIndustry = fullText.includes('retail') || fullText.includes('healthcare') || 
                               fullText.includes('banking') || fullText.includes('insurance') ||
                               fullText.includes('automotive') || fullText.includes('travel')
    
    if (!hasSpecificIndustry) {
      bestVertical = 'Technology & Media'
    }
  }
  
  return bestVertical
}

/**
 * Autonomous content classifier with validation
 * @param {string} title - Article title
 * @param {string} content - Article content/summary
 * @param {string} sourceName - Source publication name
 * @returns {string} - Validated vertical classification
 */
function classifyVerticalAutonomous(title, content, sourceName) {
  try {
    const classification = classifyVertical(title, content, sourceName)
    
    // Validate that the classification is in the allowed verticals
    if (!VERTICALS.includes(classification)) {
      console.warn(`Invalid vertical classification: ${classification}, using Technology & Media`)
      return 'Technology & Media'
    }
    
    console.log(`📊 Classified "${title.substring(0, 50)}..." as "${classification}"`)
    return classification
    
  } catch (error) {
    console.error('Error in autonomous content classification:', error)
    return 'Technology & Media' // Safe fallback
  }
}

/**
 * Classify article content into the correct vertical using AI
 * @param {string} title - Article title
 * @param {string} content - Article content/summary
 * @param {string} sourceVertical - Original vertical from source
 * @returns {Promise<string>} - Correct vertical classification
 */
async function classifyContentVertical(title, content, sourceVertical) {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ No OpenAI key - using source vertical:', sourceVertical)
    return sourceVertical
  }

  try {
    const prompt = `
Analyze this article and classify it into the most appropriate business vertical:

Article Title: ${title}
Article Content: ${content}
Current Classification: ${sourceVertical}

Available Verticals:
- Technology & Media: Software, platforms, martech, adtech, AI/ML, digital marketing, social media, content marketing, SEO/SEM, programmatic advertising
- Consumer & Retail: Retail operations, e-commerce, consumer goods, shopping, merchandising, point-of-sale, omnichannel retail
- Healthcare: Medical services, pharmaceuticals, health insurance, healthcare technology, medical devices, patient care, wellness
- Financial Services: Banking, investment, payments, fintech, lending, financial planning, wealth management
- Insurance: Life, auto, health, property insurance, risk management, underwriting, claims processing
- Automotive: Car manufacturing, dealerships, auto parts, automotive technology, electric vehicles, autonomous driving
- Travel & Hospitality: Hotels, airlines, tourism, restaurants, travel booking, hospitality management
- Education: Schools, universities, online learning, educational technology, training programs
- Telecom: Telecommunications, mobile carriers, internet service providers, telecom infrastructure
- Services: Professional services, consulting, B2B services, outsourcing, business process management
- Political Candidate & Advocacy: Political campaigns, lobbying, advocacy groups, election-related content
- Other: Content that doesn't fit the above categories

Classification Rules:
1. If the article is about healthcare/medical topics (even if about advertising healthcare), classify as Healthcare
2. If about banking/financial institutions, classify as Financial Services
3. If about retail operations/consumer goods, classify as Consumer & Retail
4. If about insurance companies/coverage, classify as Insurance
5. Only use Technology & Media for pure tech/marketing/media content
6. Consider the PRIMARY subject matter, not just the marketing/advertising angle

Respond with ONLY the vertical name (e.g., "Healthcare", "Financial Services", etc.)
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at classifying business content into industry verticals. Always respond with just the vertical name."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 20,
    })

    const classifiedVertical = response.choices[0].message.content?.trim()
    
    // Validate the response is a valid vertical
    const validVerticals = [
      'Technology & Media', 'Consumer & Retail', 'Healthcare', 
      'Financial Services', 'Insurance', 'Automotive', 
      'Travel & Hospitality', 'Education', 'Telecom', 
      'Services', 'Political Candidate & Advocacy', 'Other'
    ]
    
    if (validVerticals.includes(classifiedVertical)) {
      if (classifiedVertical !== sourceVertical) {
        console.log(`🔄 Reclassified "${title.substring(0, 50)}..." from "${sourceVertical}" to "${classifiedVertical}"`)
      }
      return classifiedVertical
    } else {
      console.log(`⚠️ Invalid vertical "${classifiedVertical}" for "${title.substring(0, 50)}...", using source vertical: ${sourceVertical}`)
      return sourceVertical
    }

  } catch (error) {
    console.error('Error classifying content vertical:', error)
    return sourceVertical
  }
}

module.exports = {
  classifyVertical,
  classifyVerticalAutonomous,
  classifyContentVertical
} 