import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import AuthButtons from '@/components/AuthButtons'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'WeEnYou',
  description: 'Book event halls and customize your event services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <ClientLayout>
          {/* <Navbar /> Removed to eliminate the top navigation bar */}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  )
} 
 