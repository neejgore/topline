'use client'

import { useState, useEffect } from 'react'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import VerticalFilter, { VERTICALS } from './VerticalFilter'
import LoadingSpinner from './LoadingSpinner'

type Vertical = typeof VERTICALS[number]

interface Article {
  id: string
  title: string
  summary: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date | null
  whyItMatters: string
  talkTrack: string
  vertical: string
  category: string
  priority: string
  status: string
  views: number
  clicks: number
  shares: number
}

interface Metric {
  id: string
  title: string
  value: string
  unit: string
  context: string
  source: string
  vertical: string
  publishedAt: Date | null
  whyItMatters: string
  talkTrack: string
  status: string
  howToUse?: string
  description?: string
  sourceUrl?: string
  priority?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ArchiveContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedVertical, setSelectedVertical] = useState<Vertical>('All')
  const [articlesPagination, setArticlesPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [metricsPagination, setMetricsPagination] = useState<PaginationData>({
    page: 1,
    limit: 2, // Reduced to 2 to force pagination with 4 total metrics
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchInitialContent()
  }, [selectedVertical])

  const fetchInitialContent = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Reset pagination and content when vertical changes
      setArticlesPagination(prev => ({ ...prev, page: 1 }))
      setMetricsPagination(prev => ({ ...prev, page: 1 }))
      setArticles([])
      setMetrics([])
      
      // Fetch both articles and metrics in parallel
      await Promise.all([
        fetchArchivedArticles(1, true),
        fetchArchivedMetrics(1, true)
      ])
    } catch (err) {
      setError('Failed to load archived content. Please try again later.')
      console.error('Error fetching archived content:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedArticles = async (page: number = 1, replace: boolean = false) => {
    try {
      setArticlesLoading(true)
      
      // Calculate start of today to exclude all of today's content
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0) // Start of today
      
      const params = new URLSearchParams({
        vertical: selectedVertical,
        status: 'PUBLISHED', // Look for published articles from past days
        page: page.toString(),
        limit: articlesPagination.limit.toString(),
        beforeDate: startOfToday.toISOString() // Only content from before today
      })

      const response = await fetch(`/api/content?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch archived articles')
      }

      // Convert publishedAt strings to Date objects
      const articlesWithDates = data.content.map((article: any) => ({
        ...article,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null
      }))

      if (replace) {
        setArticles(articlesWithDates)
      } else {
        setArticles(prev => [...prev, ...articlesWithDates])
      }
      
      setArticlesPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching archived articles:', err)
    } finally {
      setArticlesLoading(false)
    }
  }

  const fetchArchivedMetrics = async (page: number = 1, replace: boolean = false) => {
    try {
      setMetricsLoading(true)
      
      // Calculate start of today to exclude all of today's content
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0) // Start of today
      
      const params = new URLSearchParams({
        vertical: selectedVertical,
        status: 'PUBLISHED', // Look for published metrics from past days
        page: page.toString(),
        limit: metricsPagination.limit.toString(),
        beforeDate: startOfToday.toISOString() // Only content from before today
      })

      const response = await fetch(`/api/metrics?${params}`)
      const data = await response.json()

      if (!data.success) {
        // If metrics API fails, just continue without metrics
        console.error('Failed to fetch archived metrics:', data.error)
        if (replace) {
          setMetrics([])
        }
        return
      }

      // Convert publishedAt strings to Date objects and map API fields to match MetricCard interface
      const metricsWithDates = data.metrics.map((metric: any) => ({
        ...metric,
        publishedAt: metric.publishedAt ? new Date(metric.publishedAt) : null,
        howToUse: metric.whyItMatters, // Map whyItMatters to howToUse for middle column
        description: metric.whyItMatters // Also keep as description for left column
      }))

      if (replace) {
        setMetrics(metricsWithDates)
      } else {
        setMetrics(prev => [...prev, ...metricsWithDates])
      }
      
      setMetricsPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching archived metrics:', err)
    } finally {
      setMetricsLoading(false)
    }
  }

  const handleVerticalChange = (vertical: Vertical) => {
    setSelectedVertical(vertical)
  }

  const handleLoadMoreArticles = () => {
    const nextPage = articlesPagination.page + 1
    if (nextPage <= articlesPagination.totalPages) {
      fetchArchivedArticles(nextPage, false)
    }
  }

  const handleLoadMoreMetrics = () => {
    const nextPage = metricsPagination.page + 1
    if (nextPage <= metricsPagination.totalPages) {
      fetchArchivedMetrics(nextPage, false)
    }
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <VerticalFilter
        selectedVertical={selectedVertical}
        onVerticalChange={handleVerticalChange}
      />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-12">
          {/* Archived Articles Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Archived Articles
              {articles.length > 0 && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({articlesPagination.total} total)
                </span>
              )}
            </h2>
            
            {articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {articles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                    />
                  ))}
                </div>

                {/* Load More Articles Button */}
                {articlesPagination.page < articlesPagination.totalPages && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMoreArticles}
                      disabled={articlesLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {articlesLoading ? 'Loading...' : 'Load More Articles'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No archived articles found for the selected vertical.
              </div>
            )}
          </div>

          {/* Archived Metrics Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Archived Metrics
              {metrics.length > 0 && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({metricsPagination.total} total)
                </span>
              )}
            </h2>
            
            {metrics.length > 0 ? (
              <>
                <div className="space-y-6 mb-8">
                  {metrics.map(metric => (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                    />
                  ))}
                </div>

                {/* Load More Metrics Button */}
                {metricsPagination.page < metricsPagination.totalPages && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMoreMetrics}
                      disabled={metricsLoading}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {metricsLoading ? 'Loading...' : 'Load More Metrics'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No archived metrics found for the selected vertical.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 