import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { ArrowRight, Plus } from 'lucide-react'
import Textarea from 'react-textarea-autosize'
import { useLocation, useRoute } from 'wouter'
import { ChatMessages } from '@/components/chat/chat-messages'
import { EmptyScreen } from '@/components/empty-screen'
import { ModelSelector } from '@/components/chat/model-selector'
import { Button } from '@/components/ui/button'
import { getChatApiUrl, saveChat } from '@/lib/chat-client'
import { getStoredAuthState } from '@/lib/auth'
import { checkUserCredits, deductCredit } from '@/lib/billing-client'
import { UpgradePrompt } from '../components/upgrade-prompt'

const DEFAULT_MODEL = (import.meta.env.VITE_DEFAULT_MODEL as string) || 'zen4-mini'

function genId() {
  return crypto.randomUUID()
}

export function ChatPage() {
  const [, params] = useRoute<{ id?: string }>('/search/:id')
  const chatId = params?.id || genId()
  const [, navigate] = useLocation()

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [upgrade, setUpgrade] = useState<{ remaining: number; limit: number } | null>(null)
  const [input, setInput] = useState('')
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const auth = getStoredAuthState()
  const userId = auth.user?.sub || 'anonymous'

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    api: getChatApiUrl(),
    body: { model: selectedModel, userId },
    onError: (err: Error) => {
      console.error('chat error:', err)
    },
    onFinish: async ({ message }: { message: UIMessage }) => {
      // Persist chat history (fire and forget)
      saveChat({
        id: chatId,
        userId,
        title: firstUserText(messages) || 'Untitled',
        messages: [...messages, message],
        createdAt: new Date().toISOString(),
      }).catch(() => {})
    },
  })

  const isGenerating = status === 'streaming' || status === 'submitted'
  const isIframe = typeof window !== 'undefined' && window.location.pathname === '/iframe'

  // Update URL once we have a first exchange
  useEffect(() => {
    if (messages.length >= 1 && !params?.id && !isIframe) {
      window.history.replaceState({}, '', `/search/${chatId}`)
    }
  }, [messages.length, params?.id, chatId, isIframe])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const credits = await checkUserCredits(userId)
    if (!credits.allowed) {
      setUpgrade({ remaining: credits.remaining, limit: credits.limit })
      return
    }

    const text = input
    setInput('')
    setShowEmptyScreen(false)
    sendMessage({ text })
    deductCredit(userId).catch(() => {})
  }

  const handleClear = () => {
    navigate('/')
    window.location.reload()
  }

  if (upgrade) {
    return (
      <div className="mt-[80px] flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
        <UpgradePrompt remaining={upgrade.remaining} limit={upgrade.limit} onDismiss={() => setUpgrade(null)} />
      </div>
    )
  }

  return (
    <div className="mx-auto mt-[80px] flex min-h-[calc(100vh-80px)] max-w-3xl flex-col space-y-4 overflow-x-hidden px-8 pb-14 pt-12 sm:px-12 md:pb-24 md:pt-14">
      <ChatMessages messages={messages as UIMessage[]} />

      {messages.length > 0 ? (
        <div className="pointer-events-none fixed bottom-2 left-0 right-0 mx-auto flex items-center justify-center md:bottom-8">
          <Button
            type="button"
            variant="secondary"
            className="group pointer-events-auto rounded-full bg-secondary/80 transition-all hover:scale-105"
            onClick={handleClear}
          >
            <span className="mr-2 hidden animate-in fade-in duration-300 group-hover:block text-sm">New</span>
            <Plus size={18} className="transition-all group-hover:rotate-90" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl px-6">
          {!isIframe && (
            <div className="mb-2 flex justify-end">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            </div>
          )}
          <div className="relative flex w-full items-center">
            <Textarea
              ref={inputRef}
              name="input"
              rows={1}
              maxRows={5}
              tabIndex={0}
              placeholder="Ask a question..."
              spellCheck={false}
              value={input}
              disabled={isGenerating}
              className="min-h-12 w-full resize-none rounded-full border border-input bg-[hsl(var(--muted))] pb-1 pl-4 pr-10 pt-3 text-sm ring-offset-background placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => {
                setInput(e.target.value)
                setShowEmptyScreen(e.target.value.length === 0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  if (input.trim().length === 0) {
                    e.preventDefault()
                    return
                  }
                  e.preventDefault()
                  ;(e.target as HTMLTextAreaElement).form?.requestSubmit()
                }
              }}
              onFocus={() => setShowEmptyScreen(true)}
              onBlur={() => setShowEmptyScreen(false)}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              disabled={input.length === 0 || isGenerating}
            >
              <ArrowRight size={20} />
            </Button>
          </div>
          <EmptyScreen
            submitMessage={(m) => setInput(m)}
            className={showEmptyScreen ? 'visible' : 'invisible'}
          />
        </form>
      )}
    </div>
  )
}

type AnyPart = { type: string; text?: string }

function firstUserText(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return ''
  const parts = (first as unknown as { parts?: AnyPart[] }).parts
  const text = parts?.find((p) => p.type === 'text')
  return text && typeof text.text === 'string' ? text.text.slice(0, 100) : ''
}
