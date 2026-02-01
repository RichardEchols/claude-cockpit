'use client'

import { MessageSquare, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ViewMode } from '@/lib/types'

interface ViewToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="relative flex bg-surface-tertiary rounded-lg p-1 gap-1">
      <motion.div
        className="absolute top-1 bottom-1 bg-accent rounded-md"
        initial={false}
        animate={{
          left: viewMode === 'chat' ? 4 : '50%',
          width: 'calc(50% - 6px)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <button
        onClick={() => onChange('chat')}
        className={`
          relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium
          transition-colors duration-200
          ${viewMode === 'chat' ? 'text-white' : 'text-txt-tertiary hover:text-txt-secondary'}
        `}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Chat
      </button>
      <button
        onClick={() => onChange('terminal')}
        className={`
          relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium
          transition-colors duration-200
          ${viewMode === 'terminal' ? 'text-white' : 'text-txt-tertiary hover:text-txt-secondary'}
        `}
      >
        <Terminal className="w-3.5 h-3.5" />
        Terminal
      </button>
    </div>
  )
}
