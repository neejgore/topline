import { CONTENT_SOURCES } from './content-sources'

interface ContentInsights {
  whyItMatters: string
  talkTrack: string
  businessImpact: string
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  keyTopics: string[]
}

interface ArticleAnalysis {
  title: string
  summary: string
  sourceName: string
  fullContent?: string
}

export class ContentAnalysisService {
  
  /**
   * Analyzes article content to generate meaningful business insights
   */
  async generateInsights(article: ArticleAnalysis): Promise<ContentInsights> {
    // Combine title and summary for comprehensive analysis
    const fullText = `${article.title}\n\n${article.summary}`.toLowerCase()
    
    // Extract key topics and themes
    const keyTopics = this.extractKeyTopics(fullText)
    const businessContext = this.analyzeBusinessContext(fullText, keyTopics)
    const urgencyLevel = this.determineUrgency(fullText, keyTopics)
    
    // Generate contextual insights based on actual content
    const insights = this.generateContextualInsights(
      article.title,
      article.summary,
      keyTopics,
      businessContext,
      article.sourceName
    )
    
    return {
      whyItMatters: insights.whyItMatters,
      talkTrack: insights.talkTrack,
      businessImpact: insights.businessImpact,
      urgencyLevel,
      keyTopics
    }
  }
  
  /**
   * Extracts key topics and themes from article content
   */
  private extractKeyTopics(content: string): string[] {
    const topics: string[] = []
    
    // Technology & AI topics
    if (content.includes('artificial intelligence') || content.includes('ai ') || content.includes('machine learning') || content.includes('automation')) {
      topics.push('AI & Automation')
    }
    if (content.includes('data') || content.includes('analytics') || content.includes('measurement')) {
      topics.push('Data & Analytics')
    }
    
    // Privacy & Compliance
    if (content.includes('privacy') || content.includes('gdpr') || content.includes('cookie') || content.includes('compliance')) {
      topics.push('Privacy & Compliance')
    }
    
    // Market Changes
    if (content.includes('merger') || content.includes('acquisition') || content.includes('consolidation')) {
      topics.push('Market Consolidation')
    }
    if (content.includes('budget') || content.includes('spending') || content.includes('investment') || content.includes('cost')) {
      topics.push('Budget & Investment')
    }
    
    // Channels & Platforms
    if (content.includes('social media') || content.includes('facebook') || content.includes('instagram') || content.includes('tiktok')) {
      topics.push('Social Media')
    }
    if (content.includes('search') || content.includes('google') || content.includes('seo') || content.includes('sem')) {
      topics.push('Search Marketing')
    }
    if (content.includes('programmatic') || content.includes('display') || content.includes('advertising')) {
      topics.push('Programmatic & Display')
    }
    if (content.includes('retail media') || content.includes('amazon') || content.includes('ecommerce')) {
      topics.push('Retail Media')
    }
    
    // Performance & ROI
    if (content.includes('roi') || content.includes('performance') || content.includes('conversion') || content.includes('attribution')) {
      topics.push('Performance & ROI')
    }
    
    // Customer Experience
    if (content.includes('customer experience') || content.includes('personalization') || content.includes('cx')) {
      topics.push('Customer Experience')
    }
    
    return topics.length > 0 ? topics : ['Industry News']
  }
  
  /**
   * Analyzes business context and implications
   */
  private analyzeBusinessContext(content: string, topics: string[]): {
    competitive: boolean
    regulatory: boolean
    strategic: boolean
    tactical: boolean
  } {
    return {
      competitive: content.includes('competitor') || content.includes('market share') || content.includes('advantage'),
      regulatory: content.includes('regulation') || content.includes('compliance') || content.includes('legal'),
      strategic: content.includes('strategy') || content.includes('transformation') || content.includes('future'),
      tactical: content.includes('campaign') || content.includes('execution') || content.includes('implementation')
    }
  }
  
