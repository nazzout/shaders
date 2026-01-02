"use client"

import { useState } from "react"
import { X, RotateCcw, ChevronDown } from "lucide-react"
import { useShaderSettings, type SectionColors } from "@/components/shader-settings-provider"

interface ShaderSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SECTION_NAMES = {
  hero: "01",
  work: "02",
  services: "03",
  about: "04",
  contact: "05",
}

const COLOR_FIELDS = [
  { key: "swirlA" as keyof SectionColors, label: "Swirl A" },
  { key: "swirlB" as keyof SectionColors, label: "Swirl B" },
  { key: "chromaBase" as keyof SectionColors, label: "Chroma Base" },
  { key: "chromaLeft" as keyof SectionColors, label: "Chroma Left" },
  { key: "chromaRight" as keyof SectionColors, label: "Chroma Right" },
]

export function ShaderSettingsPanel({ isOpen, onClose }: ShaderSettingsPanelProps) {
  const { settings, updateSection, setActiveEffect, updateMembrane, updateNodalParticles, updateChaos, updateTurbulence, resetToDefaults } = useShaderSettings()
  
  // Accordion state - all collapsed by default
  const [openPanels, setOpenPanels] = useState<{
    chaos: boolean
    turbulence: boolean
    membrane: boolean
    nodalParticles: boolean
  }>({
    chaos: false,
    turbulence: false,
    membrane: false,
    nodalParticles: false,
  })

  // Handle chaos toggle with accordion behavior
  const handleChaosToggle = () => {
    const newEnabled = !settings.chaos?.enabled
    updateChaos({ enabled: newEnabled })
    
    // Open chaos panel when enabled, close when disabled
    setOpenPanels(prev => ({
      ...prev,
      chaos: newEnabled,
    }))
  }

  // Handle turbulence toggle with accordion behavior
  const handleTurbulenceToggle = () => {
    const newEnabled = !settings.turbulence?.enabled
    updateTurbulence({ enabled: newEnabled })
    
    // Open turbulence panel when enabled, close when disabled
    setOpenPanels(prev => ({
      ...prev,
      turbulence: newEnabled,
    }))
  }

  // Handle membrane toggle with mutual exclusivity and accordion behavior
  const handleMembraneToggle = () => {
    const isCurrentlyActive = settings.activeEffect === 'membrane'
    
    if (isCurrentlyActive) {
      // Disable membrane
      setActiveEffect('none')
      setOpenPanels(prev => ({
        ...prev,
        membrane: false,
      }))
    } else {
      // Enable membrane (automatically disables nodal particles due to mutual exclusivity)
      setActiveEffect('membrane')
      setOpenPanels(prev => ({
        ...prev,
        membrane: true,
        nodalParticles: false,
      }))
    }
  }

  // Handle nodal particles toggle with mutual exclusivity and accordion behavior
  const handleNodalParticlesToggle = () => {
    const isCurrentlyActive = settings.activeEffect === 'nodalParticles'
    
    if (isCurrentlyActive) {
      // Disable nodal particles
      setActiveEffect('none')
      setOpenPanels(prev => ({
        ...prev,
        nodalParticles: false,
      }))
    } else {
      // Enable nodal particles (automatically disables membrane due to mutual exclusivity)
      setActiveEffect('nodalParticles')
      setOpenPanels(prev => ({
        ...prev,
        nodalParticles: true,
        membrane: false,
      }))
    }
  }

  // Toggle panel open/closed manually
  const togglePanel = (panel: 'chaos' | 'turbulence' | 'membrane' | 'nodalParticles') => {
    setOpenPanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Panel */}
      <div data-ui-panel className="fixed right-0 top-0 z-[70] h-screen w-full max-w-md overflow-hidden bg-background/95 shadow-2xl backdrop-blur-md sm:max-w-lg">
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
            {/* Chaos Mode Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePanel('chaos')}
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openPanels.chaos ? "rotate-0" : "-rotate-90"
                  }`} />
                  Chaos Mode
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleChaosToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.chaos?.enabled ? "bg-red-600" : "bg-foreground/20"
                    }`}
                    title="Toggle Chaos Mode"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.chaos?.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => updateChaos({ enabled: false, amount: 0.5 })}
                    className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    title="Reset to defaults"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Collapsible Panel Content */}
              {openPanels.chaos && (
                <div className="space-y-4 pl-6 border-l-2 border-foreground/10">
                  {/* Chaos Amount Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">Chaos</label>
                      <span className="font-mono text-xs text-foreground/60">
                        {(settings.chaos?.amount ?? 0.5).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={settings.chaos?.amount ?? 0.5}
                      onChange={(e) => updateChaos({ amount: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                      aria-label="Chaos"
                    />
                    <p className="text-xs text-foreground/50">
                      Domain distortion, chromatic aberration, and audio overdrive
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Turbulence Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePanel('turbulence')}
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openPanels.turbulence ? "rotate-0" : "-rotate-90"
                  }`} />
                  Turbulence
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTurbulenceToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.turbulence?.enabled ? "bg-purple-600" : "bg-foreground/20"
                    }`}
                    title="Toggle Turbulence"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.turbulence?.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => updateTurbulence({ enabled: false, strength: 0.5, scale: 2.0, speed: 1.0, octaves: 2 })}
                    className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    title="Reset to defaults"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Collapsible Panel Content */}
              {openPanels.turbulence && (
                <div className="space-y-4 pl-6 border-l-2 border-foreground/10">
                  {/* Strength Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">Strength</label>
                      <span className="font-mono text-xs text-foreground/60">
                        {(settings.turbulence?.strength ?? 0.5).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={settings.turbulence?.strength ?? 0.5}
                      onChange={(e) => updateTurbulence({ strength: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                      aria-label="Turbulence Strength"
                    />
                    <p className="text-xs text-foreground/50">
                      Controls intensity of UV distortion
                    </p>
                  </div>

                  {/* Scale Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">Scale</label>
                      <span className="font-mono text-xs text-foreground/60">
                        {(settings.turbulence?.scale ?? 2.0).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="5"
                      step="0.01"
                      value={settings.turbulence?.scale ?? 2.0}
                      onChange={(e) => updateTurbulence({ scale: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                      aria-label="Turbulence Scale"
                    />
                    <p className="text-xs text-foreground/50">
                      Controls size of distortion patterns
                    </p>
                  </div>

                  {/* Speed Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">Speed</label>
                      <span className="font-mono text-xs text-foreground/60">
                        {(settings.turbulence?.speed ?? 1.0).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.01"
                      value={settings.turbulence?.speed ?? 1.0}
                      onChange={(e) => updateTurbulence({ speed: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                      aria-label="Turbulence Speed"
                    />
                    <p className="text-xs text-foreground/50">
                      Controls animation speed of distortion
                    </p>
                  </div>

                  {/* Octaves Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground/80">Octaves</label>
                      <span className="font-mono text-xs text-foreground/60">
                        {settings.turbulence?.octaves ?? 2}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={settings.turbulence?.octaves ?? 2}
                      onChange={(e) => updateTurbulence({ octaves: parseInt(e.target.value, 10) })}
                      className="w-full cursor-pointer"
                      aria-label="Turbulence Octaves"
                    />
                    <p className="text-xs text-foreground/50">
                      Controls detail/complexity of distortion
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Membrane 3D Effect Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePanel('membrane')}
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openPanels.membrane ? "rotate-0" : "-rotate-90"
                  }`} />
                  3D Membrane Effect
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMembraneToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.activeEffect === 'membrane' ? "bg-blue-600" : "bg-foreground/20"
                    }`}
                    title="Toggle Membrane Mode"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.activeEffect === 'membrane' ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setActiveEffect('none')
                      updateMembrane({ depth: 0.3, ripple: 0.5 })
                    }}
                    className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    title="Reset to default gradient"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Collapsible Panel Content */}
              {openPanels.membrane && (
                <div className="space-y-4 pl-6 border-l-2 border-foreground/10">
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
              )}
            </div>

            {/* Nodal Particles Effect Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePanel('nodalParticles')}
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openPanels.nodalParticles ? "rotate-0" : "-rotate-90"
                  }`} />
                  Nodal Particles
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNodalParticlesToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.activeEffect === 'nodalParticles' ? "bg-blue-600" : "bg-foreground/20"
                    }`}
                    title="Toggle Nodal Particles"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.activeEffect === 'nodalParticles' ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setActiveEffect('none')
                      updateNodalParticles({ density: 0.5, size: 0.4, drift: 0.6, influence: 0.5 })
                    }}
                    className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    title="Reset to defaults"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Collapsible Panel Content */}
              {openPanels.nodalParticles && (
                <div className="space-y-4 pl-6 border-l-2 border-foreground/10">
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
              )}
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
