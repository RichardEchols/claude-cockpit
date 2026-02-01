'use client'

import { useState, useEffect, useCallback } from 'react'
import { Volume2 } from 'lucide-react'

interface SpeakButtonProps {
  text: string
}

export function SpeakButton({ text }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(() => {
    if (!text) return

    // Cancel any current speech
    window.speechSynthesis.cancel()

    // Strip markdown
    const cleanText = text
      .replace(/[*#`_[\]]/g, '') // Remove basic markdown symbols
      .replace(/\n/g, '. ') // Replace newlines with pauses
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Setup events
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text])

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center
        w-4 h-4 rounded-full
        transition-colors duration-200
        ${isSpeaking ? 'text-accent animate-pulse' : 'text-txt-quaternary hover:text-txt-secondary'}
      `}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      <Volume2 className="w-3.5 h-3.5" />
    </button>
  )
}
