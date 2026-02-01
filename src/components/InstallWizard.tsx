'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User, Shield, Cpu, Bot, Check, ChevronRight } from 'lucide-react'

interface InstallWizardProps {
  onComplete: () => void
}

export const InstallWizard: React.FC<InstallWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  // Step 2 State
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Step 3 State
  const [selectedAI, setSelectedAI] = useState('both')

  // Step 4 State
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])

  const handleNext = () => {
    setDirection(1)
    setStep((prev) => prev + 1)
  }

  const handleFinish = () => {
    const config = { name, city, timezone, aiProvider: selectedAI, pin: pinDigits.join('') }
    localStorage.setItem('kiyomi_setup', JSON.stringify(config))
    localStorage.setItem('kiyomi_setup_complete', 'true')
    // Also set the PIN for the auth system
    localStorage.setItem('cockpit-pin', config.pin)
    onComplete()
  }

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple chars
    if (!/^\d*$/.test(value)) return // Only digits

    const newPin = [...pinDigits]
    newPin[index] = value
    setPinDigits(newPin)

    // Auto-advance
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  }

  return (
    <div className="fixed inset-0 bg-surface-primary flex items-center justify-center overflow-hidden">
      <div className="max-w-md w-full mx-auto px-6 flex flex-col items-center">
        
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-system-purple rounded-apple-xl flex items-center justify-center mb-6 shadow-glow-blue">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-txt-primary mb-3">Welcome to Kiyomi ✨</h1>
              <p className="text-txt-secondary text-lg mb-8">
                Your personal AI assistant. Let's get you set up in 60 seconds.
              </p>
              <button
                onClick={handleNext}
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-semibold rounded-apple-lg shadow-apple-md transition-colors flex items-center justify-center"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
              className="w-full"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-surface-tertiary rounded-full flex items-center justify-center mb-4 text-accent">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-txt-primary">Tell Us About You</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm text-txt-secondary mb-1.5 ml-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 bg-surface-tertiary border border-separator rounded-apple-lg px-4 text-txt-primary placeholder-txt-quaternary focus:border-accent focus:outline-none transition-colors"
                    placeholder="Jane Doe"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-txt-secondary mb-1.5 ml-1">Your City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 bg-surface-tertiary border border-separator rounded-apple-lg px-4 text-txt-primary placeholder-txt-quaternary focus:border-accent focus:outline-none transition-colors"
                    placeholder="For weather in your morning brief"
                  />
                </div>
                <div>
                  <label className="block text-sm text-txt-secondary mb-1.5 ml-1">Your Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-12 bg-surface-tertiary border border-separator rounded-apple-lg px-4 text-txt-primary focus:border-accent focus:outline-none transition-colors appearance-none"
                  >
                    {[ 
                      Intl.DateTimeFormat().resolvedOptions().timeZone,
                      'America/New_York',
                      'America/Chicago',
                      'America/Denver',
                      'America/Los_Angeles',
                      'America/Anchorage',
                      'Pacific/Honolulu',
                      'America/Phoenix',
                      'America/Indianapolis',
                      'America/Detroit',
                      'America/Toronto',
                      'America/Vancouver',
                      'America/Mexico_City',
                      'America/Sao_Paulo',
                      'Europe/London',
                      'Europe/Paris',
                      'Europe/Berlin',
                      'Europe/Moscow',
                      'Asia/Dubai',
                      'Asia/Kolkata',
                      'Asia/Shanghai',
                      'Asia/Tokyo',
                      'Asia/Seoul',
                      'Asia/Singapore',
                      'Australia/Sydney',
                      'Pacific/Auckland',
                      'UTC',
                    ]
                      .filter((v, i, a) => a.indexOf(v) === i) // unique
                      .map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                      ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full h-12 bg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover text-white font-semibold rounded-apple-lg shadow-apple-md transition-all flex items-center justify-center"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
              className="w-full"
            >
               <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-surface-tertiary rounded-full flex items-center justify-center mb-4 text-accent">
                  {selectedAI === 'gemini' ? <Bot className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
                </div>
                <h2 className="text-2xl font-bold text-txt-primary">Choose Your AI</h2>
              </div>

              <div className="space-y-3 mb-8">
                {[ 
                  { id: 'gemini', title: 'Free (Gemini)', desc: 'Google\'s AI. Free forever. Great for most tasks.' },
                  { id: 'claude', title: 'Claude Max ($20/mo)', desc: 'Anthropic\'s AI. Best for coding & complex work. Requires Claude Max subscription.' },
                  { id: 'both', title: 'Both (Recommended)', desc: 'Use free Gemini for simple tasks, Claude for complex ones.', recommended: true },
                ].map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedAI(option.id)}
                    className={`relative p-4 rounded-apple-lg border-2 cursor-pointer transition-all ${ 
                      selectedAI === option.id
                        ? 'bg-accent/10 border-accent shadow-apple-sm'
                        : 'bg-surface-secondary border-separator hover:border-separator-opaque'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-txt-primary mb-1 flex items-center gap-2">
                          {option.title}
                          {option.recommended && (
                            <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Best
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-txt-secondary leading-snug">{option.desc}</p>
                      </div>
                      {selectedAI === option.id && (
                        <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-semibold rounded-apple-lg shadow-apple-md transition-all flex items-center justify-center"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-surface-tertiary rounded-full flex items-center justify-center mb-6 text-system-green">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-txt-primary mb-2">Set Your PIN</h2>
              <p className="text-txt-secondary text-center mb-8">
                Choose a 4-digit PIN to protect your dashboard
              </p>

              <div className="flex gap-3 mb-8">
                {pinDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className={`w-14 h-16 bg-surface-tertiary border-2 rounded-xl text-center text-2xl font-bold text-txt-primary focus:outline-none transition-colors ${ 
                      digit ? 'border-accent' : 'border-transparent focus:border-accent'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleFinish}
                disabled={pinDigits.some(d => !d)}
                className="w-full h-12 bg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover text-white font-semibold rounded-apple-lg shadow-apple-md transition-all flex items-center justify-center"
              >
                Finish Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Indicator */}
        <div className="absolute bottom-12 flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${ 
                step === i ? 'bg-accent scale-110' : 'bg-surface-quaternary'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
