'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContractShowcaseProps {
  contracts: {
    clawRoyale: string
    clawRoyaleSmart: string
    agentVerifier: string
    bettingPool: string
  }
}

export function ContractShowcase({ contracts }: ContractShowcaseProps) {
  const entries = Object.entries(contracts)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
          <div className="text-2xl">⛓️</div>
          Verified Contracts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(([name, addr], i) => (
            <motion.a
              key={name}
              href={`https://sepolia.basescan.org/address/${addr}`}
              target="_blank"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-neon-blue/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-2xl">
                {name.includes('Smart') ? '🧠' : name.includes('Verifier') ? '🤖' : name.includes('Betting') ? '🎰' : '⚔️'}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 capitalize">{name.replace(/([A-Z])/g, ' $1')}</div>
                <div className="font-mono text-neon-blue group-hover:text-neon-blue/80 text-sm">
                  {addr.slice(0, 8)}...{addr.slice(-6)}
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-neon-blue transition-colors" />
            </motion.a>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2">
            ✓ All contracts verified on Base Sepolia
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
