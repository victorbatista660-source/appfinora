import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={cn(
          'w-full bg-surface border border-border-line rounded-xl shadow-dropdown overflow-hidden flex flex-col',
          widths[maxWidth]
        )}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border-line">
          <div>
            <h2 id="modal-title" className="text-xl font-display font-semibold text-text-primary">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1 font-sans">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-muted-surface rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}
