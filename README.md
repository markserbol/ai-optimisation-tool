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
| AI/LLM | OpenAI GPT-4o + Groq (fallback) | Content analysis with automatic failover |

---

## LLM Provider Configuration

This system uses a **dual-provider strategy** with automatic fallback for resilience:

### Primary Provider: OpenAI GPT-4o
- High-quality analysis across all 5 suggestion categories
- Default choice when `OPENAI_API_KEY` is set

### Fallback Provider: Groq Llama 3.3 70B
- **Automatic failover** when OpenAI encounters:
  - Rate limits (429)
  - Authentication errors (401)
  - Quota exceeded errors
- Free/cheap alternative for testing
- Seamless to users (silent fallback, no API changes needed)

### Configuration

Set in `.env`:
```env
# Required
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
```

### Error Handling

```
OpenAI request fails (rate limit, auth, quota)
    ↓
Automatically retry with Groq
    ↓
Groq succeeds → Analysis completes normally
Groq fails → Analysis marked as failed + error message stored
```

If **both providers fail**, the analysis is marked `status: 'failed'` with the error message displayed in the UI.

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
  /analyze.ts                  # LLM analysis with fallback logic
  /openai.ts                   # Provider initialization & fallback
  /db.ts                       # Prisma client
/prisma
  /schema.prisma               # Database schema
/components
  /ui/                         # shadcn components
  /suggestion-card.tsx
  /category-tabs.tsx
```

---

## Setup & Environment Variables

### Required Variables

```env
# Database (SQLite - no setup needed)
DATABASE_URL="file:./dev.db"

# Firecrawl (web crawling)
FIRECRAWL_API_KEY=fc-...

# AI Providers (at least one required)
OPENAI_API_KEY=sk-proj-...      # Primary: GPT-4o
GROQ_API_KEY=gsk_...             # Fallback: Llama 3.3 70B
```

### Optional Variables

```env
# Enable error simulation for testing
SIMULATE_OPENAI_ERROR=rate_limit  # Set to: rate_limit, auth_error, quota
```

### Local Development

```bash
# Copy template
cp .env.example .env

# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Run dev server
npm run dev
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
