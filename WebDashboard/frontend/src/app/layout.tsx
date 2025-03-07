import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-orbitron'
})

export const metadata: Metadata = {
  title: 'Keylogger Dashboard',
  description: 'Real-time keylogging dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable}`}>{children}</body>
    </html>
  )
} 