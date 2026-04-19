import type { UIMessage } from 'ai'
import { Section } from '../section/section'
import { BotMessage } from '../message/message'
import { UserMessage } from '../message/user-message'

interface ChatMessagesProps {
  messages: UIMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages.length) return null

  return (
    <>
      {messages.map((m, i) => {
        const text = extractText(m)
        if (!text) return null
        if (m.role === 'user') {
          return <UserMessage key={m.id || i} message={text} />
        }
        return (
          <Section key={m.id || i} title="Answer">
            <BotMessage content={text} />
          </Section>
        )
      })}
    </>
  )
}

type AnyPart = { type: string; text?: string }

function extractText(m: UIMessage): string {
  const parts = (m as unknown as { parts?: AnyPart[] }).parts
  if (!parts) return ''
  let out = ''
  for (const part of parts) {
    if (part.type === 'text' && typeof part.text === 'string') {
      out += part.text
    }
  }
  return out
}
