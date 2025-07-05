'use client'

import { useState, useEffect } from 'react'
import MetricCard from './MetricCard'
import LoadingSpinner from './LoadingSpinner'
import { VERTICALS } from './VerticalFilter'
import { RELEVANCE_LEVELS } from './RelevanceFilter'

type Vertical = typeof VERTICALS[number]
type RelevanceLevel = typeof RELEVANCE_LEVELS[number]

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
  priority?: string | null
}

interface MetricsSectionProps {
  selectedVertical: Vertical
  selectedRelevance: RelevanceLevel
}

export default function MetricsSection({ selectedVertical, selectedRelevance }: MetricsSectionProps) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewedToday, setViewedToday] = useState(0)
  const [dailyLimit] = useState(1)

  useEffect(() => {
    fetchMetrics()
  }, [selectedVertical, selectedRelevance])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        limit: '1' // Always request 1 metric max
      })
      
      if (selectedVertical !== 'All') {
        params.append('vertical', selectedVertical)
      }

      if (selectedRelevance !== 'All') {
        params.append('priority', selectedRelevance)
      }

      const response = await fetch(`/api/metrics?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch metrics')
      }

      // Map the API response to match the expected interface
      const mappedMetrics = (data.metrics || []).map((metric: any) => ({
        id: metric.id,
        title: metric.title,
        value: metric.value,
        description: metric.whyItMatters,
        source: metric.source || 'Unknown',
        sourceUrl: metric.sourceUrl,
        howToUse: metric.whyItMatters,
        talkTrack: metric.talkTrack,
        vertical: metric.vertical,
        priority: metric.priority
      }))

      setMetrics(mappedMetrics)
      setViewedToday(data.viewedToday || mappedMetrics.length)
      setError('')
    } catch (err) {
      setError('Failed to load metrics. Please try again later.')
      console.error('Error fetching metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get current date for the title
  const getCurrentDate = () => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return today.toLocaleDateString('en-US', options)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          {error}
        </div>
        <button
          onClick={fetchMetrics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Need-to-know Metric for {getCurrentDate()}
        </h2>
        <div className="text-right">
          <span className="text-sm text-gray-500 block">
            {metrics.length} of {dailyLimit} daily metric
          </span>
          <span className="text-xs text-gray-400">
            Newest first • No repeats • 90-day lookback
          </span>
        </div>
      </div>
      
      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            {selectedVertical === 'All' && selectedRelevance === 'All'
              ? "You've seen all available metrics for today. A new metric is selected nightly and shown first - check back tomorrow for fresh insights!"
              : `No new metrics available for the selected filters today. Try adjusting your filters or check back tomorrow for new content.`
            }
          </div>
          <div className="text-xs text-gray-400">
            New metric selected nightly • Shown once • Archived after viewing • 90-day lookback
          </div>
        </div>
      )}
    </section>
  )
} 