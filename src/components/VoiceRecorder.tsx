'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
        recognitionRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    let transcript = ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' '
        }
      }
    }

    recognition.onend = () => {
      setRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setDuration(0)
      if (transcript.trim()) {
        onTranscript(transcript.trim())
      }
    }

    recognition.onerror = () => {
      setRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setDuration(0)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
    setDuration(0)
    intervalRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }
  }, [])

  function formatDuration(s: number) {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {recording ? (
          <motion.div
            key="recording"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-[13px] font-mono text-system-red">
              {formatDuration(duration)}
            </span>
            <button
              onClick={stopRecording}
              className="
                w-10 h-10 rounded-full
                bg-system-red
                flex items-center justify-center
                voice-recording
                transition-all duration-200
                active:scale-[0.95]
              "
            >
              <Square className="w-4 h-4 text-white fill-white" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={startRecording}
            disabled={disabled}
            className="
              w-10 h-10 rounded-full
              bg-surface-tertiary hover:bg-surface-quaternary
              flex items-center justify-center
              transition-all duration-200 ease-apple
              active:scale-[0.95]
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Mic className="w-4.5 h-4.5 text-txt-secondary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
