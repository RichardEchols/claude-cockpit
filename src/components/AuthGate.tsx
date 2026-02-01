'use client'

import { useState, useRef, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuthGateProps {
  onAuth: (pin: string) => Promise<boolean>
}

export function AuthGate({ onAuth }: AuthGateProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  async function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    setError(false)

    if (value && index < 3) {
      setFocusIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === 3) {
      const fullPin = newPin.join('')
      if (fullPin.length === 4) {
        setChecking(true)
        const success = await onAuth(fullPin)
        setChecking(false)
        if (!success) {
          setError(true)
          setPin(['', '', '', ''])
          setFocusIndex(0)
          setTimeout(() => inputRefs.current[0]?.focus(), 100)
        }
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      setFocusIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="fixed inset-0 bg-surface-primary flex items-center justify-center safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col items-center gap-8 px-6"
      >
        <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center">
          <Shield className="w-8 h-8 text-accent" />
        </div>

        <div className="text-center">
          <h1 className="text-[22px] font-bold tracking-tight">Kiyomi Cockpit</h1>
          <p className="text-[15px] text-txt-tertiary mt-2">Enter your PIN to continue</p>
        </div>

        <div className="flex gap-3">
          {pin.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setFocusIndex(index)}
              disabled={checking}
              animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`
                w-14 h-16 text-center text-2xl font-bold
                bg-surface-tertiary rounded-xl
                border-2 transition-all duration-200 ease-apple
                focus:outline-none
                disabled:opacity-50
                ${focusIndex === index ? 'border-accent' : 'border-transparent'}
                ${error ? 'border-system-red' : ''}
              `}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-system-red text-[13px]"
          >
            Incorrect PIN. Try again.
          </motion.p>
        )}

        {checking && (
          <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
        )}
      </motion.div>
    </div>
  )
}
