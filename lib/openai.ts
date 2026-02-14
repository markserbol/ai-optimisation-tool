import OpenAI from 'openai'

// Primary: OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Fallback: Groq (OpenAI-compatible API)
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
})

// Models
export const OPENAI_MODEL = 'gpt-4o'
export const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Check which provider is available
export function getAvailableProvider(): 'openai' | 'groq' | null {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GROQ_API_KEY) return 'groq'
  return null
}

// Get client and model based on what's configured
export function getClient(): { client: OpenAI; model: string } {
  const provider = getAvailableProvider()
  if (provider === 'openai') {
    return { client: openai, model: OPENAI_MODEL }
  }
  if (provider === 'groq') {
    return { client: groq, model: GROQ_MODEL }
  }
  throw new Error('No AI provider configured. Set OPENAI_API_KEY or GROQ_API_KEY.')
}