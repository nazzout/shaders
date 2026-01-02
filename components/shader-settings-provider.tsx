"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface SectionColors {
  swirlA: string
  swirlB: string
  chromaBase: string
  chromaLeft: string
  chromaRight: string
}

export interface ShaderSettings {
  sections: {
    hero: SectionColors
    work: SectionColors
    services: SectionColors
    about: SectionColors
    contact: SectionColors
  }
  membrane: {
    enabled: boolean // Toggle membrane mode on/off
    depth: number    // 0-1, controls displacement intensity and lighting
    ripple: number   // 0-1, controls circular wave strength
  }
  nodalParticles: {
    enabled: boolean // Toggle nodal particles on/off
    density: number  // 0-1, particle count/spawn rate
    size: number     // 0-1, particle radius
    drift: number    // 0-1, flow along field lines
    influence: number // 0-1, how strongly nodal field affects gradient
  }
  chaos: {
    enabled: boolean // Toggle chaos mode on/off
    amount: number   // 0-1, chaos intensity
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
  membrane: {
    enabled: false,  // Default to original gradient mode
    depth: 0.3,
    ripple: 0.5,
  },
  nodalParticles: {
    enabled: false,
    density: 0.5,
    size: 0.4,
    drift: 0.6,
    influence: 0.5,
  },
  chaos: {
    enabled: false,
    amount: 0.5,
  },
}

const STORAGE_KEY = "shader-settings"

interface ShaderSettingsContextType {
  settings: ShaderSettings
  isLoaded: boolean
  updateSection: (section: keyof ShaderSettings["sections"], colors: Partial<SectionColors>) => void
  updateMembrane: (params: Partial<ShaderSettings["membrane"]>) => void
  updateNodalParticles: (params: Partial<ShaderSettings["nodalParticles"]>) => void
  updateChaos: (params: Partial<ShaderSettings["chaos"]>) => void
  resetToDefaults: () => void
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
          sections: { ...DEFAULT_SETTINGS.sections, ...parsed.sections },
          membrane: { ...DEFAULT_SETTINGS.membrane, ...(parsed.membrane || {}) },
          nodalParticles: { ...DEFAULT_SETTINGS.nodalParticles, ...(parsed.nodalParticles || {}) },
          chaos: { ...DEFAULT_SETTINGS.chaos, ...(parsed.chaos || {}) },
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

  // Reset to default settings
  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS)
  }

  return (
    <ShaderSettingsContext.Provider value={{ settings, isLoaded, updateSection, updateMembrane, updateNodalParticles, updateChaos, resetToDefaults }}>
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
