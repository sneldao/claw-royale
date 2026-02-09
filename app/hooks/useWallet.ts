'use client'

import { useState } from 'react'

export function useWallet() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0].slice(0, 8) + '...' + accounts[0].slice(-6))
          setConnected(true)
        }
      } catch {
        // Let the caller handle UI feedback
      }
    }
  }

  return { connected, address, connectWallet }
}
