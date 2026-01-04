"use client"

import { ReactNode } from "react"
import { X, RotateCcw } from "lucide-react"

interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  isMobileLauncher?: boolean
  onReset?: () => void
}

export function ModalContainer({ isOpen, onClose, children, title, isMobileLauncher = false, onReset }: ModalContainerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay - click to close */}
      <div 
        className="fixed inset-0 z-[70]"
        onClick={onClose}
        data-ui-panel
      />
      
      {/* Modal/Bottom Sheet */}
      <div
        data-ui-panel
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-[71] bg-background/95 backdrop-blur-md shadow-2xl ${
          isMobileLauncher
            ? "inset-x-0 bottom-0 rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh]"
            : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-md"
        }`}
        style={isMobileLauncher ? {} : { maxHeight: '90vh' }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <div className="flex items-center gap-2">
              {onReset && (
                <button
                  onClick={onReset}
                  className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto ${isMobileLauncher ? "max-h-[calc(85vh-73px)]" : "max-h-[80vh]"}`}>
          {children}
        </div>
      </div>
    </>
  )
}
