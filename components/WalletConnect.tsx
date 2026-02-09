'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Wallet, Zap } from 'lucide-react'

interface WalletConnectProps {
  connected: boolean
  address: string
  onConnect: () => void
}

export function WalletConnect({ connected, address, onConnect }: WalletConnectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        connected 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-gray-800/50 border border-gray-700'
      }`}>
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <div className="flex-1">
          <div className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-gray-400'}`}>
            {connected ? `${address} • Smart Account` : 'Not Connected'}
          </div>
        </div>
        <Button
          size="sm"
          variant={connected ? 'outline' : 'default'}
          onClick={onConnect}
          disabled={connected}
          className={connected ? 'border-green-500/50 text-green-400' : ''}
        >
          {connected ? <Zap className="w-4 h-4 mr-1" /> : <Wallet className="w-4 h-4 mr-1" />}
          {connected ? 'Active' : 'Connect'}
        </Button>
      </div>
    </motion.div>
  )
}
