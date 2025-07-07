#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Configuration
const TEST_EMAIL = 'neej.gore@gmail.com'
const TEST_NAME = 'Neej'
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Sample content (using real data from APIs)
const testContent = {
  metric: {
    title: "AI Marketing Spend Q3 2024",
    value: "42.8",
    unit: "billion USD",
    description: "The AI Marketing Spend of 42.8 billion USD in Q3 2024 signals a crucial shift in budget allocation for enterprises as they prioritize digital transformation initiatives.",
    source: "AI Marketing Report Q3 2024",
    howToUse: "This metric allows decision-makers to benchmark their spending against competitors and identify emerging trends in the technology and media sectors.",
    talkTrack: "With AI marketing spend reaching 42.8 billion USD, it's clear that businesses are doubling down on digital transformation. This validates the necessity of investing in AI-driven solutions.",
    vertical: "Technology & Media"
  },
  articles: [
    {
      title: "In CTV, retail media and emerging channels, third-party data is more important than ever",
      summary: "Connected TV and retail media are dominating advertiser attention — and their budgets. CTV ad spending is projected to reach $33.35 billion this year, while retail media's 19.7% growth will be more than double the growth in overall digital advertising.",
      source: "Digiday",
      vertical: "Technology & Media"
    },
    {
      title: "Hogarth's Glasson On Cannes, How AI Is Transforming Content Production",
      summary: "Cannes is changing in a good way, says Richard Glasson, CEO of WPP's production operation Hogarth Worldwide. And so is his business, thanks to rapid developments in artificial intelligence.",
      source: "MediaPost",
      vertical: "Technology & Media"
    },
    {
      title: "ChatGPT Named This Pickle Campaign -- And It Slaps",
      summary: "Cleveland Kitchen taps AI and a risque slogan to push its lightly fermented pickles into 15,000 stores -- and disrupt a crowded category.",
      source: "MediaPost",
      vertical: "Technology & Media"
    },
    {
      title: "Marketing results don't add. They multiply and synergize",
      summary: "Traditional metrics can't capture how campaigns interact. Test for multiplicative and synergistic effects and rethink paid media measurement.",
      source: "MarTech Today",
      vertical: "Technology & Media"
    },
    {
      title: "5 Amazon Ads features you're not using — but should be",
      summary: "Missed these Amazon Ads features? Catch up on Attribution, Prime Video and more ways to drive better, data-backed campaigns.",
      source: "MarTech Today",
      vertical: "Technology & Media"
    },
    {
      title: "Podcast companies turn to live events to capture growing advertiser spend",
      summary: "The surge in the number of live podcast events in 2025 reflects a broader shift: advertisers are betting bigger on podcasts — not just as an audio channel but as a full-fledged creator economy play.",
      source: "Digiday",
      vertical: "Technology & Media"
    },
    {
      title: "Best Buy, Lowe's chief marketing officers explain why they launched new influencer programs",
      summary: "CMOs launched these new programs in response to the growing importance of influencers in recommending products.",
      source: "Digiday",
      vertical: "Technology & Media"
    }
  ],
  date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  })
}

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
 * Generate The Beacon HTML newsletter
 */
function generateBeaconHTML(data) {
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
                        <p>${metric.howToUse}</p>
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
 * Send test email via Brevo
 */
async function sendTestEmail(htmlContent, subject, email, name) {
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
        to: [{
          email: email,
          name: name
        }],
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
    console.error('Error sending test email:', error)
    throw error
  }
}

/**
 * Main function
 */
async function sendDirectBeacon() {
  try {
    console.log('🔥 Generating The Beacon newsletter with 7 articles...')
    
    // Generate HTML
    console.log('🎨 Generating HTML...')
    const htmlContent = generateBeaconHTML(testContent)
    
    // Subject line
    const subject = `🔥 The Beacon: ${testContent.metric.title} + 7 Key Articles`
    
    console.log(`📧 Subject: ${subject}`)
    console.log(`📊 Metric: ${testContent.metric.title}`)
    console.log(`📰 Articles: ${testContent.articles.length}`)
    
    // Send test email
    console.log(`📤 Sending newsletter to ${TEST_EMAIL}...`)
    const result = await sendTestEmail(htmlContent, subject, TEST_EMAIL, TEST_NAME)
    
    console.log('✅ The Beacon newsletter sent successfully!')
    console.log(`📧 Email sent to: ${TEST_EMAIL}`)
    console.log(`📋 Subject: ${subject}`)
    console.log(`🆔 Brevo Message ID: ${result.messageId}`)
    
    return {
      success: true,
      recipient: TEST_EMAIL,
      subject: subject,
      messageId: result.messageId,
      articleCount: testContent.articles.length
    }
    
  } catch (error) {
    console.error('❌ Error sending The Beacon:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the script
sendDirectBeacon()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 The Beacon sent successfully!')
      console.log(`📊 Full newsletter with ${result.articleCount} articles delivered!`)
    } else {
      console.log('\n💥 Failed to send The Beacon:', result.error)
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 Script error:', error)
    process.exit(1)
  }) 