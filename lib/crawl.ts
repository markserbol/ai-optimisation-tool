import Firecrawl from '@mendable/firecrawl-js'

const firecrawl = new Firecrawl({ 
  apiKey: process.env.FIRECRAWL_API_KEY! 
})

export async function crawlWebsite(url: string, limit = 20) {
  const result = await firecrawl.crawl(url, {
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