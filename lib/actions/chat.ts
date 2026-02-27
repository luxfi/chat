'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import kv from '@/lib/kv'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, '-1', 'REV')

    const pipeline = kv.pipeline()
    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()
    if (!results) return []

    return results.map(([err, data]: [Error | null, unknown]) => data).filter(Boolean) as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  const chat = await kv.hgetall(`chat:${id}`) as Chat | null

  if (!chat || !chat.id) {
    return null
  }

  return chat
}

export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, '-1')
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  redirect('/')
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  const pipeline = kv.pipeline()
  pipeline.hmset(`chat:${chat.id}`, chat as any)
  pipeline.zadd(`user:chat:${chat.userId}`, Date.now(), `chat:${chat.id}`)
  await pipeline.exec()
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall(`chat:${id}`) as Chat | null

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  const chat = await kv.hgetall(`chat:${id}`) as Chat | null

  if (!chat || chat.userId !== userId) {
    return null
  }

  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  await kv.hmset(`chat:${id}`, payload as any)

  return payload
}
