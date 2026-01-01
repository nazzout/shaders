"use client"

import { X, RotateCcw } from "lucide-react"
import { useShaderSettings, type SectionColors } from "@/components/shader-settings-provider"

interface ShaderSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SECTION_NAMES = {
  hero: "Hero",
  work: "Work",
  services: "Services",
  about: "About",
  contact: "Contact",
}

const COLOR_FIELDS = [
  { key: "swirlA" as keyof SectionColors, label: "Swirl A" },
  { key: "swirlB" as keyof SectionColors, label: "Swirl B" },
  { key: "chromaBase" as keyof SectionColors, label: "Chroma Base" },
  { key: "chromaLeft" as keyof SectionColors, label: "Chroma Left" },
  { key: "chromaRight" as keyof SectionColors, label: "Chroma Right" },
]

export function ShaderSettingsPanel({ isOpen, onClose }: ShaderSettingsPanelProps) {
  const { settings, updateSection, resetToDefaults } = useShaderSettings()

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
