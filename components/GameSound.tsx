'use client'

import { useEffect } from 'react'
import { useSound } from './SoundContext'

// Silent component that initializes audio on first interaction
export function GameSound() {
  const { playClick } = useSound()

  useEffect(() => {
    const initAudio = () => {
      playClick()
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }
    
    document.addEventListener('click', initAudio)
    document.addEventListener('keydown', initAudio)
    
    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }
  }, [playClick])

  return null
}
