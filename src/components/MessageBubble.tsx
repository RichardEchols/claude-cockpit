'use client'

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  User, Bot, FileEdit, Terminal, Search, Globe,
  FileText, Loader2, CheckCircle2, XCircle, ChevronDown
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

function ToolCallRow({ tool }: { tool: ToolCall }) {
  const Icon = TOOL_ICONS[tool.name] || Terminal
  const isRunning = tool.status === 'running'

  return (
    <div className="flex items-center gap-2 py-1 text-[12px] font-mono">
      {isRunning ? (
        <Loader2 className="w-3 h-3 animate-spin text-accent flex-shrink-0" />
      ) : tool.status === 'error' ? (
        <XCircle className="w-3 h-3 text-system-red flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-3 h-3 text-system-green flex-shrink-0" />
      )}
      <Icon className="w-3 h-3 text-txt-quaternary flex-shrink-0" />
      <span className={isRunning ? 'text-accent' : 'text-txt-tertiary'}>
        {tool.name}
      </span>
      {isRunning && (
        <span className="text-txt-quaternary animate-pulse">...</span>
      )}
    </div>
  )
}

function ToolCallSection({ tools, isStreaming }: { tools: ToolCall[]; isStreaming?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const runningCount = tools.filter(t => t.status === 'running').length
  const completedCount = tools.filter(t => t.status === 'complete').length
  const hasRunning = runningCount > 0

  // During streaming, always show expanded
  // After streaming, show collapsed summary that can be expanded
  const showExpanded = isStreaming || expanded

  return (
    <div className="mt-2 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => !isStreaming && setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasRunning ? (
            <Loader2 className="w-3 h-3 animate-spin text-accent" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-system-green" />
          )}
          <span className="text-txt-tertiary">
            {hasRunning
              ? `Running ${tools[tools.length - 1]?.name}...`
              : `${completedCount} tool${completedCount !== 1 ? 's' : ''} used`
            }
          </span>
        </div>
        {!isStreaming && (
          <ChevronDown className={`w-3 h-3 text-txt-quaternary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        )}
      </button>

      {showExpanded && (
        <div className="px-3 pb-2 border-t border-white/[0.04]">
          {tools.map((tool) => (
            <ToolCallRow key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.3s' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.6s' }} />
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1
        ${isUser ? 'bg-accent/20' : 'bg-surface-tertiary'}
      `}>
        {isUser ? (
          <User className="w-3.5 h-3.5 text-accent" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-txt-secondary" />
        )}
      </div>

      {/* Content */}
      <div className={`
        flex flex-col gap-1 max-w-[85%] md:max-w-[75%]
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-accent text-white rounded-tr-md'
            : 'bg-surface-secondary border border-separator rounded-tl-md'
          }
        `}>
          {message.isStreaming && !message.content && (!message.toolCalls || message.toolCalls.length === 0) ? (
            <ThinkingIndicator />
          ) : isUser ? (
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <>
              {message.content && (
                <div className="message-content text-[15px] leading-relaxed break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Tool calls inline */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <ToolCallSection tools={message.toolCalls} isStreaming={message.isStreaming} />
              )}

              {/* Show thinking indicator when streaming with tool calls but no text yet */}
              {message.isStreaming && !message.content && message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2">
                  <ThinkingIndicator />
                </div>
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-txt-quaternary px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
})
