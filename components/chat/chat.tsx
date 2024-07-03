'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChatPanel } from './chat-panel'
import { ChatMessages } from './chat-messages'
import { useUIState, useAIState } from 'ai/rsc'

type ChatProps = {
  id?: string
}

export function Chat({ id }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`)
    }

    if (messages.length && scrollerRef.current) {
      console.log("Scrolling to bottom with:", scrollerRef.current, messages);
      scrollerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [id, path, messages])

  useEffect(() => {
    if (aiState.messages[aiState.messages.length - 1]?.type === 'followup') {
      // Refresh the page to reflect chat history updates
      router.refresh()
    }
  }, [aiState, router])

  return (
    <div className="h-[100] min-h-screen overflow-scroll px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
      <ChatMessages messages={messages} />
      <ChatPanel messages={messages} />
      <div className="" ref={scrollerRef}></div>
    </div>
  )
}