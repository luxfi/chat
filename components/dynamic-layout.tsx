'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
import { Sidebar } from '@/components/sidebar'
import siteDef from '@/site-def'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const [isIframe, setIsIframe] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/iframe') {
      setIsIframe(true)
    }
  }, [])

  return (
    <>
      {!isIframe && <Header siteDef={siteDef}/>}
      {children}
      <Sidebar />
      {!isIframe && <Footer siteDef={siteDef} />}
    </>
  )
}
