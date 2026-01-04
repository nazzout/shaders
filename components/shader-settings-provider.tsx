"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface SectionColors {
  swirlA: string
  swirlB: string
  chromaBase: string
  chromaLeft: string
  chromaRight: string
}

export type ActiveEffect = 'none' | 'membrane' | 'nodalParticles'
export type SectionKey = 'hero' | 'work' | 'services' | 'about' | 'contact'

// Section keys array for iteration and indexing
export const SECTION_KEYS: readonly SectionKey[] = ['hero', 'work', 'services', 'about', 'contact'] as const

export interface ShaderSettings {
  sections: {
    hero: SectionColors
    work: SectionColors
    services: SectionColors
    about: SectionColors
    contact: SectionColors
  }
  activeEffect: ActiveEffect  // Mutually exclusive: only one effect can be active
  membrane: {
    depth: number    // 0-1, controls displacement intensity and lighting
    ripple: number   // 0-1, controls circular wave strength
  }
  nodalParticles: {
    density: number  // 0-1, particle count/spawn rate
    size: number     // 0-1, particle radius
    drift: number    // 0-1, flow along field lines
    influence: number // 0-1, how strongly nodal field affects gradient
  }
  chaos: {
    enabled: boolean // Toggle chaos mode on/off (can stack with active effect)
    amount: number   // 0-1, chaos intensity
  }
  turbulence: {
    enabled: boolean // Toggle turbulence on/off (can stack with any effect)
    strength: number // 0-1, UV warp amount
    scale: number    // 0.25-5, noise frequency/detail size
    speed: number    // 0-3, animation rate
    octaves: number  // 1-4, quality/detail
  }
  cursor: {
    strength: number // 0-1, cursor influence intensity
  }
}

// Default color schemes
const DEFAULT_SETTINGS: ShaderSettings = {
  sections: {
    hero: {
      swirlA: "#1275d8",
      swirlB: "#e19136",
      chromaBase: "#0066ff",
      chromaLeft: "#e19136",
      chromaRight: "#e19136",
    },
    work: {
      swirlA: "#8b5cf6",
      swirlB: "#ec4899",
      chromaBase: "#a855f7",
      chromaLeft: "#f472b6",
      chromaRight: "#f472b6",
    },
    services: {
      swirlA: "#10b981",
      swirlB: "#14b8a6",
      chromaBase: "#059669",
      chromaLeft: "#0d9488",
      chromaRight: "#0d9488",
    },
    about: {
      swirlA: "#f59e0b",
      swirlB: "#ef4444",
      chromaBase: "#f97316",
      chromaLeft: "#dc2626",
      chromaRight: "#dc2626",
    },
    contact: {
      swirlA: "#6366f1",
      swirlB: "#06b6d4",
      chromaBase: "#4f46e5",
      chromaLeft: "#0891b2",
      chromaRight: "#0891b2",
    },
  },
  activeEffect: 'none',  // Default to no effect (original gradient mode)
  membrane: {
    depth: 0.3,
    ripple: 0.5,
  },
  nodalParticles: {
    density: 0.5,
    size: 0.4,
    drift: 0.6,
    influence: 0.5,
  },
  chaos: {
    enabled: false,
    amount: 0.5,
  },
  turbulence: {
    enabled: false,
    strength: 0.5,
    scale: 2.0,
    speed: 1.0,
    octaves: 2,
  },
  cursor: {
    strength: 1.0, // Always maximum - cursor interaction enabled at full strength
  },
}

const STORAGE_KEY = "shader-settings"

interface ShaderSettingsContextType {
  settings: ShaderSettings
  isLoaded: boolean
  updateSection: (section: keyof ShaderSettings["sections"], colors: Partial<SectionColors>) => void
  setActiveEffect: (effect: ActiveEffect) => void
  updateMembrane: (params: Partial<ShaderSettings["membrane"]>) => void
  updateNodalParticles: (params: Partial<ShaderSettings["nodalParticles"]>) => void
  updateChaos: (params: Partial<ShaderSettings["chaos"]>) => void
  updateTurbulence: (params: Partial<ShaderSettings["turbulence"]>) => void
  updateCursor: (params: Partial<ShaderSettings["cursor"]>) => void
  resetToDefaults: () => void
  getSectionColors: (index: number) => SectionColors
}

