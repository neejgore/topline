// Newsletter Service - Handles newsletter generation and sending
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'
const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Format metric value with unit for display
 */
function formatValueWithUnit(value, unit) {
  if (unit?.toLowerCase().includes('billion') && unit?.toLowerCase().includes('usd')) {
    return `$${value}B`
  }
  if (unit?.toLowerCase().includes('million') && unit?.toLowerCase().includes('usd')) {
    return `$${value}M`
  }
  if (unit?.toLowerCase().includes('percentage') || unit === '%') {
    return `${value}%`
  }
  return `${value}${unit ? ` ${unit}` : ''}`
}

/**
 * Generate newsletter HTML content
 */
function generateNewsletterHTML(data) {
  const { metric, articles, date } = data
  
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
            background: linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
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
            position: relative;
            z-index: 1;
        }
        .header .tagline {
            font-size: 16px;
            margin: 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
            font-weight: 500;
        }
        .date {
            font-size: 14px;
            margin-top: 12px;
            opacity: 0.8;
            position: relative;
            z-index: 1;
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
            grid-template-columns: 1fr 1fr;
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
            border-left: 4px solid #2563eb;
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
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            display: inline-block;
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
        <div class="beacon-icon">🔥</div>
        <h1>The Beacon</h1>
        <div class="tagline">AI-Powered Sales Intelligence</div>
        <div class="date">${date}</div>
    </div>
    
    <div class="content">
        ${metric ? `
        <div class="section">
            <h2>📊 Need-to-know Metric</h2>
            <div class="metric-card">
                <div class="metric-value">${formatValueWithUnit(metric.value, metric.unit)}</div>
                <div class="metric-title">${metric.title}</div>
                <div class="metric-description">${metric.description}</div>
                <div class="metric-meta">
                    <span class="metric-tag">${metric.vertical}</span>
                    Source: ${metric.source}
                </div>
                <div class="metric-columns">
                    <div class="metric-column">
                        <h4>How to Use This</h4>
                        <p>${metric.howToUse || metric.whyItMatters}</p>
                    </div>
                    <div class="metric-column">
                        <h4>Talk Track</h4>
                        <p>${metric.talkTrack}</p>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${articles.length > 0 ? `
        <div class="section">
            <h2>📰 Latest Intelligence</h2>
            ${articles.map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-meta">
                    <span class="metric-tag">${article.vertical}</span>
                    ${article.source}
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="cta">
            <h3>Want more insights?</h3>
            <p>Visit BellDesk AI for archived content and additional intelligence</p>
            <a href="https://topline-tlwi.vercel.app" class="cta-button">Visit BellDesk AI</a>
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
  try {
    // Fetch daily metric (published only)
    const metricsResponse = await fetch(`${baseUrl}/api/metrics?limit=1&status=PUBLISHED`)
    const metricsData = await metricsResponse.json()
    
    // Fetch recent articles (published only)
    const articlesResponse = await fetch(`${baseUrl}/api/content?limit=3&status=PUBLISHED`)
    const articlesData = await articlesResponse.json()

    return {
      metric: metricsData.metrics?.[0] || null,
      articles: articlesData.articles || articlesData.content || [],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      })
    }
  } catch (error) {
    console.error('Error fetching newsletter content:', error)
    return {
      metric: null,
      articles: [],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      })
    }
  }
}

/**
 * Get all active subscribers
 */
async function getActiveSubscribers(supabase) {
  try {
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('isActive', true)

    if (error) {
      console.error('Error fetching subscribers:', error)
      return []
    }

    return subscribers || []
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
}

/**
 * Generate AI-powered subject line based on content
 */
async function generateSubjectLine(metric, articles) {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to simple subject if no OpenAI key
    if (metric) {
      return `🔥 The Beacon: ${metric.title}`
    }
    if (articles.length > 0) {
      return `🔥 The Beacon: ${articles[0].title}`
    }
    return `🔥 The Beacon: Daily Sales Intelligence`
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
You are an expert at writing compelling email subject lines for sales intelligence newsletters.

Today's content includes:
${metric ? `METRIC: ${metric.title} (${metric.value}) - ${metric.vertical} - Priority: ${metric.priority}` : ''}
${articles.length > 0 ? `ARTICLES: ${articles.map(a => `${a.title} (${a.vertical}, Priority: ${a.priority})`).join(', ')}` : ''}

Write a compelling subject line for "The Beacon" newsletter that:
1. Starts with "🔥 The Beacon:"
2. Highlights the most important/relevant content (metric OR top article)
3. Creates urgency and interest for enterprise sales professionals
4. Is under 60 characters total
5. Focuses on the highest priority content

Choose either the metric or the highest priority article as the main focus.

Respond with just the subject line, nothing else.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert email marketer specializing in B2B sales intelligence newsletters. Always respond with just the subject line."
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
    
    // Fallback to content-based subject
    if (metric) {
      return `🔥 The Beacon: ${metric.title}`
    }
    if (articles.length > 0) {
      return `🔥 The Beacon: ${articles[0].title}`
    }
    return `🔥 The Beacon: Daily Sales Intelligence`
  }
}

/**
 * Send newsletter via Brevo
 */
async function sendNewsletterEmail(htmlContent, subject, subscribers) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'The Beacon',
          email: 'Beacon@BellDesk.ai'
        },
        to: subscribers.map(sub => ({
          email: sub.email,
          name: sub.name || ''
        })),
        subject: subject,
        htmlContent: htmlContent
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending newsletter:', error)
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