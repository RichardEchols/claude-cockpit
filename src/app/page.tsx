'use client'

import { useState, useEffect } from 'react'
import { AuthGate } from '@/components/AuthGate'
import { Dashboard } from '@/components/Dashboard'
import { InstallWizard } from '@/components/InstallWizard'
import { useAuth } from '@/lib/hooks'

export default function Home() {
  const { authenticated, loading: authLoading, login, logout } = useAuth()
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupLoading, setSetupLoading] = useState(true)

  useEffect(() => {
    const done = localStorage.getItem('kiyomi_setup_complete')
    setSetupComplete(done === 'true')
    setSetupLoading(false)
  }, [])

  if (setupLoading || authLoading) {
    return (
      <div className="fixed inset-0 bg-surface-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!setupComplete) {
    return <InstallWizard onComplete={() => setSetupComplete(true)} />
  }

  if (!authenticated) {
    return <AuthGate onAuth={login} />
  }

  return <Dashboard onLogout={logout} />
}