const ShaderSettingsContext = createContext<ShaderSettingsContextType | undefined>(undefined)

export function ShaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShaderSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        
        // Merge with defaults to ensure all properties exist
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          sections: { ...DEFAULT_SETTINGS.sections, ...parsed.sections },
          membrane: { ...DEFAULT_SETTINGS.membrane, ...parsed.membrane },
          nodalParticles: { ...DEFAULT_SETTINGS.nodalParticles, ...parsed.nodalParticles },
          chaos: { ...DEFAULT_SETTINGS.chaos, ...parsed.chaos },
          turbulence: { ...DEFAULT_SETTINGS.turbulence, ...parsed.turbulence },
          cursor: { ...DEFAULT_SETTINGS.cursor, ...parsed.cursor },
        })
      }
    } catch (error) {
      console.error("Failed to load shader settings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage and update state
  const saveSettings = (newSettings: ShaderSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error("Failed to save shader settings:", error)
    }
  }

  // Set the active effect (mutually exclusive)
  const setActiveEffect = (effect: ActiveEffect) => {
    const newSettings = {
      ...settings,
      activeEffect: effect,
    }
    saveSettings(newSettings)
  }

  // Update a specific section's colors
  const updateSection = (section: keyof ShaderSettings["sections"], colors: Partial<SectionColors>) => {
    const newSettings = {
      ...settings,
      sections: {
        ...settings.sections,
        [section]: {
          ...settings.sections[section],
          ...colors,
        },
      },
    }
    saveSettings(newSettings)
  }

  // Update membrane parameters
  const updateMembrane = (params: Partial<ShaderSettings["membrane"]>) => {
    const newSettings = {
      ...settings,
      membrane: {
        ...settings.membrane,
        ...params,
      },
    }
    saveSettings(newSettings)
  }

  // Update nodal particles parameters
  const updateNodalParticles = (params: Partial<ShaderSettings["nodalParticles"]>) => {
    const newSettings = {
      ...settings,
      nodalParticles: {
        ...settings.nodalParticles,
        ...params,
      },
    }
    saveSettings(newSettings)
  }

  // Update chaos parameters
  const updateChaos = (params: Partial<ShaderSettings["chaos"]>) => {
    const newSettings = {
      ...settings,
      chaos: {
        ...settings.chaos,
        ...params,
      },
    }
    saveSettings(newSettings)
  }

  // Update turbulence parameters
  const updateTurbulence = (params: Partial<ShaderSettings["turbulence"]>) => {
    const newSettings = {
      ...settings,
      turbulence: {
        ...settings.turbulence,
        ...params,
      },
    }
    saveSettings(newSettings)
  }

  // Update cursor parameters
  const updateCursor = (params: Partial<ShaderSettings["cursor"]>) => {
    const newSettings = {
      ...settings,
      cursor: {
        ...settings.cursor,
        ...params,
      },
    }
    saveSettings(newSettings)
  }


  // Reset to default settings
  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS)
  }

  /**
   * Get colors for a section by index (0-4)
   * @param index - Section index (0=hero, 1=work, 2=services, 3=about, 4=contact)
   * @returns Section colors with defaults applied
   */
  const getSectionColors = (index: number): SectionColors => {
    const sectionKey = SECTION_KEYS[index]
    if (!sectionKey) {
      console.warn(`Invalid section index: ${index}, falling back to hero`)
      return settings.sections.hero || DEFAULT_SETTINGS.sections.hero
    }
    return settings.sections[sectionKey] || DEFAULT_SETTINGS.sections[sectionKey]
  }

  return (
    <ShaderSettingsContext.Provider value={{ settings, isLoaded, updateSection, setActiveEffect, updateMembrane, updateNodalParticles, updateChaos, updateTurbulence, updateCursor, resetToDefaults, getSectionColors }}>
      {children}
    </ShaderSettingsContext.Provider>
  )
}

export function useShaderSettings() {
  const context = useContext(ShaderSettingsContext)
  if (context === undefined) {
    throw new Error("useShaderSettings must be used within a ShaderSettingsProvider")
  }
  return context
}
