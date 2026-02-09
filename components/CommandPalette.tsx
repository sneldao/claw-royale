'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Command } from 'cmdk'
import { useState, useEffect } from 'react'
import { Search, Sword, Trophy, Users, Wallet, Activity, Settings, Sparkles } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  const items = [
    { icon: Sword, label: 'Create Battle', shortcut: 'C', action: () => {} },
    { icon: Trophy, label: 'Join Battle', shortcut: 'J', action: () => {} },
    { icon: Users, label: 'View Agents', shortcut: 'A', action: () => {} },
    { icon: Wallet, label: 'Connect Wallet', shortcut: 'W', action: () => {} },
    { icon: Activity, label: 'View Activity', shortcut: 'L', action: () => {} },
    { icon: Settings, label: 'Settings', shortcut: 'S', action: () => {} },
    { icon: Sparkles, label: 'Upgrade Agent', shortcut: 'U', action: () => {} },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50"
          >
            <Command className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                <Search className="w-5 h-5 text-gray-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="p-4 text-center text-gray-500">
                  No commands found
                </Command.Empty>
                {items.map((item, i) => (
                  <Command.Item
                    key={i}
                    onSelect={() => {
                      item.action()
                      onOpenChange(false)
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-neon-blue" />
                    <span className="flex-1">{item.label}</span>
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                      {item.shortcut}
                    </kbd>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
