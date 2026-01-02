"use client"

import { X, RotateCcw } from "lucide-react"
import { useShaderSettings, type SectionColors } from "@/components/shader-settings-provider"

interface ShaderSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SECTION_NAMES = {
  hero: "01 — Hero",
  work: "02 — Work",
  services: "03 — Services",
  about: "04 — About",
  contact: "05 — Contact",
}

const COLOR_FIELDS = [
  { key: "swirlA" as keyof SectionColors, label: "Swirl A" },
  { key: "swirlB" as keyof SectionColors, label: "Swirl B" },
  { key: "chromaBase" as keyof SectionColors, label: "Chroma Base" },
  { key: "chromaLeft" as keyof SectionColors, label: "Chroma Left" },
  { key: "chromaRight" as keyof SectionColors, label: "Chroma Right" },
]

export function ShaderSettingsPanel({ isOpen, onClose }: ShaderSettingsPanelProps) {
  const { settings, updateSection, updateMembrane, updateNodalParticles, resetToDefaults } = useShaderSettings()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-[70] h-screen w-full max-w-md overflow-hidden bg-background/95 shadow-2xl backdrop-blur-md sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Shader Settings</h2>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              title="Reset to defaults"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Membrane 3D Effect Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                  3D Membrane Effect
                </h3>
                <button
                  onClick={() => updateMembrane({ enabled: false, depth: 0.3, ripple: 0.5 })}
                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                  title="Reset to default gradient"
                >
                  Reset to Default
                </button>
              </div>
              <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Membrane Mode</label>
                  <button
                    onClick={() => updateMembrane({ enabled: !settings.membrane?.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.membrane?.enabled ? "bg-blue-600" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.membrane?.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {/* Depth Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Depth</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.membrane?.depth ?? 0.3).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.membrane?.depth ?? 0.3}
                    onChange={(e) => updateMembrane({ depth: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    Controls height/displacement intensity and lighting strength
                  </p>
                </div>

                {/* Ripple Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Ripple</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.membrane?.ripple ?? 0.5).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.membrane?.ripple ?? 0.5}
                    onChange={(e) => updateMembrane({ ripple: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    Controls circular wave amplitude and frequency
                  </p>
                </div>
              </div>
            </div>

            {/* Nodal Particles Effect Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                  Nodal Particles
                </h3>
                <button
                  onClick={() => updateNodalParticles({ enabled: false, density: 0.5, size: 0.4, drift: 0.6, influence: 0.5 })}
                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                  title="Reset to defaults"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Nodal Particles</label>
                  <button
                    onClick={() => updateNodalParticles({ enabled: !settings.nodalParticles?.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.nodalParticles?.enabled ? "bg-blue-600" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.nodalParticles?.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Density Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Density</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.nodalParticles?.density ?? 0.5).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.nodalParticles?.density ?? 0.5}
                    onChange={(e) => updateNodalParticles({ density: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    Particle count and spawn rate
                  </p>
                </div>

                {/* Size Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Size</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.nodalParticles?.size ?? 0.4).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.nodalParticles?.size ?? 0.4}
                    onChange={(e) => updateNodalParticles({ size: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    Particle radius
                  </p>
                </div>

                {/* Drift Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Drift</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.nodalParticles?.drift ?? 0.6).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.nodalParticles?.drift ?? 0.6}
                    onChange={(e) => updateNodalParticles({ drift: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    Flow along nodal field lines
                  </p>
                </div>

                {/* Influence Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/80">Influence</label>
                    <span className="font-mono text-xs text-foreground/60">
                      {(settings.nodalParticles?.influence ?? 0.5).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.nodalParticles?.influence ?? 0.5}
                    onChange={(e) => updateNodalParticles({ influence: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-xs text-foreground/50">
                    How strongly nodal field affects gradient
                  </p>
                </div>
              </div>
            </div>

            {/* Colorways Section Header */}
            <div className="pt-4 border-t border-foreground/10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-6">
                Colorways
              </h2>
            </div>

            {(Object.keys(SECTION_NAMES) as Array<keyof typeof SECTION_NAMES>).map((sectionKey) => (
              <div key={sectionKey} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                  {SECTION_NAMES[sectionKey]}
                </h3>
                <div className="space-y-3">
                  {COLOR_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">{label}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.sections[sectionKey][key]}
                          onChange={(e) =>
                            updateSection(sectionKey, {
                              [key]: e.target.value,
                            })
                          }
                          className="h-10 w-20 cursor-pointer rounded-lg border border-foreground/20 bg-transparent"
                        />
                        <span className="font-mono text-xs text-foreground/60">
                          {settings.sections[sectionKey][key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-8 rounded-lg border border-foreground/10 bg-foreground/5 p-4">
            <p className="text-xs text-foreground/60">
              Changes are automatically saved to your browser&apos;s local storage. Use the reset button to
              restore default colors.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
