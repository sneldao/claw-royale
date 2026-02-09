'use client'

import { createContext, useContext, useCallback, useRef, useEffect } from 'react'

interface SoundContextType {
  playClick: () => void
  playBattle: () => void
  playWin: () => void
  playHit: () => void
  playRegister: () => void
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (typeof window === 'undefined') return
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = audioContextRef.current || new AudioContext()
      audioContextRef.current = ctx
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch (e) {
      // Audio not supported
    }
  }, [])

  const playClick = useCallback(() => {
    playTone(800, 0.1)
  }, [playTone])

  const playBattle = useCallback(() => {
    playTone(400, 0.2)
    setTimeout(() => playTone(600, 0.2), 100)
    setTimeout(() => playTone(800, 0.3), 200)
  }, [playTone])

  const playWin = useCallback(() => {
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'triangle'), i * 100)
    })
  }, [playTone])

  const playHit = useCallback(() => {
    playTone(200, 0.05, 'square')
  }, [playTone])

  const playRegister = useCallback(() => {
    playTone(440, 0.15)
    setTimeout(() => playTone(554, 0.15), 100)
    setTimeout(() => playTone(659, 0.2), 200)
  }, [playTone])

  return (
    <SoundContext.Provider value={{ playClick, playBattle, playWin, playHit, playRegister }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    return {
      playClick: () => {},
      playBattle: () => {},
      playWin: () => {},
      playHit: () => {},
      playRegister: () => {}
    }
  }
  return context
}
