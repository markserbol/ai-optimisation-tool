import OpenAI from 'openai'

// Models
export const OPENAI_MODEL = 'gpt-4o'
export const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Lazy-loaded clients
let openaiClient: OpenAI | null = null
let groqClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })
  }
  return openaiClient
}

function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return groqClient
}

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
    return { client: getOpenAIClient(), model: OPENAI_MODEL }
  }
  if (provider === 'groq') {
    return { client: getGroqClient(), model: GROQ_MODEL }
  }
  throw new Error('No AI provider configured. Set OPENAI_API_KEY or GROQ_API_KEY.')
}