# AI Visibility Optimisation

A prototype system that analyses hotel websites and generates actionable suggestions to improve AI visibility, recommendation likelihood, and factual accuracy for AI engines (ChatGPT, Perplexity, Gemini).

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack TypeScript, API routes + UI |
| Styling | Tailwind CSS + shadcn/ui | Fast, attractive components |
| Database | SQLite + Prisma | Simple, file-based, no setup |
| Crawling | Firecrawl API | JS rendering, clean markdown extraction |
| AI/LLM | OpenAI GPT-4o | Content analysis & suggestion generation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  - URL input form                                           │
│  - Analysis progress view                                   │
│  - Suggestions dashboard (categorized)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Routes                                │
│  /api/analyze - Start analysis job                          │
│  /api/suggestions/:id - Get results                         │
│  /api/status/:id - Check progress                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Analysis Pipeline                           │
│  1. Crawl site (Firecrawl)                                  │
│  2. Extract & store pages                                   │
│  3. Run AI analysis per category:                           │
│     - Content clarity                                       │
│     - Page coverage gaps                                    │
│     - Structured data audit                                 │
│     - Internal consistency                                  │
│     - Structural signals                                    │
│  4. Aggregate & dedupe suggestions                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Database (SQLite)                         │
│  - analyses (id, url, status, created_at)                   │
│  - pages (id, analysis_id, url, title, content, html)       │
│  - suggestions (id, analysis_id, category, issue, ...)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
/app
  /page.tsx                    # URL input form
  /analysis/[id]/page.tsx      # Results dashboard
  /api
    /analyze/route.ts          # Start crawl + analysis
    /status/[id]/route.ts      # Check job progress
/lib
  /crawl.ts                    # Firecrawl integration
  /analyze.ts                  # LLM analysis logic
  /prompts.ts                  # Category-specific prompts
  /db.ts                       # Prisma client
/prisma
  /schema.prisma               # Database schema
/components
  /ui/                         # shadcn components
  /suggestion-card.tsx
  /category-tabs.tsx
```

---

## API Endpoints

 * `/api/analyze` POST
  Validates the URL
Creates an analysis record
Starts crawling in the background
Stores crawled pages in the database
Updates status through: crawling → analyzing → completed

* `/api/analysis/[id]` GET
  endpoint that returns the analysis with pages and suggestions



---

## License

Private - Visaible Pilot Project
