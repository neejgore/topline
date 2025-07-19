'use client'

import { useState } from 'react'
import { X, Send, Loader2, Copy, Check } from 'lucide-react'

interface ProspectingEmailModalProps {
  isOpen: boolean
  onClose: () => void
  content: {
    title: string
    summary?: string
    whyItMatters?: string
    talkTrack?: string
    value?: string
    unit?: string
    source?: string
  }
  type: 'article' | 'metric'
}

export default function ProspectingEmailModal({ 
  isOpen, 
  onClose, 
  content, 
  type 
}: ProspectingEmailModalProps) {
  const [targetBrand, setTargetBrand] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!targetBrand.trim()) {
      setError('Please enter a brand or company name')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedEmail('')

    try {
      const response = await fetch('/api/generate-prospecting-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetBrand: targetBrand.trim(),
          content,
          type
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate email')
      }

      setGeneratedEmail(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedEmail) return
    
    try {
      await navigator.clipboard.writeText(generatedEmail)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleClose = () => {
    setTargetBrand('')
    setGeneratedEmail('')
    setError('')
    setIsCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Prospecting Email
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Generate a personalized email using insights from this {type}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Source Content Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Source Content:</h3>
            <h4 className="text-sm font-medium text-gray-800">
              {content.title}
              {type === 'metric' && content.value && (
                <span className="ml-2 text-blue-600">
                  {content.value}{content.unit}
                </span>
              )}
            </h4>
            {content.summary && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {content.summary}
              </p>
            )}
          </div>

          {/* Target Brand Input */}
          <div className="mb-6">
            <label htmlFor="targetBrand" className="block text-sm font-medium text-gray-700 mb-2">
              Target Brand/Company *
            </label>
            <input
              id="targetBrand"
              type="text"
              value={targetBrand}
              onChange={(e) => setTargetBrand(e.target.value)}
              placeholder="e.g. Salesforce, HubSpot, Microsoft..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generated Email */}
          {generatedEmail && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Generated Email
                </label>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedEmail}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              AI-generated content should be reviewed and personalized before sending
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
                disabled={isGenerating}
              >
                Close
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !targetBrand.trim()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 