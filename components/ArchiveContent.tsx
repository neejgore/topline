'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import ArticleCard from './ArticleCard'
import MetricCard from './MetricCard'
import LoadingSpinner from './LoadingSpinner'

type Article = {
  id: string
  title: string
  summary?: string | null
  sourceUrl: string
  sourceName: string
  whyItMatters?: string | null
  talkTrack?: string | null
  publishedAt?: Date | null
  vertical?: string | null
}

type Metric = {
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

export default function ArchiveContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'metrics'>('all')

  useEffect(() => {
    fetchArchiveContent()
  }, [])

  const fetchArchiveContent = async () => {
    try {
      const response = await fetch('/api/content/archive')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setMetrics(data.metrics || [])
      }
    } catch (error) {
      console.error('Error fetching archive content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchArchiveContent()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setMetrics(data.metrics || [])
      }
    } catch (error) {
      console.error('Error searching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article =>
    searchQuery === '' || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMetrics = metrics.filter(metric =>
    searchQuery === '' ||
    metric.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    metric.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles and metrics..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Content ({filteredArticles.length + filteredMetrics.length})
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'articles'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('articles')}
          >
            Articles ({filteredArticles.length})
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics ({filteredMetrics.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {(activeTab === 'all' || activeTab === 'articles') && filteredArticles.length > 0 && (
        <section>
          <h2 className="section-title">Articles</h2>
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'metrics') && filteredMetrics.length > 0 && (
        <section>
          <h2 className="section-title">Metrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && filteredMetrics.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No content found</p>
          <p className="text-gray-400">
            {searchQuery 
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'No archived content available yet. Check back soon!'
            }
          </p>
        </div>
      )}
    </div>
  )
} 