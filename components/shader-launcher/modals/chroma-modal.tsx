"use client"

import { useShaderSettings } from "@/components/shader-settings-provider"

export function ChromaModal() {
  const { settings, updateChaos } = useShaderSettings()

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
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 cursor-pointer"
        style={{ accentColor: 'currentColor' }}
      />
      {description && <p className="text-xs text-foreground/50">{description}</p>}
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
        Domain distortion, chromatic aberration, and audio overdrive effects. These effects stack on top of any active waveform.
      </p>

      {/* Chaos Mode Section */}
      <div className="space-y-4">
        <Toggle
          label="Enable Chaos"
          enabled={settings.chaos.enabled}
          onToggle={() => updateChaos({ enabled: !settings.chaos.enabled })}
        />
        {settings.chaos.enabled && (
          <div className="pt-2">
            <Slider
              label="Chaos Amount"
              value={settings.chaos.amount}
              onChange={(value) => updateChaos({ amount: value })}
              description="Domain distortion, chromatic aberration, and audio overdrive"
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-foreground/10">
        <p className="text-xs text-foreground/50">
          <strong>Note:</strong> Chaos mode can be combined with Membrane, Field Lines, or the base gradient. Cursor interaction is always enabled at maximum strength.
        </p>
      </div>
    </div>
  )
}
