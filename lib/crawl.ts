import Firecrawl from '@mendable/firecrawl-js'

let firecrawl: Firecrawl | null = null

function getFirecrawl() {
  if (!firecrawl) {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is required')
    }
    firecrawl = new Firecrawl({ 
      apiKey: process.env.FIRECRAWL_API_KEY 
    })
  }
  return firecrawl
}

export async function crawlWebsite(url: string, limit = 20) {
  const client = getFirecrawl()
  const result = await client.crawl(url, {
    limit,
    scrapeOptions: {
      formats: ['markdown', 'html'],
    },
  })
  
  if (result.status === 'failed' || result.status === 'cancelled') {
    throw new Error('Crawl failed')
  }
  
  return result.data
}