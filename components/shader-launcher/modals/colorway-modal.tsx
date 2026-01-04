"use client"

import { useShaderSettings, type SectionColors } from "@/components/shader-settings-provider"

interface ColorwayModalProps {
  section: 'hero' | 'work' | 'services' | 'about' | 'contact'
}

const SECTION_LABELS = {
  hero: "01",
  work: "02",
  services: "03",
  about: "04",
  contact: "05",
}

const COLOR_FIELDS: Array<{ key: keyof SectionColors; label: string }> = [
  { key: "swirlA", label: "Swirl A" },
  { key: "swirlB", label: "Swirl B" },
  { key: "chromaBase", label: "Chroma Base" },
  { key: "chromaLeft", label: "Chroma Left" },
  { key: "chromaRight", label: "Chroma Right" },
]

export function ColorwayModal({ section }: ColorwayModalProps) {
  const { settings, updateSection } = useShaderSettings()
  const colors = settings.sections[section]

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${colors.swirlA} 0%, ${colors.swirlB} 100%)`
          }}
        />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Section {SECTION_LABELS[section]}
          </h3>
          <p className="text-xs text-foreground/60 capitalize">{section}</p>
        </div>
      </div>

      <div className="space-y-4">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-foreground min-w-[120px]">
              {label}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => updateSection(section, { [key]: e.target.value })}
                className="h-12 w-20 cursor-pointer rounded-lg border-2 border-foreground/20 bg-transparent hover:border-foreground/40 transition-colors"
              />
              <span className="font-mono text-xs text-foreground/60 w-20">
                {colors[key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-foreground/10">
        <p className="text-xs text-foreground/50">
          Colors are automatically saved and persist across sessions.
        </p>
      </div>
    </div>
  )
}
