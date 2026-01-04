"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"
import { useEffect } from "react"

interface DistortionModalProps {
  onMount?: (resetFn: () => void) => void
}

export function DistortionModal({ onMount }: DistortionModalProps = {}) {
  const { settings, updateTurbulence } = useShaderSettings()

  useEffect(() => {
    const handleReset = () => {
      updateTurbulence({ enabled: false, strength: 0.5, scale: 2.0, speed: 1.0, octaves: 2 })
    }
    onMount?.(handleReset)
  }, [onMount, updateTurbulence])

  const Slider = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 1, 
    step = 0.01 
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-base font-bold text-foreground">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          e.stopPropagation()
          onChange(parseFloat(e.target.value))
        }}
        className="w-full h-3 cursor-pointer"
        style={{ accentColor: 'currentColor' }}
      />
    </div>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Turbulence Section */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            updateTurbulence({ enabled: !settings.turbulence.enabled })
          }}
          className={`
            w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
            ${settings.turbulence.enabled
              ? "bg-purple-600/20 text-purple-600 ring-2 ring-purple-600/30" 
              : "bg-foreground/10 text-foreground hover:bg-foreground/15"
            }
          `}
        >
          {settings.turbulence.enabled ? 'Disable Turbulence' : 'Enable Turbulence'}
        </button>
        
        {settings.turbulence.enabled && (
          <div className="space-y-4">
            <Slider
              label="Strength"
              value={settings.turbulence.strength}
              onChange={(value) => updateTurbulence({ strength: value })}
            />
            <Slider
              label="Scale"
              value={settings.turbulence.scale}
              onChange={(value) => updateTurbulence({ scale: value })}
              min={0.25}
              max={5}
            />
            <Slider
              label="Speed"
              value={settings.turbulence.speed}
              onChange={(value) => updateTurbulence({ speed: value })}
              min={0}
              max={3}
            />
            <Slider
              label="Octaves"
              value={settings.turbulence.octaves}
              onChange={(value) => updateTurbulence({ octaves: Math.round(value) })}
              min={1}
              max={4}
              step={1}
            />
          </div>
        )}
      </div>
    </div>
  )
}
