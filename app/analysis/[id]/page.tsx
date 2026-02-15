'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

interface Suggestion {
  id: string
  category: string
  issue: string
  why: string
  fix: string
  severity: string
  pageUrl: string | null
}

interface Analysis {
  id: string
  url: string
  status: string
  error: string | null
  createdAt: string
  pages: { id: string; url: string; title: string | null }[]
  suggestions: Suggestion[]
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'content_clarity', label: 'Content Clarity' },
  { id: 'page_coverage', label: 'Page Coverage' },
  { id: 'structured_data', label: 'Structured Data' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'structural_signals', label: 'Structural Signals' },
]

const SEVERITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

export default function AnalysisPage() {
  const params = useParams()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showPages, setShowPages] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [pageFilter, setPageFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analysis/${params.id}`)
        if (!res.ok) {
          throw new Error('Analysis not found')
        }
        const data = await res.json()
        setAnalysis(data)

        // Keep polling if still processing
        if (data.status === 'crawling' || data.status === 'analyzing') {
          setTimeout(fetchAnalysis, 2000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error || 'Analysis not found'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  
  const filteredSuggestions = analysis.suggestions
    .filter(s => activeCategory === 'all' || s.category === activeCategory)
    .filter(s => severityFilter === 'all' || s.severity === severityFilter)
    .filter(s => pageFilter === 'all' || s.pageUrl === pageFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // Get unique page URLs from suggestions for the filter
  const uniquePages = Array.from(new Set(analysis.suggestions.map(s => s.pageUrl).filter(Boolean))) as string[]

  const statusProgress = {
    pending: 0,
    crawling: 33,
    analyzing: 66,
    completed: 100,
    failed: 100,
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Back to Home
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold">Analysis Results</h1>
          <p className="text-zinc-500">{analysis.url}</p>
        </div>

        {/* Status Card */}
        {analysis.status !== 'completed' && analysis.status !== 'failed' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing</CardTitle>
              <CardDescription>
                {analysis.status === 'pending' && 'Waiting to start...'}
                {analysis.status === 'crawling' && 'Crawling your website pages...'}
                {analysis.status === 'analyzing' && 'Analyzing content with AI across 5 categories...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={statusProgress[analysis.status as keyof typeof statusProgress]} />
              <div className="flex justify-between text-xs text-zinc-500">
                <span className={analysis.status === 'crawling' ? 'font-medium text-zinc-900 dark:text-zinc-100' : ''}>Crawling</span>
                <span className={analysis.status === 'analyzing' ? 'font-medium text-zinc-900 dark:text-zinc-100' : ''}>Analyzing</span>
                <span>Complete</span>
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.status === 'failed' && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-600">Analysis Failed</CardTitle>
              <CardDescription className="text-red-500">
                {analysis.error || 'An unknown error occurred'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {analysis.status === 'completed' && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="cursor-pointer transition-colors hover:border-zinc-400 dark:hover:border-zinc-600" onClick={() => setShowPages(!showPages)}>
                <CardHeader className="pb-2">
                  <CardDescription>Pages Crawled</CardDescription>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl">{analysis.pages.length}</CardTitle>
                    <Button variant="outline" size="sm" className="text-xs">
                      {showPages ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Suggestions</CardDescription>
                  <CardTitle className="text-3xl">{analysis.suggestions.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>High Priority</CardDescription>
                  <CardTitle className="text-3xl text-red-500">
                    {analysis.suggestions.filter(s => s.severity === 'high').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Medium Priority</CardDescription>
                  <CardTitle className="text-3xl text-yellow-500">
                    {analysis.suggestions.filter(s => s.severity === 'medium').length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Pages List (expandable) */}
            {showPages && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pages Analyzed</CardTitle>
                  <CardDescription>The following pages were crawled and analyzed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.pages.map(page => (
                      <div key={page.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{page.title || 'Untitled'}</p>
                          <a 
                            href={page.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="truncate text-xs text-blue-500 hover:underline block"
                          >
                            {page.url}
                          </a>
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {analysis.suggestions.filter(s => s.pageUrl === page.url).length} issues
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggestions by Category */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="flex-wrap">
                {CATEGORIES.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.label}
                    {cat.id !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {analysis.suggestions.filter(s => s.category === cat.id).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-500">Severity:</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-500">Page:</label>
                  <select
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    className="max-w-[200px] truncate rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="all">All Pages</option>
                    {uniquePages.map(url => {
                      let displayPath = url
                      try {
                        displayPath = new URL(url).pathname || '/'
                      } catch {
                        // Keep full URL if parsing fails
                      }
                      return (
                        <option key={url} value={url}>
                          {displayPath}
                        </option>
                      )
                    })}
                  </select>
                </div>
                {(severityFilter !== 'all' || pageFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSeverityFilter('all')
                      setPageFilter('all')
                    }}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              <TabsContent value={activeCategory} className="mt-4 space-y-4">
                {filteredSuggestions.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-zinc-500">
                      No suggestions in this category
                    </CardContent>
                  </Card>
                ) : (
                  filteredSuggestions.map(suggestion => (
                    <Card key={suggestion.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{suggestion.issue}</CardTitle>
                            {suggestion.pageUrl && (
                              <a 
                                href={suggestion.pageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                {suggestion.pageUrl}
                              </a>
                            )}
                          </div>
                          <Badge className={SEVERITY_COLORS[suggestion.severity]}>
                            {suggestion.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Why it matters</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{suggestion.why}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">How to fix</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{suggestion.fix}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
