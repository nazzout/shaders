"use client"

import { ReactNode } from "react"
import { X } from "lucide-react"

interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  isMobileLauncher?: boolean
}

export function ModalContainer({ isOpen, onClose, children, title, isMobileLauncher = false }: ModalContainerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
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
            : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-md mx-4"
        }`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
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
