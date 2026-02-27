import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import DynamicLayout from '@/components/dynamic-layout';
import { Toaster } from '@/components/ui/sonner'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Lux'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lux.chat'
const title = siteName
const description =
  `${siteName} AI — search engine powered by Zen models with 433+ AI models via the Hanzo AI platform.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@luxdefi'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicLayout>
            {children}
          </DynamicLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
