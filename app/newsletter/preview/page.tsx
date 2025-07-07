'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

// Remove server-side metadata since this is now client-side
// export const metadata: Metadata = {
//   title: 'Newsletter Preview | BellDesk AI',
//   description: 'Preview of the daily BellDesk AI newsletter',
// }

interface NewsletterContent {
  metric: any | null
  articles: any[]
  date: string
}

function useNewsletterContent(): NewsletterContent & { loading: boolean } {
  const [content, setContent] = useState<NewsletterContent>({
    metric: null,
    articles: [],
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    })
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch daily metric
        const metricsResponse = await fetch('/api/metrics?limit=1&status=PUBLISHED')
        const metricsData = await metricsResponse.json()
        
        // Fetch recent articles
        const articlesResponse = await fetch('/api/content?limit=10&status=PUBLISHED')
        const articlesData = await articlesResponse.json()

        setContent({
          metric: metricsData.metrics?.[0] || null,
          articles: articlesData.content || articlesData.articles || [],
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/New_York'
          })
        })
      } catch (error) {
        console.error('Error fetching newsletter content:', error)
        // Keep default content on error
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  return { ...content, loading }
}

function formatValueWithUnit(value: number, unit: string): string {
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

export default function NewsletterPreview() {
  const { metric, articles, date, loading } = useNewsletterContent()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading newsletter preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Preview</h1>
          <p className="text-gray-600">This is how your daily newsletter will appear to subscribers</p>
          <div className="mt-4 flex items-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Refresh Preview
            </button>
            <span className="text-sm text-gray-500">Shows latest content with {articles.length} articles</span>
          </div>
        </div>

        {/* Newsletter Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Newsletter Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 text-white p-6 sm:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-2xl mb-2">🔔</div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">The Beacon</h1>
              <p className="text-blue-100 text-lg">AI-Powered Sales Intelligence</p>
              <p className="text-blue-200 text-sm mt-2">{date}</p>
            </div>
          </div>

          {/* Newsletter Body */}
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl mx-auto">
              
              {/* Daily Metric Section */}
              {metric ? (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Today's Key Metric</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column: Metric and Description */}
                      <div className="lg:col-span-1">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {formatValueWithUnit(metric.value, metric.unit)}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{metric.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                            {metric.vertical}
                          </span>
                          Source: {metric.source}
                        </div>
                      </div>

                      {/* Middle Column: How to Use This */}
                      <div className="lg:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-2">How to Use This</h4>
                        <p className="text-sm text-gray-600">{metric.howToUse || metric.whyItMatters}</p>
                      </div>

                      {/* Right Column: Talk Track */}
                      <div className="lg:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Talk Track</h4>
                        <p className="text-sm text-gray-600">{metric.talkTrack}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Today's Key Metric</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-500 text-center">No metric available for today</p>
                  </div>
                </div>
              )}

              {/* Articles Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📰 Latest Intelligence</h2>
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article: any, index: number) => (
                      <div key={article.id} className="border-l-4 border-blue-600 pl-4 py-2">
                        <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                            {article.vertical}
                          </span>
                          <span>{article.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-500 text-center">No articles available</p>
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Want more insights?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Visit BellDesk AI for archived content and additional intelligence
                </p>
                <a 
                  href="https://topline-tlwi.vercel.app" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Visit BellDesk AI
                </a>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>© 2024 BellDesk AI. All rights reserved.</p>
                <p className="mt-1">
                  You're receiving this because you subscribed to BellDesk AI updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 