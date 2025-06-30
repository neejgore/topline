'use client'

import { useState, useEffect } from 'react'
import VerticalFilter from './VerticalFilter'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import LoadingSpinner from './LoadingSpinner'
import { Newspaper, TrendingUp } from 'lucide-react'

interface Article {
  id: string
  title: string
  summary: string
  sourceUrl: string
  sourceName: string
  whyItMatters: string
  talkTrack: string
  category: string
  vertical: string
  priority: string
  status: string
  publishedAt: string
  tags?: any[]
}

interface Metric {
  id: string
  title: string
  value: string
  description: string
  source: string
  howToUse: string
  talkTrack: string
  vertical: string
  priority: string
  status: string
  publishedAt: string
  tags?: any[]
}

export default function WeeklyContentWithFilter() {
  const [articles, setArticles] = useState<Article[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const fetchContent = async (vertical: string) => {
    setLoading(true)
    try {
      // Fetch filtered articles and metrics
      const [articlesRes, metricsRes] = await Promise.all([
        fetch(`/api/content/filtered?vertical=${vertical}&type=articles`),
        fetch(`/api/content/filtered?vertical=${vertical}&type=metrics`)
      ])

      if (articlesRes.ok && metricsRes.ok) {
        const articlesData = await articlesRes.json()
        const metricsData = await metricsRes.json()
        setArticles(articlesData.articles || [])
        setMetrics(metricsData.metrics || [])
      }
    } catch (error) {
      console.error('Error fetching filtered content:', error)
      setArticles([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent(activeFilter)
  }, [activeFilter])

  const handleFilterChange = (vertical: string) => {
    setActiveFilter(vertical)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-12">
      {/* Filter Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Filter by Vertical</h2>
        <VerticalFilter 
          onFilterChange={handleFilterChange} 
          activeFilter={activeFilter} 
        />
      </div>

      {/* Articles Section */}
      <section className="newsletter-section">
        <div className="flex items-center mb-6">
          <Newspaper className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">📰 This Week's Topline</h2>
          <span className="ml-3 text-sm text-gray-500">({articles.length} articles)</span>
        </div>
        
        <div className="space-y-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">
                No articles published this week for the selected vertical. Try a different filter!
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
          <span className="ml-3 text-sm text-gray-500">({metrics.length} metrics)</span>
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
                  No metrics published this week for the selected vertical. Try a different filter!
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