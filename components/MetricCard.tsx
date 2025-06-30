import { ExternalLink, TrendingUp, Tag } from 'lucide-react'

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

interface MetricCardProps {
  metric: Metric
}

export default function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className="card">
      {/* Metric Value */}
      <div className="text-center mb-4">
        <div className="metric-highlight mb-2">
          {metric.value}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {metric.title}
        </h3>
      </div>

      {/* Description */}
      {metric.description && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {metric.description}
        </p>
      )}

      {/* How to Use */}
      {metric.howToUse && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
          <h4 className="font-semibold text-blue-800 mb-1 text-sm">How to Use This:</h4>
          <p className="text-blue-700 text-sm leading-relaxed">
            {metric.howToUse}
          </p>
        </div>
      )}

      {/* Talk Track */}
      {metric.talkTrack && (
        <div className="talk-track">
          <h4 className="font-semibold text-green-800 mb-2">💬 Talk Track:</h4>
          <p className="text-green-700 text-sm leading-relaxed">
            {metric.talkTrack}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Source: {metric.source}
          </span>
          
          {metric.vertical && (
            <div className="flex items-center">
              <Tag className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {metric.vertical.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {metric.sourceUrl && (
          <a
            href={metric.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Source
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        )}
      </div>
    </div>
  )
} 