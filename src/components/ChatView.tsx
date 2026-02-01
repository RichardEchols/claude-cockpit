'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Square, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { VoiceRecorder } from './VoiceRecorder'
import { FileUpload } from './FileUpload'
import { QuickActions } from './QuickActions'
import type { ChatMessage } from '@/lib/types'

interface ChatViewProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSend: (content: string, files?: File[]) => void
  onStop: () => void
  voiceMode?: boolean
}

export function ChatView({ messages, isStreaming, onSend, onStop, voiceMode }: ChatViewProps) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [showScrollDown, setShowScrollDown] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isAtBottomRef = useRef(true)
  const lastSpokenMessageIdRef = useRef<string | null>(null)

  // Auto-speak effect
  useEffect(() => {
    if (!voiceMode || messages.length === 0) return

    const lastMsg = messages[messages.length - 1]
    
    // Only speak assistant messages that are done streaming and haven't been spoken
    if (
      lastMsg.role === 'assistant' && 
      !lastMsg.isStreaming && 
      lastMsg.content && 
      lastMsg.id !== lastSpokenMessageIdRef.current
    ) {
      // Clean text and speak
      const cleanText = lastMsg.content
        .replace(/[*#`_\[\]]/g, '')
        .replace(/\n/g, '. ')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleanText) {
        // Cancel any previous speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(cleanText)
        window.speechSynthesis.speak(utterance)
        lastSpokenMessageIdRef.current = lastMsg.id
      }
    }
  }, [messages, voiceMode])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  function handleScroll() {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 100
    isAtBottomRef.current = atBottom
    setShowScrollDown(!atBottom && messages.length > 0)
  }

  function handleSubmit() {
    if ((!input.trim() && files.length === 0) || isStreaming) return
    onSend(input.trim(), files.length > 0 ? files : undefined)
    setInput('')
    setFiles([])
    isAtBottomRef.current = true
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleVoiceTranscript(text: string) {
    setInput(prev => prev ? `${prev} ${text}` : text)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-separator flex items-center justify-center">
              <span className="text-3xl">C</span>
            </div>
            <div className="text-center max-w-sm">
              <h2 className="text-[20px] font-semibold mb-2">Kiyomi Cockpit</h2>
              <p className="text-[15px] text-txt-tertiary leading-relaxed">
                Your personal AI development interface. Send a message, use a quick action, or start with voice.
              </p>
            </div>
            <QuickActions onAction={onSend} disabled={isStreaming} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll down indicator */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="
              absolute bottom-28 left-1/2 -translate-x-1/2
              w-8 h-8 rounded-full
              bg-surface-secondary border border-separator
              flex items-center justify-center
              shadow-apple
              hover:bg-surface-tertiary
              transition-colors duration-150
            "
          >
            <ArrowDown className="w-4 h-4 text-txt-tertiary" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick actions bar (when chat has messages) */}
      {messages.length > 0 && (
        <div className="px-4 pb-2">
          <QuickActions onAction={onSend} disabled={isStreaming} />
        </div>
      )}

      {/* Input area */}
      <div data-tutorial="chat-input" className="relative px-4 pb-4 safe-bottom">
        <div className="
          max-w-3xl mx-auto
          bg-surface-secondary border border-separator
          rounded-2xl
          overflow-hidden
          transition-all duration-200
          focus-within:border-white/20
        ">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Claude..."
            rows={1}
            className="
              w-full px-4 pt-3 pb-1
              bg-transparent text-[15px] text-txt-primary
              placeholder:text-txt-quaternary
              resize-none
              focus:outline-none
              min-h-[44px] max-h-[120px]
            "
            style={{
              height: 'auto',
              overflow: input.split('\n').length > 4 ? 'auto' : 'hidden',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-1">
              <FileUpload files={files} onFilesChange={setFiles} disabled={isStreaming} />
              <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={isStreaming} />
            </div>

            {isStreaming ? (
              <button
                onClick={onStop}
                className="
                  w-8 h-8 rounded-full
                  bg-system-red
                  flex items-center justify-center
                  transition-all duration-150
                  active:scale-[0.95]
                "
              >
                <Square className="w-3.5 h-3.5 text-white fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && files.length === 0}
                className="
                  w-8 h-8 rounded-full
                  bg-accent disabled:bg-surface-tertiary
                  flex items-center justify-center
                  transition-all duration-150 ease-apple
                  active:scale-[0.95]
                  disabled:cursor-not-allowed
                "
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
