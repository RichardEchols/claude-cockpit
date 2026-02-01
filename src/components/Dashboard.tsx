'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Menu, LogOut, Terminal, X, LayoutGrid, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatView } from './ChatView'
import { TerminalView } from './TerminalView'
import { ProjectSwitcher } from './ProjectSwitcher'
import { SessionSidebar } from './SessionSidebar'
import DashboardPanel from './DashboardPanel'
import { FirstRunTutorial } from './FirstRunTutorial'
import { useChat, useSessions } from '@/lib/hooks'
import { PROJECTS } from '@/lib/constants'
import { getVertical } from '@/lib/verticals'
import type { Session } from '@/lib/types'

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const {
    messages,
    isStreaming,
    sessionId,
    currentProject,
    setCurrentProject,
    sendMessage,
    stopStreaming,
    clearChat,
    loadMessages,
  } = useChat()
  const { sessions, saveSession, deleteSession } = useSessions()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [currentVertical, setCurrentVertical] = useState(() => getVertical('custom'))
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setVoiceMode(localStorage.getItem('kiyomi_voice_mode') === 'true')
  }, [])

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode(prev => {
      const newValue = !prev
      localStorage.setItem('kiyomi_voice_mode', String(newValue))
      if (!newValue) window.speechSynthesis.cancel()
      return newValue
    })
  }, [])

  // Hide dashboard by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDashboardOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check for first-run tutorial
  useEffect(() => {
    if (!localStorage.getItem('kiyomi_tutorial_complete')) {
      setShowTutorial(true)
    }
  }, [])

  // Debounced session auto-save
  useEffect(() => {
    if (!sessionId || messages.length === 0) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      const firstUserMsg = messages.find(m => m.role === 'user')
      const title = firstUserMsg?.content.slice(0, 50) || 'New Session'
      saveSession({
        id: sessionId,
        title,
        project: currentProject.name,
        projectPath: currentProject.path,
        messages,
        createdAt: messages[0]?.timestamp || Date.now(),
        updatedAt: Date.now(),
      })
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [messages, sessionId, currentProject, saveSession])

  const handleNewSession = useCallback(() => {
    clearChat()
  }, [clearChat])

  const handleSelectSession = useCallback((session: Session) => {
    const project = PROJECTS.find(p => p.path === session.projectPath) || PROJECTS[0]
    setCurrentProject(project)
    loadMessages(session.messages)
  }, [setCurrentProject, loadMessages])

  return (
    <div className="fixed inset-0 flex bg-surface-primary safe-top">
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-separator bg-surface-primary/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                w-8 h-8 rounded-lg hover:bg-surface-tertiary
                flex items-center justify-center
                transition-colors duration-150
              "
            >
              <Menu className="w-4.5 h-4.5 text-txt-secondary" />
            </button>
            <span className="text-[15px] font-semibold text-txt-primary truncate">
              ✨ Kiyomi — {currentVertical.name}
            </span>
            <ProjectSwitcher
              projects={PROJECTS}
              selected={currentProject}
              onSelect={setCurrentProject}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDashboardOpen(prev => !prev)}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-colors duration-150
                ${dashboardOpen ? 'bg-accent/20 text-accent' : 'hover:bg-surface-tertiary text-txt-tertiary'}
              `}
              title="Toggle Dashboard"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={toggleVoiceMode}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-colors duration-150
                ${voiceMode ? 'bg-accent/20 text-accent' : 'hover:bg-surface-tertiary text-txt-tertiary'}
              `}
              title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode'}
            >
              {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setTerminalOpen(true)}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-colors duration-150
                ${terminalOpen ? 'bg-accent/20 text-accent' : 'hover:bg-surface-tertiary text-txt-tertiary'}
              `}
              title="Open Terminal"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="
                w-8 h-8 rounded-lg hover:bg-surface-tertiary
                flex items-center justify-center
                transition-colors duration-150
              "
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-txt-quaternary" />
            </button>
          </div>
        </header>

        {/* Split panel: Chat (left) + Dashboard (right) */}
        <main className="flex-1 min-h-0 flex flex-row">
          {/* Chat panel — always visible */}
          <div className="flex-1 min-w-0 relative">
            <ChatView
              messages={messages}
              isStreaming={isStreaming}
              onSend={sendMessage}
              onStop={stopStreaming}
              voiceMode={voiceMode}
            />
          </div>

          {/* Dashboard panel — collapsible right side */}
          <DashboardPanel
            vertical={currentVertical}
            onAction={sendMessage}
            isOpen={dashboardOpen}
          />
        </main>
      </div>

      {/* First-run tutorial overlay */}
      <AnimatePresence>
        {showTutorial && (
          <FirstRunTutorial
            onComplete={() => setShowTutorial(false)}
            onSendMessage={sendMessage}
          />
        )}
      </AnimatePresence>

      {/* Terminal sheet overlay */}
      <AnimatePresence>
        {terminalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setTerminalOpen(false)}
            />

            {/* Terminal sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface-secondary rounded-t-2xl overflow-hidden safe-bottom"
              style={{ height: '85vh' }}
            >
              {/* Sheet handle + close */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-separator flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded-full bg-white/20 mx-auto" />
                </div>
                <span className="text-[13px] font-medium text-txt-secondary">Terminal</span>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-tertiary flex items-center justify-center transition-colors duration-150"
                >
                  <X className="w-4 h-4 text-txt-tertiary" />
                </button>
              </div>

              {/* Terminal content */}
              <div className="flex-1 min-h-0">
                <TerminalView projectPath={currentProject.path} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
