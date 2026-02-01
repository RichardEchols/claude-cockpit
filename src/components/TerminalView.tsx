'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface TerminalViewProps {
  projectPath: string
}

export function TerminalView({ projectPath }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const termRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fitAddonRef = useRef<any>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const viewportHandlerRef = useRef<(() => void) | null>(null)
  const [connected, setConnected] = useState(false)
  const [ready, setReady] = useState(false)

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (viewportHandlerRef.current && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', viewportHandlerRef.current)
      viewportHandlerRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (termRef.current) {
      termRef.current.dispose()
      termRef.current = null
    }
    fitAddonRef.current = null
  }, [])

  const connect = useCallback(async () => {
    if (!containerRef.current) return

    cleanup()
    setReady(false)
    containerRef.current.innerHTML = ''

    try {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { WebLinksAddon } = await import('@xterm/addon-web-links')

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        fontSize: 13,
        fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace",
        lineHeight: 1.4,
        theme: {
          background: '#1c1c1e',
          foreground: '#ffffff',
          cursor: '#0a84ff',
          selectionBackground: 'rgba(10, 132, 255, 0.3)',
          black: '#1c1c1e',
          red: '#ff453a',
          green: '#30d158',
          yellow: '#ffd60a',
          blue: '#0a84ff',
          magenta: '#bf5af2',
          cyan: '#64d2ff',
          white: '#ffffff',
          brightBlack: '#3a3a3c',
          brightRed: '#ff6961',
          brightGreen: '#5ae07a',
          brightYellow: '#ffe566',
          brightBlue: '#409cff',
          brightMagenta: '#d484ff',
          brightCyan: '#8ae8ff',
          brightWhite: '#ffffff',
        },
        scrollback: 5000,
        allowProposedApi: true,
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)
      term.open(containerRef.current)

      termRef.current = term
      fitAddonRef.current = fitAddon

      // Delay initial fit so the container has its final size
      requestAnimationFrame(() => {
        fitAddon.fit()
        setReady(true)
      })

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws/terminal`)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        fitAddon.fit()
        const dims = fitAddon.proposeDimensions()
        ws.send(JSON.stringify({
          type: 'init',
          projectPath,
          cols: dims?.cols || 80,
          rows: dims?.rows || 24,
        }))
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'output') term.write(msg.data)
          if (msg.type === 'exit') {
            term.write('\r\n\x1b[33m[Session ended]\x1b[0m\r\n')
            setConnected(false)
          }
          if (msg.type === 'error') {
            term.write(`\r\n\x1b[31m[Error: ${msg.message}]\x1b[0m\r\n`)
          }
        } catch { /* raw data */ }
      }

      ws.onclose = () => {
        setConnected(false)
        if (termRef.current) {
          term.write('\r\n\x1b[33m[Disconnected]\x1b[0m\r\n')
        }
      }

      ws.onerror = () => setConnected(false)

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Focus terminal on tap (needed for mobile keyboard)
      term.focus()
      containerRef.current.addEventListener('touchstart', () => {
        term.focus()
      }, { passive: true })

      // Handle mobile keyboard resize via visualViewport API
      if (window.visualViewport) {
        const handleViewportResize = () => {
          if (!wrapperRef.current || !fitAddonRef.current) return
          const vv = window.visualViewport!
          wrapperRef.current.style.height = `${vv.height}px`
          fitAddonRef.current.fit()
          const dims = fitAddonRef.current.proposeDimensions()
          if (wsRef.current?.readyState === WebSocket.OPEN && dims) {
            wsRef.current.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }))
          }
        }
        window.visualViewport.addEventListener('resize', handleViewportResize)
        viewportHandlerRef.current = handleViewportResize
      }

      // Debounced resize handler for desktop/orientation changes
      let resizeTimeout: NodeJS.Timeout | null = null
      const observer = new ResizeObserver(() => {
        if (resizeTimeout) clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          if (fitAddonRef.current) {
            fitAddonRef.current.fit()
            const dims = fitAddonRef.current.proposeDimensions()
            if (wsRef.current?.readyState === WebSocket.OPEN && dims) {
              wsRef.current.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }))
            }
          }
        }, 100)
      })
      observer.observe(containerRef.current)
      observerRef.current = observer
    } catch (err) {
      console.error('Terminal init error:', err)
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="p-4 text-system-red text-sm">Failed to initialize terminal: ${(err as Error).message}</div>`
      }
    }
  }, [projectPath, cleanup])

  useEffect(() => {
    connect()
    return cleanup
  }, [connect, cleanup])

  return (
    <div ref={wrapperRef} className="flex flex-col h-full">
      {/* Compact status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface-secondary flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-system-green' : 'bg-system-red'}`} />
          <span className="text-[11px] text-txt-quaternary font-mono">
            {connected ? 'connected' : 'disconnected'}
          </span>
        </div>
        {!connected && (
          <button
            onClick={connect}
            className="p-1 rounded-md hover:bg-surface-tertiary transition-colors duration-150"
          >
            <RefreshCw className="w-3 h-3 text-txt-tertiary" />
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className={`flex-1 bg-surface-secondary overflow-hidden transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
