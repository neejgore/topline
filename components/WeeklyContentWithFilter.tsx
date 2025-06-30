'use client'

import { useState, useEffect } from 'react'
import VerticalFilter, { VERTICALS } from './VerticalFilter'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import LoadingSpinner from './LoadingSpinner'
import { Newspaper, TrendingUp } from 'lucide-react'

type Vertical = typeof VERTICALS[number]

interface Article {
  id: string
  title: string
  summary?: string | null
  sourceUrl: string
  sourceName: string
  whyItMatters?: string | null
  talkTrack?: string | null
  vertical?: string | null
  publishedAt?: Date | string | null
}

interface Metric {
  id: string
  title: string
  value: string
  description?: string | null
  source: string
  sourceUrl?: string | null
  howToUse?: string | null
  talkTrack?: string | null
  vertical?: string | null
}

export default function WeeklyContentWithFilter() {
  const [articles, setArticles] = useState<Article[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVertical, setSelectedVertical] = useState<Vertical>('All')

  const fetchContent = async () => {
    setLoading(true)
    try {
      // Fetch all articles and metrics, then filter client-side
      const [articlesRes, metricsRes] = await Promise.all([
        fetch('/api/content/filtered?type=articles&status=published'),
        fetch('/api/content/filtered?type=metrics&status=published')
      ])

      if (articlesRes.ok && metricsRes.ok) {
        const articlesData = await articlesRes.json()
        const metricsData = await metricsRes.json()
        setArticles(articlesData.articles || [])
        setMetrics(metricsData.metrics || [])
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      setArticles([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  // Filter content based on selected vertical
  const filteredArticles = selectedVertical === 'All' 
    ? articles.slice(0, 15) // Limit to 15 articles
    : articles.filter(article => 
        article.vertical === selectedVertical || 
        (selectedVertical === 'Other' && (!article.vertical || !VERTICALS.includes(article.vertical as Vertical)))
      ).slice(0, 15)

  const filteredMetrics = selectedVertical === 'All' 
    ? metrics.slice(0, 9) // Limit to 9 metrics
    : metrics.filter(metric => 
        metric.vertical === selectedVertical || 
        (selectedVertical === 'Other' && (!metric.vertical || !VERTICALS.includes(metric.vertical as Vertical)))
      ).slice(0, 9)

  const handleVerticalChange = (vertical: Vertical) => {
    setSelectedVertical(vertical)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <VerticalFilter 
        selectedVertical={selectedVertical}
        onVerticalChange={handleVerticalChange}
        showCounts={true}
        articleCount={filteredArticles.length}
        metricCount={filteredMetrics.length}
      />

      {/* Articles Grid Section */}
      <section>
        <div className="flex items-center mb-6">
          <Newspaper className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">📰 This Week's Topline</h2>
          <span className="ml-2 text-sm text-gray-500">
            ({filteredArticles.length}{selectedVertical === 'All' ? '/15' : ''})
          </span>
          {selectedVertical !== 'All' && (
            <span className="ml-2 text-xs text-gray-400">• Filtered by {selectedVertical}</span>
          )}
        </div>
        
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {filteredArticles.map((article) => (
              <div key={article.id} className="break-inside-avoid">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {selectedVertical === 'All' 
                ? "No articles published this week. Check back Tuesday for fresh insights!"
                : `No articles found for ${selectedVertical}. Try selecting a different industry vertical.`
              }
            </p>
          </div>
        )}
      </section>

      {/* Metrics Grid Section */}
      <section>
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-accent-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">📊 Metrics That Move the Needle</h2>
          <span className="ml-2 text-sm text-gray-500">
            ({filteredMetrics.length}{selectedVertical === 'All' ? '/9' : ''})
          </span>
          {selectedVertical !== 'All' && (
            <span className="ml-2 text-xs text-gray-400">• Filtered by {selectedVertical}</span>
          )}
        </div>
        
        {filteredMetrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {selectedVertical === 'All' 
                ? "No metrics published this week. Check back Tuesday for fresh data insights!"
                : `No metrics found for ${selectedVertical}. Try selecting a different industry vertical.`
              }
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
          
          {selectedVertical !== 'All' && (
            <div className="bg-white/50 rounded p-3 border-l-4 border-primary-400">
              <p className="text-sm text-primary-800">
                <strong>Industry Focus:</strong> Content filtered for {selectedVertical} — 
                perfect for targeted conversations in this vertical.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
} 