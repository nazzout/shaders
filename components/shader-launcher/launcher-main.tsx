"use client"

import { useShaderSettings, SECTION_KEYS } from "@/components/shader-settings-provider"
import type { ModalType } from "./types"

interface LauncherMainProps {
  onOpenModal: (modal: ModalType, section?: 'hero' | 'work' | 'services' | 'about' | 'contact') => void
}

export function LauncherMain({ onOpenModal }: LauncherMainProps) {
  const { settings } = useShaderSettings()

  // Button component for consistent styling
  const Button = ({ 
    label, 
    onClick, 
    isActive = false,
    className = ""
  }: { 
    label: string
    onClick: () => void
    isActive?: boolean
    className?: string
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`
        relative min-h-[56px] rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer
        ${isActive 
          ? "bg-foreground/20 ring-2 ring-foreground/30" 
          : "bg-foreground/10 hover:bg-foreground/15 active:scale-98"
        }
        ${className}
      `}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      {isActive && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/80" />
      )}
    </button>
  )

  return (
    <div className="px-6 py-6 space-y-8">
      {/* Controls Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Controls
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            label="Chroma" 
            onClick={() => onOpenModal('chroma')}
            isActive={settings.chaos.enabled}
          />
          <Button 
            label="Distortion" 
            onClick={() => onOpenModal('distortion')}
            isActive={settings.turbulence.enabled}
          />
        </div>
      </div>

      {/* Waveform Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Waveform
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            label="Membrane" 
            onClick={() => onOpenModal('membrane')}
            isActive={settings.activeEffect === 'membrane'}
          />
          <Button 
            label="Field Lines" 
            onClick={() => onOpenModal('fieldLines')}
            isActive={settings.activeEffect === 'nodalParticles'}
          />
        </div>
      </div>

      {/* Colorways Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 px-1">
          Colorways
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {SECTION_KEYS.map((section, index) => {
            const colors = settings.sections[section]
            return (
              <button
                key={section}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenModal('colorway', section)
                }}
                className="aspect-square rounded-lg overflow-hidden border-2 border-foreground/20 hover:border-foreground/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${colors.swirlA} 0%, ${colors.swirlB} 100%)`
                }}
                aria-label={`Edit ${section} colorway`}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
