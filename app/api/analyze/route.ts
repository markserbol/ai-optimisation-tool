import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { crawlWebsite } from '@/lib/crawl'
import { analyzeContent } from '@/lib/analyze'
import { sanitizeAndValidateUrl } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    // Sanitize and validate URL
    const { url: validUrl, error } = sanitizeAndValidateUrl(url)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        url: validUrl!,
        status: 'crawling',
      },
    })

    // Start crawling in background (don't await)
    crawlAndAnalyze(analysis.id, validUrl!).catch(console.error)

    return NextResponse.json({ id: analysis.id })
  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    )
  }
}

async function crawlAndAnalyze(analysisId: string, url: string) {
  try {
    // Crawl the website
    const pages = await crawlWebsite(url)

    // Store crawled pages
    await prisma.page.createMany({
      data: pages.map((page) => ({
        analysisId,
        url: page.metadata?.sourceURL || url,
        title: page.metadata?.title || null,
        content: page.markdown || '',
        html: page.html || null,
      })),
    })

    // Update status to analyzing
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'analyzing' },
    })

    // Fetch stored pages for analysis
    const storedPages = await prisma.page.findMany({
      where: { analysisId },
    })
    console.log(`Crawled and stored ${storedPages.length} pages for analysis ${analysisId}`)  
    // Run LLM analysis for each category
    const suggestions = await analyzeContent(storedPages)
    console.log(`Generated ${suggestions.length} suggestions for analysis ${analysisId}`)
    // Store suggestions
    if (suggestions.length > 0) {
      await prisma.suggestion.createMany({
        data: suggestions.map((s) => ({
          analysisId,
          category: s.category,
          issue: s.issue,
          why: s.why,
          fix: s.fix,
          severity: s.severity,
          pageUrl: s.pageUrl || null,
        })),
      })
    }

    // Mark as completed
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'completed' },
    })
  } catch (error) {
    console.error('Crawl/analyze error:', error)
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}
