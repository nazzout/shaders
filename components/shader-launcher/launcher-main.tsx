"use client"

import { X, RotateCcw } from "lucide-react"
import { useShaderSettings, SECTION_KEYS } from "@/components/shader-settings-provider"
import type { ModalType } from "./types"

interface LauncherMainProps {
  onOpenModal: (modal: ModalType, section?: 'hero' | 'work' | 'services' | 'about' | 'contact') => void
  onClose: () => void
}

export function LauncherMain({ onOpenModal, onClose }: LauncherMainProps) {
  const { settings, setActiveEffect, resetToDefaults } = useShaderSettings()

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Morphos</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              resetToDefaults()
            }}
            className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
            aria-label="Reset to defaults"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="px-6 py-6 space-y-8">
      {/* Controls Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Controls
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenModal('chroma')
            }}
            className={`
              relative min-h-[56px] rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer
              ${settings.chaos.enabled
                ? "bg-foreground/20 ring-2 ring-foreground/30" 
                : "bg-foreground/10 hover:bg-foreground/15 active:scale-98"
              }
            `}
          >
            <span className="text-sm font-medium text-foreground">Chroma</span>
            {settings.chaos.enabled && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/80" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenModal('distortion')
            }}
            className={`
              relative min-h-[56px] rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer
              ${settings.turbulence.enabled
                ? "bg-foreground/20 ring-2 ring-foreground/30" 
                : "bg-foreground/10 hover:bg-foreground/15 active:scale-98"
              }
            `}
          >
            <span className="text-sm font-medium text-foreground">Distortion</span>
            {settings.turbulence.enabled && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/80" />
            )}
          </button>
        </div>
      </div>

      {/* Waveform Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Waveform
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveEffect('membrane')
              onOpenModal('membrane')
            }}
            className={`
              relative min-h-[56px] rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer
              ${settings.activeEffect === 'membrane'
                ? "bg-foreground/20 ring-2 ring-foreground/30" 
                : "bg-foreground/10 hover:bg-foreground/15 active:scale-98"
              }
            `}
          >
            <span className="text-sm font-medium text-foreground">Membrane</span>
            {settings.activeEffect === 'membrane' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/80" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveEffect('nodalParticles')
              onOpenModal('fieldLines')
            }}
            className={`
              relative min-h-[56px] rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer
              ${settings.activeEffect === 'nodalParticles'
                ? "bg-foreground/20 ring-2 ring-foreground/30" 
                : "bg-foreground/10 hover:bg-foreground/15 active:scale-98"
              }
            `}
          >
            <span className="text-sm font-medium text-foreground">Field Lines</span>
            {settings.activeEffect === 'nodalParticles' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/80" />
            )}
          </button>
        </div>
      </div>

      {/* Colorways Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Colorways
        </h3>
        <div className="flex gap-2 max-h-[72px] h-[72px]">
          {SECTION_KEYS.map((section, index) => {
            const colors = settings.sections[section]
            return (
              <button
                key={section}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenModal('colorway', section)
                }}
                className="flex-1 h-[72px] max-h-[72px] w-[72px] max-w-[72px] sm:w-auto sm:max-w-none rounded-full sm:rounded-lg overflow-hidden border-2 border-foreground/20 hover:border-foreground/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${colors.swirlA} 0%, ${colors.swirlB} 100%)`
                }}
                aria-label={`Edit ${section} colorway`}
              >
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-xs font-bold text-white drop-shadow-md truncate">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}
