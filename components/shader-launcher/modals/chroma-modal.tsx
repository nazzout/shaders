"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"
import { useEffect } from "react"

interface ChromaModalProps {
  onMount?: (resetFn: () => void) => void
}

export function ChromaModal({ onMount }: ChromaModalProps = {}) {
  const { settings, updateChaos } = useShaderSettings()

  useEffect(() => {
    const handleReset = () => {
      updateChaos({ enabled: false, amount: 0.5 })
    }
    onMount?.(handleReset)
  }, [onMount, updateChaos])

  const Slider = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    description?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-lg font-bold text-foreground">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => {
          e.stopPropagation()
          onChange(parseFloat(e.target.value))
        }}
        className="w-full h-3 cursor-pointer"
        style={{ accentColor: 'currentColor' }}
      />
      {description && <p className="text-xs text-foreground/50">{description}</p>}
    </div>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Chaos Mode Section */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            updateChaos({ enabled: !settings.chaos.enabled })
          }}
          className={`
            w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
            ${settings.chaos.enabled
              ? "bg-red-600/20 text-red-600 ring-2 ring-red-600/30" 
              : "bg-foreground/10 text-foreground hover:bg-foreground/15"
            }
          `}
        >
          {settings.chaos.enabled ? 'Disable Chaos' : 'Enable Chaos'}
        </button>
        
        {settings.chaos.enabled && (
          <div className="space-y-4">
            <Slider
              label="Chaos Amount"
              value={settings.chaos.amount}
              onChange={(value) => updateChaos({ amount: value })}
              description="Domain distortion, chromatic aberration, and audio overdrive"
            />
          </div>
        )}
      </div>
    </div>
  )
}
