# Quick Start Guide

Get the AI Visibility Optimisation system up and running in 5 minutes.

---

## Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **Git** (optional, for version control)
- API Keys (see Environment Setup)

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages (Next.js, Prisma, OpenAI, Groq, Firecrawl, etc.)

---

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with your API keys:

```env
# Database (SQLite - no setup needed)
DATABASE_URL="file:./dev.db"

# Required: Web Crawling
FIRECRAWL_API_KEY=fc-...

# Required: AI Providers (at least one)
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
```

### Where to get API Keys

| Service | Link | Purpose |
|---------|------|---------|
| **OpenAI** | https://platform.openai.com/api-keys | GPT-4o analysis (primary) |
| **Groq** | https://console.groq.com | Llama fallback (free) |
| **Firecrawl** | https://app.firecrawl.dev | Website crawling |

---

## Step 3: Initialize Database

```bash
npx prisma db push
npx prisma generate
```

This creates the SQLite database and generates Prisma Client.

---

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

---

## Step 5: Test It Out

1. Open http://localhost:3000 in your browser
2. Enter a website URL (e.g., `example.com` or `https://www.google.com`)
3. Click **Analyze Website**
4. Wait for analysis to complete
5. View suggestions organized by category

---

## Viewing Database (Optional)

To inspect the database visually:

```bash
npx prisma studio
```

Opens Prisma Studio at **http://localhost:5555**

---

## Stopping the Server

In the terminal, press `Ctrl+C` to stop the dev server.

---

## Troubleshooting

### `DATABASE_URL is not set`
- Ensure `.env` file exists in the root directory
- Check that `DATABASE_URL="file:./dev.db"` is correctly set

### `Missing API key` error
- Verify all three API keys are in `.env`
- Check for typos or missing characters
- Regenerate keys if needed from provider dashboards

### `FIRECRAWL rate limit`
- Wait a few minutes and retry
- Check Firecrawl dashboard for usage

### `OpenAI rate limit`
- System will automatically fall back to Groq
- If both fail, analysis will show an error message

### Port 3000 already in use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

