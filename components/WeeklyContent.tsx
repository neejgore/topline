import { getPublishedArticlesDirect, getPublishedMetricsDirect } from '@/lib/content-direct'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import { Newspaper, TrendingUp } from 'lucide-react'

// Import verticals from VerticalFilter to ensure consistency
import { VERTICALS } from './VerticalFilter'

export default async function WeeklyContent() {
  const [articles, metrics] = await Promise.all([
    getPublishedArticlesDirect(),
    getPublishedMetricsDirect()
  ])

  // Limit articles to 15 and metrics to 9
  const limitedArticles = articles.slice(0, 15)
  const limitedMetrics = metrics.slice(0, 9)

  return (
    <div className="space-y-8">
      {/* Articles Grid Section */}
      <section>
        <div className="flex items-center mb-6">
          <Newspaper className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">📰 This Week's Topline</h2>
          <span className="ml-2 text-sm text-gray-500">({limitedArticles.length}/15)</span>
        </div>
        
        {limitedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {limitedArticles.map((article: any) => (
              <div key={article.id} className="break-inside-avoid">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No articles published this week. Check back Tuesday for fresh insights!
            </p>
          </div>
        )}
      </section>

      {/* Metrics Grid Section */}
      <section>
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-accent-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">📊 Metrics That Move the Needle</h2>
          <span className="ml-2 text-sm text-gray-500">({limitedMetrics.length}/9)</span>
        </div>
        
        {limitedMetrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {limitedMetrics.map((metric: any) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No metrics published this week. Check back Tuesday for fresh data insights!
            </p>
          </div>
        )}
      </section>

      {/* Talk Track Fuel Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl mr-2">🎯</span>
          <h2 className="text-xl font-bold text-gray-900">Talk Track Fuel</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Ready-to-use conversation starters and objection-handling insights are embedded 
            within each article and metric above. Look for the green "Talk Track" sections.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/70 rounded p-3">
              <strong className="text-green-800">For Articles:</strong> Use the "Why it Matters" context to frame market conversations
            </div>
            <div className="bg-white/70 rounded p-3">
              <strong className="text-blue-800">For Metrics:</strong> Reference data points to support your business case
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 