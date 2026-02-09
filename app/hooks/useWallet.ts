'use client'

import { useState, useEffect, useCallback } from 'react'
import { getWalletClient, publicClient, USDC_ABI } from '@/lib/viem'
import { CLAW_ROYALE_ADDRESS, USDC_ADDRESS } from '@/lib/config/contracts'
import { formatUnits } from 'viem'

export function useWallet() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)

  const fetchBalance = useCallback(async (userAddress: string) => {
    try {
      const result = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      })
      setBalance(formatUnits(result, 6))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setIsLoading(true)
      try {
        const walletClient = getWalletClient()
        if (!walletClient) {
          throw new Error('No wallet found')
        }

        const [account] = await walletClient.requestAddresses()
        if (account) {
          setFullAddress(account)
          setAddress(account.slice(0, 8) + '...' + account.slice(-6))
          setConnected(true)
          await fetchBalance(account)
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    } else {
      throw new Error('No Ethereum wallet found. Please install MetaMask.')
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setAddress('')
    setFullAddress('')
    setBalance('0')
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== fullAddress) {
          setFullAddress(accounts[0])
          setAddress(accounts[0].slice(0, 8) + '...' + accounts[0].slice(-6))
          fetchBalance(accounts[0])
        }
      }

      ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [fullAddress, fetchBalance])

  return { 
    connected, 
    address, 
    fullAddress,
    balance,
    isLoading,
    connectWallet, 
    disconnectWallet,
    refreshBalance: () => fullAddress && fetchBalance(fullAddress)
  }
}
