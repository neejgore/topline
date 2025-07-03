'use client'

import { useState, useEffect } from 'react'
import ArticleCard from './ArticleCard'
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

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ArchiveContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVertical, setSelectedVertical] = useState<Vertical>('All')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchArchivedContent()
  }, [selectedVertical, pagination.page])

  const fetchArchivedContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        vertical: selectedVertical,
        status: 'ARCHIVED',
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      const response = await fetch(`/api/content?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch archived content')
      }

      // Convert publishedAt strings to Date objects
      const articlesWithDates = data.content.map((article: any) => ({
        ...article,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null
      }))

      setArticles(articlesWithDates)
      setPagination(data.pagination)
      setError('')
    } catch (err) {
      setError('Failed to load archived content. Please try again later.')
      console.error('Error fetching archived content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerticalChange = (vertical: Vertical) => {
    setSelectedVertical(vertical)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}

          {articles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No archived content found for the selected vertical.
            </div>
          )}
        </>
      )}
    </div>
  )
} 