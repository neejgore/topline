// Newsletter Service - Handles newsletter generation and sending
// Using native fetch (Node.js v18+)
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Only initialize OpenAI client if API key is available
let openai = null
if (process.env.OPENAI_API_KEY) {
  const { OpenAI } = require('openai')
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Toggle metrics usage via environment variable
const METRICS_ENABLED = (process.env.METRICS_ENABLED || 'true').toLowerCase() !== 'false'

/**
 * Format metric value with unit for display
 */
function formatValueWithUnit(value, unit) {
  if (!unit) return value
  
  const unitLower = unit.toLowerCase()
  
  // Handle currency formats
  if (unitLower.includes('billion') && unitLower.includes('usd')) {
    return `$${value}B`
  }
  if (unitLower.includes('million') && unitLower.includes('usd')) {
    return `$${value}M`
  }
  if (unitLower.includes('trillion') && unitLower.includes('usd')) {
    return `$${value}T`
  }
  if (unitLower.includes('usd') || unitLower.includes('dollar')) {
    return `$${value}`
  }
  
  // Handle percentages
  if (unitLower.includes('percentage') || unit === '%') {
    return `${value}%`
  }
  
  // Handle units that should not have spaces
  if (unitLower.includes('gwh')) {
    return `${value} GWh`
  }
  if (unitLower.includes('million units')) {
    return `${value}M units`
  }
  if (unitLower.includes('billion')) {
    return `${value}B`
  }
  if (unitLower.includes('million')) {
    return `${value}M`
  }
  if (unitLower.includes('trillion')) {
    return `${value}T`
  }
  
  // Default: add space between value and unit
  return `${value} ${unit}`
}

/**
 * Decode HTML entities (server-side version)
 */
function decodeHtmlEntities(text) {
  if (!text) return text
  
  const entities = {
    '&#39;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#34;': '"',
    '&#38;': '&',
    '&#60;': '<',
    '&#62;': '>',
    '&#160;': ' '
  }
  
  return text.replace(/&#?\w+;/g, (entity) => entities[entity] || entity)
}

/**
 * Generate newsletter HTML content
 */
function generateNewsletterHTML(data) {
  const { metric, articles, totalArticles, date } = data
  
  // Define colors for article bars
  const articleColors = ['#2563eb', '#dc2626', '#059669'] // Blue, Red, Green
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Beacon - ${date}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8fafc;
        }
        .header {
            background-color: #1e40af;
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header .beacon-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
        }
        .header h1 {
            font-size: 36px;
            margin: 0 0 8px 0;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header .tagline {
            font-size: 16px;
            margin: 0;
            opacity: 0.9;
            font-weight: 500;
        }
        .date {
            font-size: 14px;
            margin-top: 12px;
            opacity: 0.8;
            font-weight: 500;
        }
        .content {
            background: white;
            padding: 40px 20px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #111827;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .metric-card {
            background: #f9fafb;
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        .metric-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .metric-description {
            color: #6b7280;
            margin-bottom: 16px;
        }
        .metric-meta {
            font-size: 12px;
            color: #9ca3af;
        }
        .metric-tag {
            background: #e5e7eb;
            padding: 4px 8px;
            border-radius: 12px;
            margin-right: 8px;
        }
        .metric-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .metric-column h4 {
            font-weight: 600;
            margin-bottom: 8px;
            color: #111827;
        }
        .metric-column p {
            font-size: 14px;
            color: #6b7280;
        }
        .article {
            padding-left: 16px;
            margin-bottom: 20px;
        }
        .article h3 {
            font-size: 16px;
            margin-bottom: 8px;
            color: #111827;
        }
        .article p {
            color: #6b7280;
            margin-bottom: 8px;
        }
        .article-meta {
            font-size: 12px;
            color: #9ca3af;
        }
        .cta {
            background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%);
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 40px;
        }
        .cta h3 {
            margin-bottom: 8px;
            color: #111827;
        }
        .cta p {
            color: #6b7280;
            margin-bottom: 16px;
        }
        .cta-button {
            background: #2563eb;
            color: white !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            display: inline-block;
            border: 2px solid #2563eb;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background: #1d4ed8;
            border-color: #1d4ed8;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
        @media (max-width: 600px) {
            .metric-columns {
                grid-template-columns: 1fr;
            }
            .header {
                padding: 24px 16px;
            }
            .content {
                padding: 24px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
                        <div class="beacon-icon">🔔</div>
        <h1>The Beacon</h1>
        <div class="tagline">AI-Powered Sales Intelligence</div>
        <div class="date">${date}</div>
    </div>
    
    <div class="content">
        ${metric ? `
        <div class="section">
            <h2>📊 Need-to-know Metric</h2>
            <div class="metric-card">
                <div class="metric-value">${formatValueWithUnit(metric.value, metric.unit || '')}</div>
                <div class="metric-title">${decodeHtmlEntities(metric.title || '')}</div>
                <div class="metric-meta">
                    <span class="metric-tag">${metric.vertical || 'General'}</span>
                    ${metric.source ? `Source: ${decodeHtmlEntities(metric.source)}` : ''}
                </div>
                <div class="metric-columns">
                    <div class="metric-column">
                        <h4>What This Means</h4>
                        <p>${decodeHtmlEntities(metric.explanation || metric.summary || metric.context || 'Key metric for understanding market trends')}</p>
                    </div>
                    <div class="metric-column">
                        <h4>How to Use This</h4>
                        <p>${decodeHtmlEntities(metric.whyItMatters || metric.explanation || 'Key metric for understanding market trends')}</p>
                    </div>
                    <div class="metric-column">
                        <h4>Talk Track</h4>
                        <p style="margin-bottom: 16px;">${decodeHtmlEntities(metric.talkTrack || 'Use this metric to guide conversations about market positioning and competitive advantage')}</p>
                        <a href="https://belldesk.ai/?expand=sales-intelligence&metric=${metric.id}" 
                           style="background: #059669; color: white !important; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 12px; display: inline-block; text-align: center; border: 2px solid #059669; transition: all 0.3s ease;">
                           🎯 Generate Perfect Prospecting Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${articles && articles.length > 0 ? `
        <div class="section">
            <h2>📰 Top 3 Articles of <a href="https://belldesk.ai/" style="color: #2563eb; text-decoration: none; border-bottom: 2px solid #2563eb;">${totalArticles} You Should Know</a></h2>
            ${articles.map((article, index) => `
            <div class="article" style="border-left: 4px solid ${articleColors[index % articleColors.length]};">
                <h3><a href="https://belldesk.ai/" style="color: #111827; text-decoration: none; border-bottom: 1px solid #e5e7eb;">${decodeHtmlEntities(article.title || '')}</a></h3>
                <p>${decodeHtmlEntities(article.summary || '')}</p>
                <div class="article-meta">
                    <span class="metric-tag">${article.vertical || 'General'}</span>
                    ${article.sourceName ? `Source: ${article.sourceName}` : ''}
                </div>
                <div class="metric-columns" style="margin-top: 12px;">
                    <div class="metric-column">
                        <h4>Why It Matters</h4>
                        <p style="margin-bottom: 12px;">${decodeHtmlEntities(article.whyItMatters || 'Relevant industry development')}</p>
                        <a href="https://belldesk.ai/?expand=sales-intelligence" style="color: #2563eb; text-decoration: none; font-size: 12px; font-weight: 500;">See full insight →</a>
                    </div>
                    <div class="metric-column">
                        <h4>Talk Track</h4>
                        <p style="margin-bottom: 12px; font-size: 14px;">${decodeHtmlEntities(article.talkTrack || 'Use this insight to start conversations about industry trends')}</p>
                        <a href="https://belldesk.ai/?expand=sales-intelligence&article=${article.id}" 
                           style="background: #059669; color: white !important; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 11px; display: inline-block; text-align: center; border: 1px solid #059669; margin-top: 4px;">
                           🎯 Generate Prospecting Email
                        </a>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        ` : `
        <div class="section">
            <h2>📰 Latest Intelligence</h2>
            <div class="article">
                <h3>No new articles today</h3>
                <p>Check back tomorrow for fresh sales intelligence insights, or visit BellDesk AI for our archive.</p>
            </div>
        </div>
        `}
        
        <div class="cta">
            <h3>Want more insights?</h3>
            <p>Visit BellDesk AI for archived content and additional intelligence</p>
            <a href="https://belldesk.ai" class="cta-button">Visit BellDesk AI</a>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2024 BellDesk AI. All rights reserved.</p>
        <p>You're receiving this because you subscribed to The Beacon updates.</p>
    </div>
</body>
</html>
  `
}

/**
 * Get newsletter content from APIs
 */
async function getNewsletterContent(baseUrl) {
  console.log('🔍 Getting newsletter content from:', baseUrl)
  
  try {
    // Optionally fetch daily metric (published only)
    let metric = null
    if (METRICS_ENABLED) {
      console.log('📊 Fetching metrics...')
      const metricsUrl = `${baseUrl}/api/metrics?limit=1&status=PUBLISHED`
      console.log('Metrics URL:', metricsUrl)
      
      const metricsResponse = await fetch(metricsUrl)
      console.log('Metrics response status:', metricsResponse.status)
      
      if (!metricsResponse.ok) {
        console.error('Metrics API error:', metricsResponse.status, await metricsResponse.text())
      }
      
      const metricsData = await metricsResponse.json()
      console.log('Metrics found:', metricsData.metrics?.length || 0)
      if (metricsData.metrics?.[0]) {
        console.log('📊 Using metric:', metricsData.metrics[0].title, '-', metricsData.metrics[0].value, metricsData.metrics[0].unit)
      }
      
      // Log metric info for debugging
      metric = metricsData.metrics?.[0] || null
      if (metric) {
        const metricDate = new Date(metric.publishedAt)
        console.log('📊 Metric timestamp:', metricDate.toISOString())
        console.log('📊 Metric age:', Math.round((Date.now() - metricDate.getTime()) / (1000 * 60 * 60)), 'hours ago')
      }
    } else {
      console.log('⏭️  Metrics disabled via METRICS_ENABLED=false; skipping metric fetch')
    }
    
    // Fetch recent articles (published only)
    console.log('📰 Fetching articles...')
    const articlesUrl = `${baseUrl}/api/content?limit=10&status=PUBLISHED`
    console.log('Articles URL:', articlesUrl)
    
    const articlesResponse = await fetch(articlesUrl)
    console.log('Articles response status:', articlesResponse.status)
    
    if (!articlesResponse.ok) {
      console.error('Articles API error:', articlesResponse.status, await articlesResponse.text())
    }
    
    const articlesData = await articlesResponse.json()
    console.log('Articles found:', articlesData.content?.length || 0)
    
    // Log article info for debugging
    const articles = articlesData.content || []
    if (articles.length > 0) {
      console.log('📰 Article timestamps:')
      articles.slice(0, 3).forEach((article, index) => {
        const articleDate = new Date(article.publishedAt)
        console.log(`  ${index + 1}. ${article.title} - ${articleDate.toISOString()} (${Math.round((Date.now() - articleDate.getTime()) / (1000 * 60 * 60))} hours ago)`)
      })
    }

    // Generate proper date in EST
    const estDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    })

    // Sort articles by publishedAt (newest first) and take top 3
    // Prioritize freshness over importance score for newsletter content
    const allArticles = articlesData.content || []
    const sortedArticles = allArticles.sort((a, b) => {
      const aDate = new Date(a.publishedAt)
      const bDate = new Date(b.publishedAt)
      return bDate - aDate // Newest first
    })
    
    const result = {
      metric: metric,
      articles: sortedArticles.slice(0, 3), // Top 3 articles
      totalArticles: allArticles.length,    // Total count for display
      date: estDate
    }
    
    console.log('📋 Newsletter content result:')
    console.log('- Metric:', result.metric ? result.metric.title : 'None')
    console.log('- Articles:', result.articles.length)
    console.log('- Date:', result.date)
    
    return result
  } catch (error) {
    console.error('❌ Error fetching newsletter content:', error)
    
    // Generate fallback date in EST
    const fallbackDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    })
    
    return {
      metric: null,
      articles: [],
      totalArticles: 0,
      date: fallbackDate
    }
  }
}

/**
 * Get all active subscribers from Brevo List ID 3
 */
async function getActiveSubscribers(supabase) {
  try {
    console.log('📧 Fetching subscribers from Brevo List ID 3...')
    
    // First try to get from Brevo List ID 3
    const brevoSubscribers = await getBrevoListSubscribers(3)
    
    if (brevoSubscribers.length > 0) {
      console.log(`✅ Found ${brevoSubscribers.length} subscribers from Brevo List ID 3`)
      return brevoSubscribers
    }
    
    // Fallback to Supabase if Brevo fails
    console.log('📧 Falling back to Supabase database...')
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('isActive', true)

    if (error) {
      console.error('Error fetching subscribers from Supabase:', error)
      return []
    }

    console.log(`✅ Found ${subscribers?.length || 0} subscribers from Supabase`)
    return subscribers || []
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
}

/**
 * Get subscribers from Brevo List ID
 */
async function getBrevoListSubscribers(listId = 3) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts/lists/${listId}/contacts`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const subscribers = data.contacts || []
    
    // Transform Brevo format to our format
    return subscribers.map(contact => ({
      email: contact.email,
      name: contact.attributes?.FIRSTNAME || contact.email.split('@')[0] || ''
    }))
  } catch (error) {
    console.error('Error fetching Brevo subscribers:', error)
    throw error
  }
}

/**
 * Format metric value for subject line display
 */
function formatValueForSubject(value, unit) {
  if (!unit) return value
  
  const unitLower = unit.toLowerCase()
  
  // Handle percentages
  if (unitLower.includes('percentage') || unit === '%') {
    return `${value}%`
  }
  
  // Handle USD currency
  if (unitLower.includes('billion') && unitLower.includes('usd')) {
    return `$${value}B`
  }
  if (unitLower.includes('million') && unitLower.includes('usd')) {
    return `$${value}M`
  }
  if (unitLower === 'usd') {
    return `$${value}`
  }
  
  // Handle large numbers
  if (unitLower.includes('billion')) {
    return `${value}B`
  }
  if (unitLower.includes('million')) {
    return `${value}M`
  }
  
  // Default: add space between value and unit
  return `${value} ${unit}`
}

/**
 * Helper function to generate current date string
 */
function getCurrentDateString() {
  const today = new Date()
  return today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/New_York'
  })
}

/**
 * Generate AI-powered subject line based on content
 */
async function generateSubjectLine(metric, articles) {
  if (!openai) {
    // Fallback to descriptive subject if no OpenAI key - include metric value
    const currentDate = getCurrentDateString()
    if (metric) {
      // Extract metric title and include value with proper formatting
      const cleanTitle = metric.title.replace(/\s*\([^)]*\)\s*$/, '').trim()
      const value = formatValueForSubject(metric.value, metric.unit)
      return `🔔 ${cleanTitle} at ${value} - Act Now!`
    }
    if (articles.length > 0) {
      return `🔔 ${articles[0].title.substring(0, 40)}... - Key Insights`
    }
    return `🔔 Daily Sales Intelligence - ${currentDate}`
  }

  try {
    const contentSummary = {
      metric: metric ? {
        title: metric.title,
        value: metric.value,
        vertical: metric.vertical,
        priority: metric.priority
      } : null,
      articles: articles.slice(0, 3).map(article => ({
        title: article.title,
        vertical: article.vertical,
        priority: article.priority
      }))
    }

    const prompt = `
You are an expert at writing compelling email subject lines for B2B sales intelligence newsletters targeting MarTech/AdTech/CRM professionals.

Today's content includes:
${metric ? `METRIC: ${metric.title} - VALUE: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''} - Vertical: ${metric.vertical}` : ''}
${articles.length > 0 ? `TOP ARTICLES: ${articles.map(a => `"${a.title}" (${a.vertical})`).join(', ')}` : ''}

Write a compelling subject line that:
1. Starts with "🔔" (bell emoji)
2. NEVER includes "The Beacon:" or any brand name in the subject line
3. INCLUDES THE SPECIFIC METRIC VALUE when focusing on metrics (e.g., "Mobile Commerce at 45.2%" not just "Mobile Commerce")
4. Highlights the most actionable insight for sales professionals
5. Creates urgency and curiosity for MarTech/AdTech decision-makers
6. Is under 65 characters total
7. Uses concrete numbers and percentages when available
8. Ends with action-oriented phrases like "- Act Now!", "- Key Insights", "- Time to Act!"

IMPORTANT: Do NOT include "The Beacon:" or any brand name in the subject line. Just start with 🔔 and the content.

Examples of good subject lines:
- "🔔 Mobile Commerce at 45.2% - Act Now!"
- "🔔 CTV Ad Spend Hits $18.9B - Key Insights"
- "🔔 73% of CMOs Shift Budget to AI Tools - Time to Act!"

Choose the metric with its specific value OR the most compelling article as the main focus.

Respond with just the subject line, nothing else.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert email marketer specializing in B2B sales intelligence newsletters. Always respond with just the subject line. NEVER include 'The Beacon:' or any brand name in the subject line. Start with 🔔 emoji and the content only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    })

    const subject = response.choices[0].message.content.trim()
    return subject

  } catch (error) {
    console.error('Error generating AI subject line:', error)
    
    // Fallback to content-based subject with metric values
    const currentDate = getCurrentDateString()
    if (metric) {
      // Extract metric title and include value with proper formatting
      const cleanTitle = metric.title.replace(/\s*\([^)]*\)\s*$/, '').trim()
      const value = formatValueForSubject(metric.value, metric.unit)
      return `🔔 ${cleanTitle} at ${value} - Act Now!`
    }
    if (articles.length > 0) {
      return `🔔 ${articles[0].title.substring(0, 40)}... - Key Insights`
    }
    return `🔔 Daily Sales Intelligence - ${currentDate}`
  }
}

/**
 * Send newsletter via Brevo Campaign API (to List ID 3)
 * This keeps all subscriber emails private and sends individual emails
 */
async function sendNewsletterEmail(htmlContent, subject, subscribers) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    console.log('📧 Creating Brevo email campaign...')
    
    // Create email campaign using Brevo Campaign API
    const campaignResponse = await fetch(`${BREVO_API_URL}/emailCampaigns`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: `The Beacon - ${new Date().toISOString().split('T')[0]}`,
        subject: subject,
        sender: {
          name: 'The Beacon',
          email: 'beacon@belldesk.ai'
        },
        type: 'classic',
        htmlContent: htmlContent,
        recipients: {
          listIds: [3] // Send to List ID 3 - keeps all emails private
        },
        scheduledAt: new Date(Date.now() + 30000).toISOString() // Send in 30 seconds
      })
    })

    if (!campaignResponse.ok) {
      const errorData = await campaignResponse.json()
      throw new Error(`Brevo Campaign API error: ${campaignResponse.status} - ${JSON.stringify(errorData)}`)
    }

    const campaignResult = await campaignResponse.json()
    console.log(`✅ Created campaign ${campaignResult.id} and scheduled for immediate delivery`)
    
    return {
      success: true,
      campaignId: campaignResult.id,
      message: `Campaign created and scheduled for List ID 3`,
      recipientCount: subscribers.length
    }
  } catch (error) {
    console.error('❌ Error sending newsletter campaign:', error)
    throw error
  }
}

/**
 * Generate and send daily newsletter
 */
async function generateAndSendNewsletter(supabase, baseUrl) {
  try {
    // Get newsletter content
    const content = await getNewsletterContent(baseUrl)
    
    // Generate HTML
    const htmlContent = generateNewsletterHTML(content)
    
    // Get subscribers
    const subscribers = await getActiveSubscribers(supabase)
    
    if (subscribers.length === 0) {
      console.log('No active subscribers found')
      return { success: true, message: 'No active subscribers', count: 0 }
    }

    // Generate AI-powered subject line
    const subject = await generateSubjectLine(content.metric, content.articles)
    
    // Send newsletter
    const result = await sendNewsletterEmail(htmlContent, subject, subscribers)
    
    console.log(`Newsletter sent successfully to ${subscribers.length} subscribers`)
    
    return {
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      count: subscribers.length,
      brevoResult: result
    }
  } catch (error) {
    console.error('Error generating and sending newsletter:', error)
    return {
      success: false,
      error: error.message,
      count: 0
    }
  }
}

module.exports = {
  generateNewsletterHTML,
  getNewsletterContent,
  generateAndSendNewsletter,
  generateSubjectLine
} 