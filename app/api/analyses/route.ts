import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            pages: true,
            suggestions: true,
          },
        },
      },
    })

    return NextResponse.json(analyses)
  } catch (error) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}