  /**
   * Determines urgency level based on content analysis
   */
  private determineUrgency(content: string, topics: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    // High urgency indicators
    const highUrgencyKeywords = [
      'breaking', 'urgent', 'immediate', 'crisis', 'emergency',
      'deadline', 'expires', 'ending', 'final', 'last chance',
      'regulatory change', 'compliance deadline', 'market crash'
    ]
    
    // Medium urgency indicators  
    const mediumUrgencyKeywords = [
      'new', 'launch', 'announce', 'release', 'update',
      'trend', 'shift', 'change', 'growth', 'decline'
    ]
    
    if (highUrgencyKeywords.some(keyword => content.includes(keyword))) {
      return 'HIGH'
    }
    
    if (mediumUrgencyKeywords.some(keyword => content.includes(keyword)) || 
        topics.includes('Market Consolidation') || 
        topics.includes('Privacy & Compliance')) {
      return 'MEDIUM'
    }
    
    return 'LOW'
  }
  
  /**
   * Generates contextual insights based on comprehensive content analysis
   */
  private generateContextualInsights(
    title: string,
    summary: string,
    topics: string[],
    context: any,
    sourceName: string
  ): { whyItMatters: string; talkTrack: string; businessImpact: string } {
    
    // Extract specific details from the content
    const contentAnalysis = this.extractSpecificDetails(title, summary)
    
    // Generate topic-specific insights
    if (topics.includes('AI & Automation')) {
      return this.generateAIInsights(contentAnalysis, context)
    }
    
    if (topics.includes('Privacy & Compliance')) {
      return this.generatePrivacyInsights(contentAnalysis, context)
    }
    
    if (topics.includes('Market Consolidation')) {
      return this.generateConsolidationInsights(contentAnalysis, context)
    }
    
    if (topics.includes('Retail Media')) {
      return this.generateRetailMediaInsights(contentAnalysis, context)
    }
    
    if (topics.includes('Performance & ROI')) {
      return this.generatePerformanceInsights(contentAnalysis, context)
    }
    
    if (topics.includes('Data & Analytics')) {
      return this.generateDataInsights(contentAnalysis, context)
    }
    
    // Default insights based on actual content
    return this.generateGeneralInsights(title, summary, sourceName, topics)
  }
  
