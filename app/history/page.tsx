'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AnalysisSummary {
  id: string
  url: string
  status: string
  createdAt: string
  _count: {
    pages: number
    suggestions: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  crawling: 'bg-blue-500',
  analyzing: 'bg-yellow-500',
  pending: 'bg-zinc-400',
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/analyses')
        if (res.ok) {
          const data = await res.json()
          setAnalyses(data)
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-zinc-500">View all past website analyses</p>
          </div>
          <Button asChild>
            <Link href="/">New Analysis</Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500 mb-4">No analyses yet</p>
              <Button asChild>
                <Link href="/">Start Your First Analysis</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map(analysis => (
              <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">{analysis.url}</CardTitle>
                        <CardDescription>
                          {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      <Badge className={STATUS_COLORS[analysis.status]}>
                        {analysis.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  {analysis.status === 'completed' && (
                    <CardContent className="pt-0">
                      <div className="flex gap-4 text-sm text-zinc-500">
                        <span>{analysis._count.pages} pages</span>
                        <span>{analysis._count.suggestions} suggestions</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
