'use client'

import { useState, useEffect } from 'react'
import ArticleCard from './ArticleCard'
import MetricsSection from './MetricsSection'
import VerticalFilter, { VERTICALS } from './VerticalFilter'
import RelevanceFilter, { RELEVANCE_LEVELS } from './RelevanceFilter'
import LoadingSpinner from './LoadingSpinner'

type Vertical = typeof VERTICALS[number]
type RelevanceLevel = typeof RELEVANCE_LEVELS[number]

interface Article {
  id: string
  title: string
  summary?: string | null
  sourceUrl?: string | null
  sourceName?: string | null
  publishedAt?: Date | null
  whyItMatters?: string | null
  talkTrack?: string | null
  vertical?: string | null
  priority?: string
  category?: string
  status?: string
  views?: number
  clicks?: number
  shares?: number
  importanceScore?: number
}

export default function DailyContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVertical, setSelectedVertical] = useState<Vertical>('All')
  const [selectedRelevance, setSelectedRelevance] = useState<RelevanceLevel>('All')

  useEffect(() => {
    fetchContent()
  }, [selectedVertical, selectedRelevance])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        limit: '20'
      })
      
      if (selectedVertical !== 'All') {
        params.append('vertical', selectedVertical)
      }

      if (selectedRelevance !== 'All') {
        params.append('priority', selectedRelevance)
      }

      const response = await fetch(`/api/content?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch content')
      }

      // Convert publishedAt strings to Date objects for consistent formatting
      const articlesWithDates = (data.content || []).map((article: any) => ({
        ...article,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null
      }))
      
      setArticles(articlesWithDates)
      setError('')
    } catch (err) {
      setError('Failed to load content. Please try again later.')
      console.error('Error fetching content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerticalChange = (vertical: Vertical) => {
    setSelectedVertical(vertical)
  }

  const handleRelevanceChange = (relevance: RelevanceLevel) => {
    setSelectedRelevance(relevance)
  }

  // Filter articles only
  const regularArticles = articles

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error}
        </div>
        <button
          onClick={fetchContent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <VerticalFilter
          selectedVertical={selectedVertical}
          onVerticalChange={handleVerticalChange}
        />
        
        <RelevanceFilter
          selectedRelevance={selectedRelevance}
          onRelevanceChange={handleRelevanceChange}
        />
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-12">
          {/* Articles Section */}
          {regularArticles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Latest Intelligence
                </h2>
                <span className="text-sm text-gray-500">
                  {regularArticles.length} articles
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
          
          {/* Metrics Section */}
          <MetricsSection 
            selectedVertical={selectedVertical} 
            selectedRelevance={selectedRelevance}
          />

          {/* Empty State */}
          {regularArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                No content available for the selected filters.
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => setSelectedVertical('All')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Industry Filter
                </button>
                <button
                  onClick={() => setSelectedRelevance('All')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Relevance Filter
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 