  /**
   * Extracts specific details, numbers, companies, etc. from content
   */
  private extractSpecificDetails(title: string, summary: string): {
    companies: string[]
    numbers: string[]
    percentages: string[]
    timeframes: string[]
    specific_claims: string[]
  } {
    const content = `${title} ${summary}`
    
    // Extract company names (basic pattern matching)
    const companies = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd))?/g) || []
    
    // Extract numbers and percentages
    const numbers = content.match(/\d+(?:\.\d+)?(?:\s*(?:billion|million|thousand|k|m|b))?/gi) || []
    const percentages = content.match(/\d+(?:\.\d+)?%/g) || []
    
    // Extract timeframes
    const timeframes = content.match(/(?:by\s+)?\d{4}|next\s+year|this\s+year|Q[1-4]|quarter/gi) || []
    
    // Extract specific claims (sentences with numbers or strong verbs)
    const sentences = content.split(/[.!?]+/)
    const specific_claims = sentences.filter(sentence => 
      /\d+/.test(sentence) || 
      /\b(?:increase|decrease|grow|decline|rise|fall|improve|worsen|double|triple|half)\b/i.test(sentence)
    ).map(s => s.trim()).filter(s => s.length > 10)
    
    return { companies, numbers, percentages, timeframes, specific_claims }
  }
  
  private generateAIInsights(details: any, context: any) {
    const hasSpecificMetric = details.percentages.length > 0 || details.numbers.length > 0
    const bestMetric = details.percentages[0] || details.numbers[0] || 'significant improvements'
    
    return {
      whyItMatters: hasSpecificMetric 
        ? `AI adoption is accelerating with measurable impact (${bestMetric}). Companies are seeing real ROI from AI investments, making this a competitive necessity rather than experimental technology.`
        : `AI development continues to reshape marketing operations. Companies that don't establish AI capabilities now risk falling behind competitors who are gaining efficiency and personalization advantages.`,
      
      talkTrack: hasSpecificMetric
        ? `Ask: "How does your current AI adoption compare to industry benchmarks?" Reference ${bestMetric} improvement data to discuss ROI opportunities.`
        : `Ask: "What's your current AI strategy for marketing operations?" Position AI solutions as competitive necessities, not nice-to-haves.`,
      
      businessImpact: context.competitive 
        ? 'Competitive advantage through automation and personalization'
        : 'Operational efficiency and customer experience improvements'
    }
  }
  
  private generatePrivacyInsights(details: any, context: any) {
    const keyTimeframe = details.timeframes[0] || 'upcoming changes'
    
    return {
      whyItMatters: details.specific_claims.length > 0
        ? `Privacy landscape is evolving rapidly with ${keyTimeframe}. This forces brands to rethink their data and targeting strategies fundamentally.`
        : 'Privacy regulations continue reshaping digital marketing. First-party data strategies are becoming essential for maintaining targeting effectiveness and compliance.',
      
      talkTrack: `Ask: "How prepared is your team for these privacy changes?" Discuss ${keyTimeframe} timeline and focus on first-party data solutions.`,
      
      businessImpact: 'Risk mitigation and sustainable targeting capabilities'
    }
  }
  
  private generateConsolidationInsights(details: any, context: any) {
    const companyNames = details.companies.slice(0, 2).join(' and ')
    
    return {
      whyItMatters: companyNames
        ? `Industry consolidation accelerates with ${companyNames} driving market changes. This creates efficiency pressure and vendor scrutiny across the ecosystem.`
        : 'Market consolidation drives efficiency pressure. Companies will scrutinize vendor relationships more closely and demand clear proof of incremental value.',
      
      talkTrack: companyNames
        ? `Ask: "How might the ${companyNames} situation affect your vendor strategy?" Focus on future-proofing and consolidation benefits.`
        : `Ask: "How are you preparing for increased competition and tighter budgets?" Emphasize measurable ROI and strategic partnerships.`,
      
      businessImpact: 'Strategic positioning and vendor relationship optimization'
    }
  }
  
  private generateRetailMediaInsights(details: any, context: any) {
    const keyNumber = details.numbers[0] || 'significant investment'
    
    return {
      whyItMatters: details.numbers.length > 0
        ? `Retail media growth continues with ${keyNumber}. This channel offers unique first-party data and closed-loop attribution capabilities.`
        : 'Retail media networks offer what traditional advertising cannot: direct connection to purchase behavior and closed-loop measurement.',
      
      talkTrack: `Ask: "What percentage of your media budget goes to retail media?" ${details.numbers[0] ? `Reference ${keyNumber} as growth benchmark.` : 'Position as essential for purchase-ready audiences.'}`,
      
      businessImpact: 'Attribution accuracy and purchase behavior insights'
    }
  }
  
  private generatePerformanceInsights(details: any, context: any) {
    const keyMetric = details.percentages[0] || 'measurable improvements'
    
    return {
      whyItMatters: details.percentages.length > 0
        ? `Performance measurement evolves with ${keyMetric} improvements. This impacts how marketing effectiveness is measured and budgets are allocated.`
        : 'Performance measurement and attribution methods are evolving rapidly, affecting how marketing ROI is calculated and demonstrated.',
      
      talkTrack: details.percentages.length > 0
        ? `Ask: "How do you currently measure campaign performance?" Reference ${keyMetric} improvement data to discuss attribution advantages.`
        : `Ask: "What are your biggest measurement challenges?" Connect this development to their attribution and performance tracking needs.`,
      
      businessImpact: 'Improved ROI measurement and budget optimization'
    }
  }
  
  private generateDataInsights(details: any, context: any) {
    const keyMetric = details.percentages[0] || details.numbers[0] || 'significant improvements'
    
    return {
      whyItMatters: details.percentages.length > 0 || details.numbers.length > 0
        ? `Data capabilities drive competitive advantage with ${keyMetric}. Companies with superior data strategies are outperforming those with traditional approaches.`
        : 'Data and analytics capabilities are becoming key differentiators in marketing effectiveness and customer understanding.',
      
      talkTrack: `Ask: "How sophisticated is your current data strategy?" ${keyMetric !== 'significant improvements' ? `Reference ${keyMetric} as industry benchmark.` : 'Position data capabilities as foundational for modern marketing.'}`,
      
      businessImpact: 'Enhanced customer insights and targeting precision'
    }
  }
  
  private generateGeneralInsights(title: string, summary: string, sourceName: string, topics: string[]) {
    const mainTopic = topics[0] || 'Industry Development'
    const contentAnalysis = this.extractSpecificDetails(title, summary)
    
    // Extract key elements for more specific insights
    const companies = contentAnalysis.companies.slice(0, 2)
    const numbers = contentAnalysis.numbers.slice(0, 2)  
    const percentages = contentAnalysis.percentages.slice(0, 2)
    
    // Generate more specific insights based on actual content
    let whyItMatters = ''
    let talkTrack = ''
    let businessImpact = ''
    
    if (companies.length > 0 && (numbers.length > 0 || percentages.length > 0)) {
      // Company + metrics
      const metric = percentages[0] || numbers[0]
      whyItMatters = `${companies[0]} developments with ${metric} impact signal significant market shifts. This affects competitive positioning and strategic planning across the ${sourceName.includes('Tech') || sourceName.includes('Mar') ? 'technology' : 'industry'} landscape.`
      talkTrack = `"Have you seen the ${companies[0]} news about ${metric}? This could impact your competitive strategy." Use this to discuss market positioning and timing advantages.`
      businessImpact = `Competitive intelligence for ${companies[0]}-related strategy decisions`
    } else if (percentages.length > 0 || numbers.length > 0) {
      // Just metrics
      const metric = percentages[0] || numbers[0]
      whyItMatters = `Market data showing ${metric} indicates shifting industry dynamics. Companies need to understand these trends to maintain competitive positioning and budget allocation effectiveness.`
      talkTrack = `"The latest data shows ${metric} - how does this align with what you're seeing?" Connect to their planning cycles and budget decisions.`
      businessImpact = `Data-driven insights for strategic planning based on ${metric} benchmark`
    } else if (companies.length > 0) {
      // Just companies
      const company = companies[0]
      whyItMatters = `${company} developments reflect broader industry trends that affect market dynamics. Understanding these changes helps anticipate customer needs and competitive pressures.`
      talkTrack = `"What's your take on the ${company} situation?" Connect to how industry changes affect their business priorities and vendor relationships.`
      businessImpact = `Industry intelligence for navigating ${company}-related market changes`
    } else {
      // Extract key themes from title/summary for more specific insights
      const titleWords = title.toLowerCase().split(' ')
      let keyTheme = 'market developments'
      
      if (titleWords.some(word => ['ad', 'ads', 'advertising', 'marketing'].includes(word))) {
        keyTheme = 'advertising strategy'
        whyItMatters = `Advertising landscape changes require proactive strategy adjustments. Companies that adapt quickly gain competitive advantages in targeting, measurement, and efficiency.`
        talkTrack = `"How is your advertising strategy adapting to these market changes?" Focus on measurement, targeting, and competitive positioning opportunities.`
        businessImpact = 'Advertising effectiveness and competitive positioning'
      } else if (titleWords.some(word => ['data', 'privacy', 'tracking'].includes(word))) {
        keyTheme = 'data strategy'
        whyItMatters = `Data and privacy developments directly impact marketing effectiveness and compliance requirements. Companies need updated strategies to maintain targeting capabilities.`
        talkTrack = `"How are these data changes affecting your marketing approach?" Discuss first-party data strategies and compliance positioning.`
        businessImpact = 'Data strategy and privacy compliance optimization'
      } else if (titleWords.some(word => ['ai', 'artificial', 'automation', 'intelligence'].includes(word))) {
        keyTheme = 'technology adoption'
        whyItMatters = `AI and automation developments indicate accelerating technology adoption across marketing operations. Early adopters gain significant efficiency and personalization advantages.`
        talkTrack = `"What's your current approach to AI in marketing?" Position technology adoption as competitive necessity rather than experimental.`
        businessImpact = 'Technology strategy and competitive positioning through automation'
      } else {
        // Final fallback with more specific language
        whyItMatters = `Industry developments from ${sourceName} indicate market shifts requiring strategic attention. Companies that stay informed about these changes maintain competitive positioning and strategic alignment.`
        talkTrack = `"Have you been following the recent ${sourceName} coverage on ${keyTheme}?" Connect to their specific challenges and strategic priorities in this area.`
        businessImpact = `Strategic intelligence for ${keyTheme} decision-making`
      }
    }
    
    return {
      whyItMatters,
      talkTrack,
      businessImpact
    }
  }
}

export const contentAnalysisService = new ContentAnalysisService() 