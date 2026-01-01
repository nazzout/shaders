"use client"

import { useEffect, useState } from "react"

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
    enabled: boolean
    depth: number
    ripple: number
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
    enabled: false,
    depth: 0.3,
    ripple: 0.5,
  },
}

const STORAGE_KEY = "shader-settings"

export function useShaderSettings() {
  const [settings, setSettings] = useState<ShaderSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure membrane property exists
        setSettings({
          ...DEFAULT_SETTINGS,
          sections: { ...DEFAULT_SETTINGS.sections, ...parsed.sections },
          membrane: { ...DEFAULT_SETTINGS.membrane, ...(parsed.membrane || {}) },
        })
      }
    } catch (error) {
      console.error("Failed to load shader settings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage
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

  // Reset to default settings
  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS)
  }

  // Get color scheme array for shader-background.tsx compatibility
  const getColorSchemes = () => {
    return [
      settings.sections.hero,
      settings.sections.work,
      settings.sections.services,
      settings.sections.about,
      settings.sections.contact,
    ]
  }

  return {
    settings,
    isLoaded,
    updateSection,
    resetToDefaults,
    getColorSchemes,
  }
}
