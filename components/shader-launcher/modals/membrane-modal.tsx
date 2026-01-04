"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"
import { useEffect } from "react"

interface MembraneModalProps {
  onMount?: (resetFn: () => void) => void
}

export function MembraneModal({ onMount }: MembraneModalProps = {}) {
  const { settings, updateMembrane, setActiveEffect } = useShaderSettings()

  useEffect(() => {
    const handleReset = () => {
      setActiveEffect('none')
      updateMembrane({ depth: 0.3, ripple: 0.5 })
    }
    onMount?.(handleReset)
  }, [onMount, updateMembrane, setActiveEffect])

  const Slider = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    description: string
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
      <p className="text-xs text-foreground/50">{description}</p>
    </div>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Controls */}
      <div className="space-y-6">
        <Slider
          label="Depth"
          value={settings.membrane?.depth ?? 0.3}
          onChange={(value) => updateMembrane({ depth: value })}
          description="Controls height/displacement intensity and lighting strength"
        />
        <Slider
          label="Ripple"
          value={settings.membrane?.ripple ?? 0.5}
          onChange={(value) => updateMembrane({ ripple: value })}
          description="Controls circular wave amplitude and frequency"
        />
      </div>
    </div>
  )
}
