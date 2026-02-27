import Redis from '@hanzo/kv-client'

const kv = new Redis({
  host: process.env.KV_HOST || process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.KV_PORT || process.env.REDIS_PORT || '6379'),
  password: process.env.KV_PASSWORD || process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.KV_DB || '0'),
  lazyConnect: true,
})

export default kv
