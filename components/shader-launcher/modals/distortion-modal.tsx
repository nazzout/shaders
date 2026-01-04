"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"

export function DistortionModal() {
  const { settings, updateTurbulence } = useShaderSettings()

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
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 cursor-pointer"
        style={{ accentColor: 'currentColor' }}
      />
    </div>
  )

  const Toggle = ({
    label,
    enabled,
    onToggle
  }: {
    label: string
    enabled: boolean
    onToggle: () => void
  }) => (
    <button
      onClick={onToggle}
      className={`
        w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200
        ${enabled ? "bg-foreground/20 ring-2 ring-foreground/30" : "bg-foreground/10 hover:bg-foreground/15"}
      `}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className={`
        w-11 h-6 rounded-full transition-colors duration-200
        ${enabled ? "bg-foreground/60" : "bg-foreground/30"}
      `}>
        <div className={`
          h-full aspect-square rounded-full bg-white shadow-md transition-transform duration-200
          ${enabled ? "translate-x-full" : "translate-x-0"}
        `} />
      </div>
    </button>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="text-sm text-foreground/60">
        UV distortion with controllable noise patterns. Adds organic, flowing movement to the visual effects.
      </p>

      {/* Turbulence Section */}
      <div className="space-y-4">
        <Toggle
          label="Enable Turbulence"
          enabled={settings.turbulence.enabled}
          onToggle={() => updateTurbulence({ enabled: !settings.turbulence.enabled })}
        />
        {settings.turbulence.enabled && (
          <div className="pt-2 space-y-4">
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

      <div className="pt-4 border-t border-foreground/10">
        <p className="text-xs text-foreground/50">
          <strong>Strength:</strong> Intensity of UV distortion<br />
          <strong>Scale:</strong> Size of distortion patterns<br />
          <strong>Speed:</strong> Animation speed<br />
          <strong>Octaves:</strong> Detail/complexity level
        </p>
        <p className="text-xs text-foreground/50 mt-3">
          <strong>Note:</strong> Turbulence stacks on top of any active waveform (Membrane, Field Lines, or base gradient).
        </p>
      </div>
    </div>
  )
}
