import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter Preview | Topline',
  description: 'Preview of the daily Topline newsletter',
}

async function getNewsletterContent() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'

  try {
    // Fetch daily metric
    const metricsResponse = await fetch(`${baseUrl}/api/metrics?limit=1`, {
      next: { revalidate: 0 } // Always fetch fresh data
    })
    const metricsData = await metricsResponse.json()
    
    // Fetch recent articles
    const articlesResponse = await fetch(`${baseUrl}/api/content?limit=3`, {
      next: { revalidate: 0 }
    })
    const articlesData = await articlesResponse.json()

    return {
      metric: metricsData.metrics?.[0] || null,
      articles: articlesData.articles || [],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
        day: 'numeric'
      })
    }
  }
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

export default async function NewsletterPreview() {
  const { metric, articles, date } = await getNewsletterContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Preview</h1>
          <p className="text-gray-600">This is how your daily newsletter will appear to subscribers</p>
          <div className="mt-4 flex items-center gap-4">
            <a 
              href="/newsletter/preview"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Refresh Preview
            </a>
            <span className="text-sm text-gray-500">Auto-refreshes with latest content</span>
          </div>
        </div>

        {/* Newsletter Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Newsletter Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Topline</h1>
              <p className="text-blue-100 text-lg">Daily sales intelligence</p>
              <p className="text-blue-200 text-sm mt-2">{date}</p>
            </div>
          </div>

          {/* Newsletter Body */}
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl mx-auto">
              
              {/* Daily Metric Section */}
              {metric ? (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Need-to-know Metric</h2>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Need-to-know Metric</h2>
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
                  Visit Topline for archived content and additional intelligence
                </p>
                <a 
                  href="https://topline-tlwi.vercel.app" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Visit Topline
                </a>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>© 2024 Topline. All rights reserved.</p>
                <p className="mt-1">
                  You're receiving this because you subscribed to Topline updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 