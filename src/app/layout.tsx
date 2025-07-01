import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import AuthButtons from '@/components/AuthButtons'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Event Hall Booking Platform',
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
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  )
} 
 