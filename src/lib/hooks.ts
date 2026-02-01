'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage, Session } from './types'
import { PROJECTS } from './constants'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState(PROJECTS[0])
  const abortRef = useRef<AbortController | null>(null)
  const isStreamingRef = useRef(false)

  // Keep ref in sync to avoid stale closure
  useEffect(() => { isStreamingRef.current = isStreaming }, [isStreaming])

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return
    if (isStreamingRef.current) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])

    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      toolCalls: [],
    }
    setMessages(prev => [...prev, assistantMessage])
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const formData = new FormData()
      formData.append('message', content.trim())
      formData.append('projectPath', currentProject.path)
      if (sessionId) formData.append('sessionId', sessionId)
      if (files) {
        files.forEach(file => formData.append('files', file))
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
        credentials: 'include',
      })

      if (response.status === 401) {
        // Don't reload — show error in chat instead
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.id === assistantId) {
            updated[updated.length - 1] = {
              ...last,
              isStreaming: false,
              content: 'Session expired. Please refresh the page and re-enter your PIN.',
            }
          }
          return updated
        })
        setIsStreaming(false)
        return
      }

      if (!response.ok) throw new Error('Chat request failed')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)

            if (event.type === 'system' && event.subtype === 'init') {
              setSessionId(event.session_id)
            }

            // Streaming text
            if (event.type === 'stream_event' && event.event?.delta?.type === 'text_delta') {
              const text = event.event.delta.text || ''
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.id === assistantId) {
                  updated[updated.length - 1] = { ...last, content: last.content + text }
                }
                return updated
              })
            }

            // Tool call start
            if (event.type === 'stream_event' && event.event?.type === 'content_block_start' && event.event?.content_block?.type === 'tool_use') {
              const toolCall = {
                id: event.event.content_block.id,
                name: event.event.content_block.name,
                input: {},
                status: 'running' as const,
              }
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.id === assistantId) {
                  updated[updated.length - 1] = {
                    ...last,
                    toolCalls: [...(last.toolCalls || []), toolCall],
                  }
                }
                return updated
              })
            }

            // Tool call complete
            if (event.type === 'stream_event' && event.event?.type === 'content_block_stop') {
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.id === assistantId && last.toolCalls) {
                  const tools = [...last.toolCalls]
                  const running = tools.findIndex(t => t.status === 'running')
                  if (running >= 0) {
                    tools[running] = { ...tools[running], status: 'complete' }
                  }
                  updated[updated.length - 1] = { ...last, toolCalls: tools }
                }
                return updated
              })
            }

            // Final result
            if (event.type === 'result') {
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.id === assistantId) {
                  updated[updated.length - 1] = {
                    ...last,
                    isStreaming: false,
                    content: last.content || event.result || '',
                  }
                }
                return updated
              })
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.id === assistantId) {
          updated[updated.length - 1] = {
            ...last,
            isStreaming: false,
            content: last.content || 'An error occurred. Please try again.',
          }
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [sessionId, currentProject])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  const loadMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [])

  return {
    messages,
    isStreaming,
    sessionId,
    currentProject,
    setCurrentProject,
    sendMessage,
    stopStreaming,
    clearChat,
    loadMessages,
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cockpit-sessions')
      if (stored) {
        setSessions(JSON.parse(stored))
      }
    } catch { /* storage not available */ }
  }, [])

  const saveSession = useCallback((session: Session) => {
    setSessions(prev => {
      const existing = prev.findIndex(s => s.id === session.id)
      const updated = existing >= 0
        ? prev.map(s => s.id === session.id ? session : s)
        : [session, ...prev]
      const trimmed = updated.slice(0, 50)
      try {
        localStorage.setItem('cockpit-sessions', JSON.stringify(trimmed))
      } catch { /* storage full or not available */ }
      return trimmed
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      try {
        localStorage.setItem('cockpit-sessions', JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  return { sessions, saveSession, deleteSession }
}

function getCachedAuth(): { authenticated: boolean; timestamp: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('cockpit-auth')
    if (cached) {
      const parsed = JSON.parse(cached)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (parsed.authenticated && Date.now() - parsed.timestamp < sevenDays) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return null
}

function setCachedAuth(authenticated: boolean) {
  try {
    if (authenticated) {
      localStorage.setItem('cockpit-auth', JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
      }))
    } else {
      localStorage.removeItem('cockpit-auth')
    }
  } catch { /* ignore */ }
}

export function useAuth() {
  const cached = getCachedAuth()
  const [authenticated, setAuthenticated] = useState(cached?.authenticated ?? false)
  const [loading, setLoading] = useState(!cached?.authenticated)

  useEffect(() => {
    // Verify auth in background — if cached, we already show authenticated
    fetch('/api/projects', { credentials: 'include' })
      .then(res => {
        setAuthenticated(res.ok)
        setCachedAuth(res.ok)
        setLoading(false)
      })
      .catch(() => {
        // Network error — don't un-authenticate if we had cached auth
        // (server might be temporarily unreachable)
        if (!cached?.authenticated) {
          setAuthenticated(false)
          setCachedAuth(false)
        }
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        credentials: 'include',
      })
      if (res.ok) {
        setAuthenticated(true)
        setCachedAuth(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    document.cookie = 'cockpit-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setAuthenticated(false)
    setCachedAuth(false)
  }, [])

  return { authenticated, loading, login, logout }
}
