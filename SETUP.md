## Setup Guide

### Prerequisites

- Node.js 18+ installed
- npm or pnpm
- OpenAI API key
- Firecrawl API key (get one at https://firecrawl.dev)

---

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Choose these options when prompted:
- Would you like to use `src/` directory? → **No**
- Would you like to customize the default import alias? → **Yes** (@/*)

---

### Step 2: Install Dependencies

```bash
# Database
npm install prisma @prisma/client

# AI & Crawling
npm install openai @mendable/firecrawl-js

# UI Components (shadcn)
npx shadcn@latest init
```

When prompted for shadcn:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Then add components:

```bash
npx shadcn@latest add button card input tabs badge progress skeleton
```

---

### Step 3: Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

---

### Step 4: Create Database Schema

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Analysis {
  id          String       @id @default(cuid())
  url         String
  status      String       @default("pending") // pending, crawling, analyzing, completed, failed
  error       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  pages       Page[]
  suggestions Suggestion[]
}

model Page {
  id         String   @id @default(cuid())
  analysisId String
  url        String
  title      String?
  content    String   // Markdown content
  html       String?  // Raw HTML for structured data analysis
  createdAt  DateTime @default(now())
  analysis   Analysis @relation(fields: [analysisId], references: [id], onDelete: Cascade)
}

model Suggestion {
  id         String   @id @default(cuid())
  analysisId String
  category   String   // content_clarity, page_coverage, structured_data, consistency, structural_signals
  issue      String
  why        String
  fix        String
  severity   String   @default("medium") // low, medium, high
  pageUrl    String?  // Related page URL if applicable
  createdAt  DateTime @default(now())
  analysis   Analysis @relation(fields: [analysisId], references: [id], onDelete: Cascade)
}
```

Then generate the client:

```bash
npx prisma db push
```

---

### Step 5: Environment Variables

Update `.env`:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."
FIRECRAWL_API_KEY="fc-..."
```

---

### Step 6: Create Library Files

Create these files manually:

**`lib/db.ts`**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**`lib/crawl.ts`**
```typescript
import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawl = new FirecrawlApp({ 
  apiKey: process.env.FIRECRAWL_API_KEY! 
})

export async function crawlWebsite(url: string, limit = 20) {
  const result = await firecrawl.crawlUrl(url, {
    limit,
    scrapeOptions: {
      formats: ['markdown', 'html'],
    },
  })
  
  if (!result.success) {
    throw new Error(result.error || 'Crawl failed')
  }
  
  return result.data
}
```

**`lib/openai.ts`**
```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})
```

---

### Step 7: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Suggestion Categories

The system generates suggestions across 5 categories:

| Category | Focus |
|----------|-------|
| **Content Clarity** | Ambiguous facts, marketing fluff, mixed intents |
| **Page Coverage** | Missing topics, gaps in room/amenity pages |
| **Structured Data** | Schema.org opportunities, missing attributes |
| **Internal Consistency** | Conflicting facts, naming inconsistencies |
| **Structural Signals** | Buried facts, poor labeling, dense text |

---

## API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env` as `OPENAI_API_KEY`

### Firecrawl
1. Go to https://firecrawl.dev
2. Sign up and get API key
3. Add to `.env` as `FIRECRAWL_API_KEY`

---

## Next Steps

After setup, implement:

1. [ ] Homepage with URL input form
2. [ ] `/api/analyze` route to start analysis
3. [ ] Analysis pipeline (crawl → store → analyze)
4. [ ] LLM prompts for each suggestion category
5. [ ] Results dashboard with category tabs
6. [ ] Progress indicators during analysis

---