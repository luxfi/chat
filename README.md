# Lux Chat

Vite 8 + React 19 SPA for Lux AI chat. Served by `ghcr.io/hanzoai/spa`.

## Stack

- Vite 8, React 19, TypeScript 5.7
- `@ai-sdk/react` — client-side streaming via `useChat`
- wouter — client-side routing
- Tailwind CSS — styling
- shadcn/ui primitives (trimmed: button, markdown, separator)

## Quickstart

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Visit http://localhost:3000.

## Build

```bash
pnpm build            # emits dist/
docker build -t lux-chat .
```

## Environment

See `.env.local.example`. All variables are client-exposed (`VITE_` prefix).

The SPA is a pure frontend. It calls:

- `POST $VITE_CHAT_API_URL` — AI SDK v4 data stream
- REST endpoints under `$VITE_API_BASE` for chat persistence + billing
- OIDC against `lux.id` / `hanzo.id` for auth

See `LLM.md` for the full backend contract.
