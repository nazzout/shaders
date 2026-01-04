"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"
import { useEffect } from "react"

interface FieldLinesModalProps {
  onMount?: (resetFn: () => void) => void
}

export function FieldLinesModal({ onMount }: FieldLinesModalProps = {}) {
  const { settings, updateNodalParticles, setActiveEffect } = useShaderSettings()

  useEffect(() => {
    const handleReset = () => {
      setActiveEffect('none')
      updateNodalParticles({ density: 0.5, size: 0.4, drift: 0.6, influence: 0.5 })
    }
    onMount?.(handleReset)
  }, [onMount, updateNodalParticles, setActiveEffect])

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
          label="Density"
          value={settings.nodalParticles?.density ?? 0.5}
          onChange={(value) => updateNodalParticles({ density: value })}
          description="Particle count and spawn rate"
        />
        <Slider
          label="Size"
          value={settings.nodalParticles?.size ?? 0.4}
          onChange={(value) => updateNodalParticles({ size: value })}
          description="Particle radius"
        />
        <Slider
          label="Drift"
          value={settings.nodalParticles?.drift ?? 0.6}
          onChange={(value) => updateNodalParticles({ drift: value })}
          description="Flow along nodal field lines"
        />
        <Slider
          label="Influence"
          value={settings.nodalParticles?.influence ?? 0.5}
          onChange={(value) => updateNodalParticles({ influence: value })}
          description="How strongly nodal field affects gradient"
        />
      </div>
    </div>
  )
}
