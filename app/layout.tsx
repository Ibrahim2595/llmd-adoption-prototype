import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'llm-d — Kubernetes-native distributed LLM inference',
  description:
    'A well-lit path for anyone to serve at scale, with the fastest time-to-value and competitive performance per dollar, for most models across diverse hardware accelerators.',
  icons: {
    icon: '/img/llm-d-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans`}
    >
      <head>
        {/* Inline script runs before paint to set dark class — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
