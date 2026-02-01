'use client'

import { AuthGate } from '@/components/AuthGate'
import { Dashboard } from '@/components/Dashboard'
import { useAuth } from '@/lib/hooks'

export default function Home() {
  const { authenticated, loading, login, logout } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 bg-surface-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return <AuthGate onAuth={login} />
  }

  return <Dashboard onLogout={logout} />
}
