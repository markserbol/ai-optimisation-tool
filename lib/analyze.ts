import { getClient } from './openai'

interface Page {
  url: string
  title: string | null
  content: string
  html: string | null
}

interface Suggestion {
  category: string
  issue: string
  why: string
  fix: string
  severity: 'low' | 'medium' | 'high'
  pageUrl?: string
}

const CATEGORIES = {
  content_clarity: {
    name: 'Content Clarity',
    description: 'Identify ambiguous facts, marketing fluff, and mixed intents that confuse AI systems',
    prompt: `Analyze the following website content for AI readability issues related to CONTENT CLARITY.

Look for:
- Ambiguous or vague statements that could be interpreted multiple ways
- Marketing fluff without concrete facts (e.g., "world-class service" without specifics)
- Mixed intents on a single page (e.g., mixing pricing info with unrelated content)
- Subjective claims without supporting evidence
- Unclear antecedents (pronouns without clear references)

For each issue found, provide:
- issue: A brief description of the problem
- why: Why this matters for AI visibility (how it confuses AI systems)
- fix: Specific actionable recommendation to fix it
- severity: "high" if it significantly impacts AI understanding, "medium" if moderate impact, "low" if minor
- pageUrl: The URL where this issue was found`,
  },
  page_coverage: {
    name: 'Page Coverage',
    description: 'Identify missing topics and content gaps',
    prompt: `Analyze the following website content for AI readability issues related to PAGE COVERAGE.

Look for:
- Important topics that should have dedicated pages but don't
- Thin content pages that need more depth
- Missing FAQ pages for common questions implied by content
- Gaps in product/service descriptions
- Missing location or contact information pages
- Topics mentioned but never fully explained

For each issue found, provide:
- issue: A brief description of the missing content
- why: Why this matters for AI visibility
- fix: Specific recommendation for content to add
- severity: "high" if critical content is missing, "medium" if helpful content is missing, "low" if nice-to-have
- pageUrl: The URL most relevant to this gap (or null if site-wide)`,
  },
  structured_data: {
    name: 'Structured Data',
    description: 'Identify Schema.org opportunities and missing attributes',
    prompt: `Analyze the following website content for STRUCTURED DATA opportunities.

Look for:
- Content that would benefit from Schema.org markup (Organization, Product, Service, FAQ, HowTo, etc.)
- Existing structured data that's missing important attributes
- Opportunities for rich snippets (reviews, ratings, prices, availability)
- Local business information that should be marked up
- Events, recipes, articles, or other content types that have dedicated schemas

For each opportunity found, provide:
- issue: What structured data is missing or incomplete
- why: How adding this would improve AI visibility and rich results
- fix: Specific Schema.org type and properties to implement
- severity: "high" if high-impact schema is missing, "medium" if moderate impact, "low" if minor enhancement
- pageUrl: The URL where this should be implemented`,
  },
  consistency: {
    name: 'Internal Consistency',
    description: 'Identify conflicting facts and naming inconsistencies',
    prompt: `Analyze the following website content for INTERNAL CONSISTENCY issues.

Look for:
- Conflicting facts across pages (different prices, hours, specifications)
- Inconsistent naming (same thing called different names on different pages)
- Contradictory statements about products, services, or policies
- Outdated information that conflicts with newer content
- Inconsistent formatting of dates, phone numbers, addresses
- Different descriptions of the same feature or benefit

For each issue found, provide:
- issue: What specific inconsistency was found
- why: How this confuses AI systems trying to extract facts
- fix: Which version is likely correct and how to standardize
- severity: "high" if factual contradiction, "medium" if naming inconsistency, "low" if formatting issue
- pageUrl: One of the URLs involved (mention others in the issue description)`,
  },
  structural_signals: {
    name: 'Structural Signals',
    description: 'Identify buried facts, poor labeling, and dense text issues',
    prompt: `Analyze the following website content for STRUCTURAL SIGNALS issues.

Look for:
- Important facts buried in long paragraphs instead of highlighted
- Missing or unclear headings that would help AI parse content
- Dense text blocks that should be broken into lists or tables
- Poor labeling of sections (unclear what content is about)
- Key information not in predictable locations
- Missing summaries or TL;DR for long content
- Important details only in images (not in text)

For each issue found, provide:
- issue: What structural problem was found
- why: How better structure would improve AI content extraction
- fix: Specific structural improvement to make
- severity: "high" if critical info is buried, "medium" if structure could be clearer, "low" if minor improvement
- pageUrl: The URL where this issue was found`,
  },
}

export async function analyzeContent(pages: Page[]): Promise<Suggestion[]> {
  const allSuggestions: Suggestion[] = []

  // Limit pages and content size for API token limits
  const maxPages = 10
  const maxCharsPerPage = 2000
  const pagesToAnalyze = pages.slice(0, maxPages)

  // Prepare content summary for LLM
  const contentSummary = pagesToAnalyze
    .map((page) => `
=== PAGE: ${page.url} ===
Title: ${page.title || 'No title'}
Content:
${page.content.slice(0, maxCharsPerPage)}
${page.content.length > maxCharsPerPage ? '\n[Content truncated...]' : ''}
`)
    .join('\n\n')

  // Run analysis for each category
  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    try {
      const suggestions = await analyzeCategory(categoryId, category, contentSummary)
      allSuggestions.push(...suggestions)
    } catch (error) {
      console.error(`Error analyzing category ${categoryId}:`, error)
    }
  }

  return allSuggestions
}

async function analyzeCategory(
  categoryId: string,
  category: (typeof CATEGORIES)[keyof typeof CATEGORIES],
  contentSummary: string
): Promise<Suggestion[]> {
  const { client, model } = getClient()
  
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an AI visibility optimization expert. Your job is to analyze website content and identify issues that make it harder for AI systems (like ChatGPT, Claude, Perplexity, Google AI) to understand and accurately represent the content.

Respond with a JSON array of suggestions. Each suggestion must have:
- issue (string): Brief description of the problem
- why (string): Why this matters for AI visibility
- fix (string): Specific actionable fix
- severity (string): "high", "medium", or "low"
- pageUrl (string or null): The specific URL where this was found

Return an empty array [] if no issues found in this category.
Only return valid JSON, no other text.`,
      },
      {
        role: 'user',
        content: `${category.prompt}

WEBSITE CONTENT:
${contentSummary}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  })

  const content = response.choices[0]?.message?.content || '[]'
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const suggestions = JSON.parse(jsonMatch?.[0] || '[]') as Array<{
      issue: string
      why: string
      fix: string
      severity: string
      pageUrl?: string | null
    }>

    return suggestions.map((s) => ({
      category: categoryId,
      issue: s.issue,
      why: s.why,
      fix: s.fix,
      severity: (s.severity as 'low' | 'medium' | 'high') || 'medium',
      pageUrl: s.pageUrl || undefined,
    }))
  } catch (error) {
    console.error(`Failed to parse suggestions for ${categoryId}:`, content)
    return []
  }
}
