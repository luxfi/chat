import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OpenAI } from '@ai-sdk/openai'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const gateway = new OpenAI({
  baseUrl: process.env.HANZO_API_BASE || 'https://api.hanzo.ai/v1',
  apiKey: process.env.HANZO_API_KEY || '',
  organization: ''
})

export function getModel(modelId?: string) {
  return gateway.chat(modelId || process.env.DEFAULT_MODEL || 'zen4-mini')
}
