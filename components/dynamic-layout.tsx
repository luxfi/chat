"use client"

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Sidebar } from '@/components/sidebar'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const [isIframe, setIsIframe] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/iframe') {
      setIsIframe(true)
    }
  }, [])

  return (
    <>
      {!isIframe && <Header />}
      {children}
      <Sidebar />
      {!isIframe && <Footer />}
    </>
  )
}
