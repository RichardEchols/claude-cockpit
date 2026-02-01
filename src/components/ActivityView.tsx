'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Terminal, Loader2, CheckCircle2,
  FileEdit, Search, FileText, Globe, Square
} from 'lucide-react'
import type { ChatMessage, ToolCall } from '@/lib/types'

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Edit: FileEdit,
  Bash: Terminal,
  Grep: Search,
  Glob: Search,
  Read: FileText,
  Write: FileText,
  WebSearch: Globe,
  WebFetch: Globe,
}

interface ActivityViewProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onBackToChat: () => void
  onOpenTerminal: () => void
  onStop: () => void
}

function ActivityToolLine({ tool }: { tool: ToolCall }) {
  const Icon = TOOL_ICONS[tool.name] || Terminal
  const isRunning = tool.status === 'running'

  return (
    <div className="flex items-center gap-2 py-1.5 px-1 font-mono text-[13px]">
      {isRunning ? (
        <Loader2 className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 text-system-green flex-shrink-0" />
      )}
      <Icon className="w-3.5 h-3.5 text-txt-tertiary flex-shrink-0" />
      <span className={isRunning ? 'text-accent' : 'text-txt-secondary'}>
        {tool.name}
      </span>
      {isRunning && (
        <span className="text-txt-quaternary animate-pulse">...</span>
      )}
    </div>
  )
}

export function ActivityView({ messages, isStreaming, onBackToChat, onOpenTerminal, onStop }: ActivityViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  const toolCalls = lastAssistant?.toolCalls || []
  const textContent = lastAssistant?.content || ''
  const hasContent = toolCalls.length > 0 || textContent.length > 0

  // Auto-scroll as new content comes in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [toolCalls.length, textContent])

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      {/* Status header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-separator flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {isStreaming ? (
            <>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[13px] font-medium text-accent">Claude is working</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-system-green" />
              <span className="text-[13px] font-medium text-system-green">Done</span>
            </>
          )}
        </div>
        {isStreaming && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-system-red/15 active:bg-system-red/25 transition-colors"
          >
            <Square className="w-3 h-3 text-system-red fill-system-red" />
            <span className="text-[12px] font-medium text-system-red">Stop</span>
          </button>
        )}
      </div>

      {/* Activity feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!hasContent && isStreaming && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <span className="text-[13px] text-txt-tertiary">Starting...</span>
          </div>
        )}

        {/* Tool calls */}
        {toolCalls.length > 0 && (
          <div className="mb-4">
            {toolCalls.map((tool) => (
              <ActivityToolLine key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Streaming text preview */}
        {textContent && (
          <div className="border-t border-separator pt-3 mt-2">
            <div className="text-[11px] uppercase tracking-wider text-txt-quaternary mb-2 font-medium">
              Response
            </div>
            <div className="text-[14px] leading-relaxed text-txt-secondary font-mono whitespace-pre-wrap break-words">
              {textContent.slice(-2000)}
              {isStreaming && <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />}
            </div>
          </div>
        )}
      </div>

      {/* Action bar - shows when done */}
      {!isStreaming && hasContent && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex gap-3 px-4 py-4 border-t border-separator safe-bottom"
        >
          <button
            onClick={onBackToChat}
            className="
              flex-1 flex items-center justify-center gap-2
              py-3 rounded-xl
              bg-accent active:bg-accent-hover
              transition-colors duration-150
            "
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="text-[15px] font-semibold text-white">View Response</span>
          </button>
          <button
            onClick={onOpenTerminal}
            className="
              flex items-center justify-center gap-2
              px-5 py-3 rounded-xl
              bg-surface-tertiary active:bg-surface-quaternary
              transition-colors duration-150
            "
          >
            <Terminal className="w-4 h-4 text-txt-secondary" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
