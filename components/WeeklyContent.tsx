import { getPublishedArticles, getPublishedMetrics } from '@/lib/content'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import { Newspaper, TrendingUp } from 'lucide-react'

export default async function WeeklyContent() {
  const [articles, metrics] = await Promise.all([
    getPublishedArticles(),
    getPublishedMetrics()
  ])

  return (
    <div className="space-y-12">
      {/* Top News Section */}
      <section className="newsletter-section">
        <div className="flex items-center mb-6">
          <Newspaper className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">📰 This Week's Topline</h2>
        </div>
        
        <div className="space-y-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">
                No articles published this week. Check back Monday for fresh insights!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Metrics Section */}
      <section className="newsletter-section">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-accent-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">📊 Metrics That Move the Needle</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {metrics.length > 0 ? (
            metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))
          ) : (
            <div className="md:col-span-2">
              <div className="card text-center py-12">
                <p className="text-gray-500">
                  No metrics published this week. Check back Monday for fresh data insights!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Talk Track Fuel Section */}
      <section className="newsletter-section">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-2">🎯</span>
          <h2 className="text-2xl font-bold text-gray-900">Talk Track Fuel</h2>
        </div>
        
        <div className="card">
          <p className="text-gray-600 mb-4">
            Ready-to-use conversation starters and objection-handling insights are embedded 
            within each article and metric above. Look for the green "Talk Track" sections.
          </p>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-800">
              <strong>Pro tip:</strong> Use these insights in your next customer conversation 
              to demonstrate market awareness and strategic thinking.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 