import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, renderHook, act, waitFor } from '@testing-library/react'
import { ShaderSettingsProvider, useShaderSettings } from '@/components/shader-settings-provider'

describe('ShaderSettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('updateChaos', () => {
    it('should correctly update chaos enabled setting', () => {
      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      // Initial state
      expect(result.current.settings.chaos.enabled).toBe(false)
      expect(result.current.settings.chaos.amount).toBe(0.5)

      // Enable chaos
      act(() => {
        result.current.updateChaos({ enabled: true })
      })

      expect(result.current.settings.chaos.enabled).toBe(true)
      expect(result.current.settings.chaos.amount).toBe(0.5) // Amount should remain unchanged
    })

    it('should correctly update chaos amount setting', () => {
      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      // Update amount
      act(() => {
        result.current.updateChaos({ amount: 0.8 })
      })

      expect(result.current.settings.chaos.enabled).toBe(false) // Enabled should remain unchanged
      expect(result.current.settings.chaos.amount).toBe(0.8)
    })

    it('should correctly update both chaos enabled and amount', () => {
      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      // Update both
      act(() => {
        result.current.updateChaos({ enabled: true, amount: 0.75 })
      })

      expect(result.current.settings.chaos.enabled).toBe(true)
      expect(result.current.settings.chaos.amount).toBe(0.75)
    })

    it('should persist chaos settings to localStorage', async () => {
      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      act(() => {
        result.current.updateChaos({ enabled: true, amount: 0.9 })
      })

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'shader-settings',
          expect.stringContaining('"chaos"')
        )
      })

      const savedSettings = JSON.parse(
        (localStorage.setItem as any).mock.calls[0][1]
      )
      expect(savedSettings.chaos.enabled).toBe(true)
      expect(savedSettings.chaos.amount).toBe(0.9)
    })

    it('should load chaos settings from localStorage on mount', () => {
      const storedSettings = JSON.stringify({
        sections: {},
        membrane: { enabled: false, depth: 0.3, ripple: 0.5 },
        nodalParticles: { enabled: false, density: 0.5, size: 0.4, drift: 0.6, influence: 0.5 },
        chaos: { enabled: true, amount: 0.65 },
      })

      localStorage.getItem = vi.fn(() => storedSettings)

      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      expect(result.current.settings.chaos.enabled).toBe(true)
      expect(result.current.settings.chaos.amount).toBe(0.65)
    })

    it('should handle partial updates without losing other settings', () => {
      const { result } = renderHook(() => useShaderSettings(), {
        wrapper: ({ children }) => <ShaderSettingsProvider>{children}</ShaderSettingsProvider>,
      })

      // Set initial chaos state
      act(() => {
        result.current.updateChaos({ enabled: true, amount: 0.7 })
      })

      // Update membrane settings
      act(() => {
        result.current.updateMembrane({ enabled: true, depth: 0.6 })
      })

      // Chaos settings should still be preserved
      expect(result.current.settings.chaos.enabled).toBe(true)
      expect(result.current.settings.chaos.amount).toBe(0.7)
    })
  })
})
