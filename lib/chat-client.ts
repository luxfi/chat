/**
 * Client-side chat persistence + API routing.
 *
 * Streaming: POST to `VITE_CHAT_API_URL` (defaults to `api.lux.cloud/v1/chat/stream`).
 * The backend MUST return an AI SDK-compatible UI message stream.
 *
 * Persistence: POST to `api.lux.cloud/v1/chat/save` with a JWT from `getAccessToken()`.
 */
import type { UIMessage } from 'ai'
import { getAccessToken } from './auth'

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://api.lux.cloud'

export function getChatApiUrl(): string {
  return (import.meta.env.VITE_CHAT_API_URL as string) || `${API_BASE}/v1/chat/stream`
}

export interface Chat {
  id: string
  userId: string
  title: string
  messages: UIMessage[]
  createdAt: string
  sharePath?: string
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

export async function saveChat(chat: Chat): Promise<void> {
  const res = await authedFetch('/v1/chat/save', {
    method: 'POST',
    body: JSON.stringify(chat),
  })
  if (!res.ok) {
    throw new Error(`saveChat failed: ${res.status}`)
  }
}

export async function getChat(id: string): Promise<Chat | null> {
  const res = await authedFetch(`/v1/chat/${encodeURIComponent(id)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`getChat failed: ${res.status}`)
  return res.json()
}

export async function getChats(userId: string): Promise<Chat[]> {
  const res = await authedFetch(`/v1/chat/list?userId=${encodeURIComponent(userId)}`)
  if (!res.ok) return []
  return res.json()
}

export async function shareChat(id: string): Promise<Chat | null> {
  const res = await authedFetch(`/v1/chat/${encodeURIComponent(id)}/share`, { method: 'POST' })
  if (!res.ok) return null
  return res.json()
}
