'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, MessageCircle, Zap, BarChart3, Sparkles } from 'lucide-react'

interface FirstRunTutorialProps {
  onComplete: () => void
  onSendMessage: (msg: string) => void
}

interface TutorialStep {
  title: string
  description: string
  icon: React.ReactNode
  targetSelector: string
  buttonLabel: string
}

const STEPS: TutorialStep[] = [
  {
    title: 'Talk to me here',
    description: 'Type anything in the chat to get started. I can help with tasks, answer questions, and manage your workflow.',
    icon: <MessageCircle className="w-6 h-6" />,
    targetSelector: '[data-tutorial="chat-input"]',
    buttonLabel: 'Next',
  },
  {
    title: 'Press buttons for quick help',
    description: 'These shortcuts let you trigger common actions with one tap — no typing needed.',
    icon: <Zap className="w-6 h-6" />,
    targetSelector: '[data-tutorial="quick-actions"]',
    buttonLabel: 'Next',
  },
  {
    title: 'See your data here',
    description: 'Your dashboard shows business metrics, reports, and an overview of everything at a glance.',
    icon: <BarChart3 className="w-6 h-6" />,
    targetSelector: '[data-tutorial="dashboard-panel"]',
    buttonLabel: 'Next',
  },
  {
    title: "Try saying 'Good morning'!",
    description: "That's all you need to know. Let's start with a friendly greeting — I'll take it from here.",
    icon: <Sparkles className="w-6 h-6" />,
    targetSelector: '',
    buttonLabel: 'Get Started',
  },
]

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function FirstRunTutorial({ onComplete, onSendMessage }: FirstRunTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const step = STEPS[currentStep]

  // Find and measure the target element for spotlight
  const updateSpotlight = useCallback(() => {
    const selector = STEPS[currentStep].targetSelector
    if (!selector) {
      setSpotlight(null)
      return
    }
    const el = document.querySelector(selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      const padding = 8
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })
    } else {
      setSpotlight(null)
    }
  }, [currentStep])

  useEffect(() => {
    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Final step: send message then complete
      onSendMessage('Good morning')
      localStorage.setItem('kiyomi_tutorial_complete', 'true')
      onComplete()
    }
  }, [currentStep, onComplete, onSendMessage])

  const handleSkip = useCallback(() => {
    localStorage.setItem('kiyomi_tutorial_complete', 'true')
    onComplete()
  }, [onComplete])

  // Compute tooltip position relative to spotlight
  const getTooltipPosition = (): React.CSSProperties => {
    if (!spotlight) {
      // Center on screen for final step
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const viewportH = window.innerHeight
    const viewportW = window.innerWidth
    const tooltipW = 340
    const gap = 16

    // Prefer placing below the spotlight
    const belowSpace = viewportH - (spotlight.top + spotlight.height)
    const aboveSpace = spotlight.top

    const style: React.CSSProperties = {
      position: 'absolute',
      width: tooltipW,
    }

    if (belowSpace > 200) {
      style.top = spotlight.top + spotlight.height + gap
    } else if (aboveSpace > 200) {
      style.bottom = viewportH - spotlight.top + gap
    } else {
      style.top = '50%'
      style.transform = 'translateY(-50%)'
    }

    // Horizontal: center on spotlight, clamp to viewport
    let left = spotlight.left + spotlight.width / 2 - tooltipW / 2
    left = Math.max(16, Math.min(left, viewportW - tooltipW - 16))
    style.left = left

    return style
  }

  // SVG mask for spotlight cutout
  const renderOverlay = () => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
    const r = 16 // corner radius

    if (!spotlight) {
      return (
        <div className="absolute inset-0 bg-black/60" />
      )
    }

    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            <rect
              x={spotlight.left}
              y={spotlight.top}
              width={spotlight.width}
              height={spotlight.height}
              rx={r}
              ry={r}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
        {/* Glow ring around spotlight */}
        <rect
          x={spotlight.left - 2}
          y={spotlight.top - 2}
          width={spotlight.width + 4}
          height={spotlight.height + 4}
          rx={r + 2}
          ry={r + 2}
          fill="none"
          stroke="rgba(10, 132, 255, 0.4)"
          strokeWidth="2"
        />
      </svg>
    )
  }

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100]"
      onClick={(e) => {
        // Only skip if clicking the overlay itself, not the tooltip
        if (e.target === overlayRef.current) {
          // Do nothing — let them interact with the tooltip
        }
      }}
    >
      {/* Dark overlay with spotlight cutout */}
      {renderOverlay()}

      {/* Skip button — top right */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleSkip}
        className="absolute top-4 right-4 z-[102] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary/80 backdrop-blur-xl border border-separator text-txt-secondary text-sm hover:text-txt-primary hover:bg-surface-tertiary transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Skip
      </motion.button>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={getTooltipPosition()}
          className="z-[101] absolute"
        >
          <div className="bg-surface-secondary/95 backdrop-blur-2xl border border-separator rounded-2xl p-5 shadow-apple-lg max-w-[340px]">
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                {step.icon}
              </div>
              <h3 className="text-[17px] font-semibold text-txt-primary leading-snug">
                {step.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-[14px] leading-relaxed text-txt-secondary mb-5">
              {step.description}
            </p>

            {/* Footer: dots + button */}
            <div className="flex items-center justify-between">
              {/* Step indicator dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-5 bg-accent'
                        : idx < currentStep
                          ? 'w-1.5 bg-accent/50'
                          : 'w-1.5 bg-txt-quaternary'
                    }`}
                  />
                ))}
              </div>

              {/* Action button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors"
              >
                {step.buttonLabel}
                {currentStep < STEPS.length - 1 ? (
                  <ArrowRight className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
