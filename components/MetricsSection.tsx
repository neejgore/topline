'use client'

import { useState, useEffect } from 'react'
import MetricCard from './MetricCard'
import LoadingSpinner from './LoadingSpinner'
import { VERTICALS } from './VerticalFilter'

type Vertical = typeof VERTICALS[number]

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

interface MetricsSectionProps {
  selectedVertical: Vertical
}

export default function MetricsSection({ selectedVertical }: MetricsSectionProps) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
  }, [selectedVertical])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        limit: '12'
      })
      
      if (selectedVertical !== 'All') {
        params.append('vertical', selectedVertical)
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
        vertical: metric.vertical
      }))

      setMetrics(mappedMetrics)
      setError('')
    } catch (err) {
      setError('Failed to load metrics. Please try again later.')
      console.error('Error fetching metrics:', err)
    } finally {
      setLoading(false)
    }
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
          Key Metrics
        </h2>
        <span className="text-sm text-gray-500">
          {metrics.length} metrics
        </span>
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
            No metrics available for the selected vertical.
          </div>
        </div>
      )}
    </section>
  )
} 