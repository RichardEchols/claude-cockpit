'use client'

import {
  Rocket, GitBranch, Play, Bug, User, Video
} from 'lucide-react'
import { QUICK_ACTIONS } from '@/lib/constants'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  'git-branch': GitBranch,
  play: Play,
  bug: Bug,
  user: User,
  video: Video,
}

interface QuickActionsProps {
  onAction: (prompt: string) => void
  disabled?: boolean
}

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {QUICK_ACTIONS.map((action) => {
        const Icon = ICON_MAP[action.icon] || Rocket
        return (
          <button
            key={action.label}
            onClick={() => onAction(action.prompt)}
            disabled={disabled}
            className="
              flex items-center gap-2 px-3 py-2
              bg-surface-secondary border border-separator
              rounded-lg
              text-[13px] font-medium text-txt-secondary
              hover:bg-surface-tertiary hover:text-txt-primary hover:border-white/20
              transition-all duration-200 ease-apple
              active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              whitespace-nowrap flex-shrink-0
            "
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
