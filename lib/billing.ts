import kv from './kv'

const FREE_DAILY_QUERIES = 10

function getDayKey(userId: string): string {
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `billing:daily:${userId}:${date}`
}

export async function checkUserCredits(userId: string): Promise<{
  allowed: boolean
  remaining: number
  limit: number
}> {
  const key = getDayKey(userId)
  const used = parseInt((await kv.get(key)) || '0', 10)
  const remaining = Math.max(0, FREE_DAILY_QUERIES - used)

  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_DAILY_QUERIES,
  }
}

export async function deductCredit(userId: string): Promise<void> {
  const key = getDayKey(userId)
  const pipeline = kv.pipeline()
  pipeline.incr(key)
  pipeline.expire(key, 86400)
  await pipeline.exec()
}
