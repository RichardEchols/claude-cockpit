'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown, Terminal, Palette, Video, Brain,
  BookOpen, Heart, Play, FolderOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  terminal: Terminal,
  palette: Palette,
  video: Video,
  brain: Brain,
  book: BookOpen,
  heart: Heart,
  play: Play,
}

interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project
  onSelect: (project: Project) => void
}

export function ProjectSwitcher({ projects, selected, onSelect }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const Icon = ICON_MAP[selected.icon] || FolderOpen

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 px-3 py-2
          bg-surface-tertiary hover:bg-surface-quaternary
          rounded-lg
          transition-all duration-200 ease-apple
          active:scale-[0.98]
          text-[13px] font-medium
          min-w-0
        "
      >
        <Icon className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="truncate max-w-[140px]">{selected.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-txt-quaternary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="
              absolute top-full left-0 mt-2 z-50
              bg-surface-secondary border border-separator
              rounded-xl shadow-apple-lg
              py-1 min-w-[220px]
              overflow-hidden
            "
          >
            {projects.map((project) => {
              const PIcon = ICON_MAP[project.icon] || FolderOpen
              const isActive = project.path === selected.path
              return (
                <button
                  key={project.path}
                  onClick={() => { onSelect(project); setOpen(false) }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    transition-colors duration-150
                    ${isActive ? 'bg-accent/20 text-accent' : 'hover:bg-surface-tertiary text-txt-primary'}
                  `}
                >
                  <PIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-txt-quaternary'}`} />
                  <span className="text-[13px] font-medium truncate">{project.name}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
