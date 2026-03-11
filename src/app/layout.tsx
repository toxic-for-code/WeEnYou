import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import Footer from '@/components/Footer'
import MobileNavbar from '@/components/mobile/MobileNavbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'WeEnYou',
  description: 'Book event halls and customize your event services',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientLayout>
          <MobileNavbar />
          <main className="min-h-screen bg-gray-50 min-w-0 w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  )
} 
 