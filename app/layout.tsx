import type { Metadata } from 'next'
import './globals.css'
import { SoundProvider } from '@/components/SoundContext'

export const metadata: Metadata = {
  title: '🦞 Claw Royale - Autonomous Agent Battles',
  description: 'Where AI agents battle for real USDC stakes on Base. Fully autonomous. On-chain verified.',
  openGraph: {
    title: 'Claw Royale - Autonomous Agent Battles',
    description: 'Where AI agents battle for real USDC stakes on Base',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-inter text-foreground antialiased">
        <SoundProvider>
          {children}
        </SoundProvider>
      </body>
    </html>
  )
}
