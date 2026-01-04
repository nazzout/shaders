"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"

export function MembraneModal() {
  const { settings, updateMembrane, setActiveEffect } = useShaderSettings()
  const isActive = settings.activeEffect === 'membrane'

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
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 cursor-pointer"
        style={{ accentColor: 'currentColor' }}
      />
      <p className="text-xs text-foreground/50">{description}</p>
    </div>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="text-sm text-foreground/60">
        Creates a 3D membrane effect with depth displacement and circular ripples.
      </p>
      <div className="rounded-lg bg-foreground/5 border border-foreground/10 px-3 py-2">
        <p className="text-xs text-foreground/60">
          <strong>⚠️ Waveform Mode:</strong> Enabling this will disable Field Lines if active. Only one waveform can be active at a time.
        </p>
      </div>

      {/* Enable/Disable Button */}
      <button
        onClick={() => setActiveEffect(isActive ? 'none' : 'membrane')}
        className={`
          w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
          ${isActive 
            ? "bg-blue-600/20 text-blue-600 ring-2 ring-blue-600/30" 
            : "bg-foreground/10 text-foreground hover:bg-foreground/15"
          }
        `}
      >
        {isActive ? 'Disable Membrane' : 'Enable Membrane'}
      </button>

      {/* Controls - only show when active */}
      {isActive && (
        <div className="space-y-6 pt-2">
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
      )}
    </div>
  )
}
