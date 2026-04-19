# Lux Chat — LLM.md

## Overview
Vite 8 + React 19 SPA served by `ghcr.io/hanzoai/spa`.
Chat UI with client-side streaming via `@ai-sdk/react`'s `useChat`.
The SPA is a pure frontend — the LLM backend is a separate service the
frontend posts to.

## Architecture
- `src/main.tsx` — app entry
- `src/App.tsx` — wouter router (`/`, `/search/:id`, `/iframe`, `/auth/callback`)
- `src/pages/ChatPage.tsx` — home + chat UX, uses `useChat` against `VITE_CHAT_API_URL`
- `src/pages/AuthCallbackPage.tsx` — OIDC callback handler (IAM)
- `src/components/Header.tsx` — minimal sticky header
- `src/components/upgrade-prompt.tsx` — shown when daily credits exhausted
- `components/chat/chat-messages.tsx` — renders `UIMessage[]` via `BotMessage` + `UserMessage`
- `components/message/*` — markdown rendering (react-markdown + KaTeX)
- `components/section/section.tsx` — titled section with lucide icon
- `components/empty-screen.tsx` — suggested-prompt chips
- `components/ui/{button,markdown,separator}.tsx` — trimmed shadcn primitives
- `lib/auth.ts` — pure-client OAuth2/OIDC (lux.id + hanzo.id)
- `lib/chat-client.ts` — `getChatApiUrl()`, `saveChat`, `getChat`, `shareChat`
- `lib/billing-client.ts` — `checkUserCredits`, `deductCredit` (fails open)

## Streaming Protocol
`useChat({ api: VITE_CHAT_API_URL })` POSTs a JSON body to the backend.
Backend MUST reply with an AI SDK v4-compatible UI message stream.
Any v4-compatible server works (`streamText(...).toUIMessageStreamResponse()`).

## Environment (Vite — all public)
- `VITE_CHAT_API_URL` — streaming endpoint (default `https://api.lux.cloud/v1/chat/stream`)
- `VITE_API_BASE` — REST base for persistence + billing (default `https://api.lux.cloud`)
- `VITE_DEFAULT_MODEL` — selected model surfaced in UI (default `zen4-mini`)
- `VITE_LUX_IAM_URL`, `VITE_LUX_IAM_CLIENT_ID` — lux.id OIDC
- `VITE_HANZO_IAM_URL`, `VITE_HANZO_IAM_CLIENT_ID` — hanzo.id OIDC
- `VITE_FREE_DAILY_QUERIES` — free-tier ceiling for fail-open (default 10)

## Backend contract
The SPA expects the following endpoints:
- `POST VITE_CHAT_API_URL` — AI SDK data stream
- `POST {VITE_API_BASE}/v1/chat/save` — persist chat
- `GET  {VITE_API_BASE}/v1/chat/:id` — fetch chat
- `GET  {VITE_API_BASE}/v1/chat/list?userId=...` — list chats
- `POST {VITE_API_BASE}/v1/chat/:id/share` — get share link
- `GET  {VITE_API_BASE}/v1/billing/credits?userId=...` — credit balance
- `POST {VITE_API_BASE}/v1/billing/credits/deduct` — decrement credit

All REST calls pass the IAM bearer token from `localStorage`.

## Build + Deploy
```bash
pnpm install
pnpm build              # emits dist/
docker build -t lux-chat .
```
Dockerfile is two-stage: node:22 build → `ghcr.io/hanzoai/spa` serves `/public`.

## What's not here (by design)
- No server-side code. No Next.js, no RSC, no server actions, no middleware.
- No agent orchestration (`lib/agents/*`) — belongs on the backend.
- No Redis KV — persistence is a REST call to the backend.
- No `@hanzo/kv-client`, `@luxfi/core`, `@luxfi/data`, `@hanzo/ui`. Pure Vite + React + Tailwind.
