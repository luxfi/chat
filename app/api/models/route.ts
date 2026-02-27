import { NextResponse } from 'next/server'

let cachedModels: any = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  const now = Date.now()
  if (cachedModels && now - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedModels)
  }

  try {
    const base = process.env.HANZO_API_BASE || 'https://api.hanzo.ai/v1'
    const res = await fetch(`${base}/models`, {
      headers: {
        Authorization: `Bearer ${process.env.HANZO_API_KEY}`,
      },
    })
    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: res.status })
    }
    const data = await res.json()
    cachedModels = data
    cacheTime = now
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}
