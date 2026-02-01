'use client'

import { useState } from 'react'
import {
  MessageSquare, Trash2, Plus, X, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Session } from '@/lib/types'

interface SessionSidebarProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelectSession: (session: Session) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  open: boolean
  onClose: () => void
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  open,
  onClose,
}: SessionSidebarProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="
              fixed left-0 top-0 bottom-0 z-50
              w-[280px] bg-surface-secondary border-r border-separator
              flex flex-col
              safe-top safe-bottom
              lg:relative lg:z-auto
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-separator">
              <h2 className="text-[15px] font-semibold">Sessions</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onNewSession}
                  className="
                    w-8 h-8 rounded-lg bg-accent/20 hover:bg-accent/30
                    flex items-center justify-center
                    transition-colors duration-150
                  "
                >
                  <Plus className="w-4 h-4 text-accent" />
                </button>
                <button
                  onClick={onClose}
                  className="
                    w-8 h-8 rounded-lg hover:bg-surface-tertiary
                    flex items-center justify-center
                    transition-colors duration-150
                    lg:hidden
                  "
                >
                  <X className="w-4 h-4 text-txt-tertiary" />
                </button>
              </div>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto py-2">
              {sessions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <MessageSquare className="w-8 h-8 text-txt-quaternary mx-auto mb-2" />
                  <p className="text-[13px] text-txt-quaternary">No sessions yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group flex items-start gap-3 px-4 py-3 mx-2 rounded-xl cursor-pointer
                      transition-colors duration-150
                      ${session.id === activeSessionId
                        ? 'bg-accent/15 text-accent'
                        : 'hover:bg-surface-tertiary'
                      }
                    `}
                    onClick={() => { onSelectSession(session); onClose() }}
                  >
                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      session.id === activeSessionId ? 'text-accent' : 'text-txt-quaternary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{session.title || 'Untitled'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-txt-quaternary truncate">{session.project}</span>
                        <span className="text-[11px] text-txt-quaternary flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirmDelete === session.id) {
                          onDeleteSession(session.id)
                          setConfirmDelete(null)
                        } else {
                          setConfirmDelete(session.id)
                          setTimeout(() => setConfirmDelete(null), 3000)
                        }
                      }}
                      className={`
                        w-6 h-6 rounded flex items-center justify-center flex-shrink-0
                        hover:bg-surface-quaternary active:bg-surface-quaternary
                        transition-all duration-150
                        ${confirmDelete === session.id ? 'opacity-100 bg-system-red/10' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100'}
                      `}
                    >
                      <Trash2 className={`w-3 h-3 ${confirmDelete === session.id ? 'text-system-red' : 'text-txt-quaternary'}`} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
