'use client'

import { useRef, useState } from 'react'
import { Paperclip, X, FileText, Image, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('text') || type.includes('json') || type.includes('javascript') || type.includes('typescript')) return FileText
  return File
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({ files, onFilesChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return
    const combined = [...files, ...Array.from(newFiles)]
    onFilesChange(combined)
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index)
    onFilesChange(updated)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          transition-all duration-200 ease-apple
          active:scale-[0.95]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${dragOver ? 'bg-accent/20 border-accent' : 'bg-surface-tertiary hover:bg-surface-quaternary'}
        `}
      >
        <Paperclip className="w-4.5 h-4.5 text-txt-secondary" />
      </button>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute bottom-full left-0 right-0 mb-2 px-4 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {files.map((file, index) => {
                const Icon = getFileIcon(file.type)
                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="
                      flex items-center gap-2 px-3 py-2
                      bg-surface-secondary border border-separator
                      rounded-lg flex-shrink-0
                    "
                  >
                    <Icon className="w-3.5 h-3.5 text-txt-quaternary" />
                    <span className="text-[12px] text-txt-secondary max-w-[100px] truncate">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-txt-quaternary">{formatSize(file.size)}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-1 text-txt-quaternary hover:text-system-red transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
