# Lux Chat — LLM.md

## Overview
AI-powered search engine built on morphic.sh (Next.js 14, Vercel AI SDK, Upstash Redis).
Powered by Zen models via Hanzo LLM Gateway (`api.hanzo.ai`).

## Architecture
- `app/actions.tsx` — Main server action orchestrating search/answer pipeline
- `lib/agents/` — AI agents: researcher (search+answer), writer (quality answers), task-manager, query-suggestor
- `lib/utils/index.ts` — `getModel(modelId?)` factory pointing to Hanzo Gateway
- `lib/auth.ts` — better-auth config with lux.id + hanzo.id OIDC providers
- `lib/billing.ts` — Free tier (10 queries/day) tracked in Redis
- `lib/actions/chat.ts` — Chat persistence in Upstash Redis

## Key Patterns
- All LLM calls go through `getModel()` which points to `HANZO_API_BASE` (api.hanzo.ai/v1)
- Writer uses `WRITER_MODEL` (zen4), researcher uses user-selected model or `DEFAULT_MODEL` (zen4-mini)
- Auth: better-auth with two OIDC providers (lux.id, hanzo.id), session in cookies
- Billing: Redis-based daily query counter, checked before each search

## Environment
- `HANZO_API_KEY` — Gateway API key
- `HANZO_API_BASE` — Gateway base URL (default: https://api.hanzo.ai/v1)
- `DEFAULT_MODEL` — Default model for search (zen4-mini)
- `WRITER_MODEL` — Model for quality writing (zen4)
- `LUX_IAM_CLIENT_ID/SECRET` — lux.id OAuth credentials
- `HANZO_IAM_CLIENT_ID/SECRET` — hanzo.id OAuth credentials
- `BETTER_AUTH_SECRET` — Auth session secret
- `NEXT_PUBLIC_SITE_NAME` — Brand name (Lux or Hanzo)
- `NEXT_PUBLIC_SITE_URL` — Site URL for metadata

## White-label
Set `NEXT_PUBLIC_SITE_NAME=Hanzo` and `NEXT_PUBLIC_SITE_URL=https://chat.hanzo.ai` for Hanzo branding.
