import type { UIMessage } from 'ai'

export interface Chat {
  id: string
  title: string
  userId: string
  messages: UIMessage[]
  createdAt: string
  sharePath?: string
}
