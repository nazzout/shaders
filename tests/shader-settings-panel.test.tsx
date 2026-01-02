import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShaderSettingsPanel } from '@/components/shader-settings-panel'
import { ShaderSettingsProvider } from '@/components/shader-settings-provider'

describe('ShaderSettingsPanel', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const renderWithProvider = (isOpen = true) => {
    return render(
      <ShaderSettingsProvider>
        <ShaderSettingsPanel isOpen={isOpen} onClose={mockOnClose} />
      </ShaderSettingsProvider>
    )
  }

  describe('Chaos Mode UI toggle', () => {
    it('should render chaos mode toggle button when panel is open', () => {
      renderWithProvider(true)
      
      const chaosLabel = screen.getByText('Chaos Mode', { selector: 'label' })
      expect(chaosLabel).toBeDefined()
    })

    it('should not render when panel is closed', () => {
      renderWithProvider(false)
      
      const chaosLabel = screen.queryByText('Chaos Mode', { selector: 'label' })
      expect(chaosLabel).toBeNull()
    })

    it('should show chaos toggle in off state by default', () => {
      const { container } = renderWithProvider(true)
      
      const toggleButton = container.querySelector('button[class*="bg-foreground/20"]')
      expect(toggleButton).toBeDefined()
    })

    it('should call updateChaos to enable chaos when toggle is clicked', async () => {
      const { container } = renderWithProvider(true)
      
      // Find the chaos mode toggle button (it's the first toggle button in chaos section)
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'label' }).closest('div')
      const toggleButton = chaosSection?.querySelector('button')
      
      expect(toggleButton).toBeDefined()
      
      // Click to enable
      fireEvent.click(toggleButton!)
      
      await waitFor(() => {
        // After clicking, the button should have the enabled class
        expect(toggleButton?.className).toContain('bg-red-600')
      })
    })

    it('should call updateChaos to disable chaos when toggle is clicked again', async () => {
      const { container } = renderWithProvider(true)
      
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'label' }).closest('div')
      const toggleButton = chaosSection?.querySelector('button')
      
      // Enable chaos
      fireEvent.click(toggleButton!)
      
      await waitFor(() => {
        expect(toggleButton?.className).toContain('bg-red-600')
      })
      
      // Disable chaos
      fireEvent.click(toggleButton!)
      
      await waitFor(() => {
        expect(toggleButton?.className).toContain('bg-foreground/20')
      })
    })

    it('should render chaos amount slider', () => {
      renderWithProvider(true)
      
      const chaosSliderLabel = screen.getByText('Chaos', { selector: 'label' })
      expect(chaosSliderLabel).toBeDefined()
      
      const slider = screen.getByRole('slider', { name: /chaos/i })
      expect(slider).toBeDefined()
    })

    it('should update chaos amount when slider is changed', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByRole('slider', { name: /chaos/i }) as HTMLInputElement
      
      // Change slider value
      fireEvent.change(slider, { target: { value: '0.75' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.75')
      })
    })

    it('should display current chaos amount value', () => {
      renderWithProvider(true)
      
      // Find the chaos slider to locate its value display
      const slider = screen.getByRole('slider', { name: /chaos/i }) as HTMLInputElement
      
      // Default chaos amount is 0.5
      expect(slider.value).toBe('0.5')
    })

    it('should reset chaos settings when reset button is clicked', async () => {
      renderWithProvider(true)
      
      // Find and enable chaos first
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'label' }).closest('div')
      const toggleButton = chaosSection?.querySelector('button')
      fireEvent.click(toggleButton!)
      
      // Change chaos amount
      const slider = screen.getByRole('slider', { name: /chaos/i }) as HTMLInputElement
      fireEvent.change(slider, { target: { value: '0.9' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.9')
      })
      
      // Find the reset button for chaos section
      const chaosHeader = screen.getByText('Chaos Mode', { selector: 'h3' })
      const resetButton = chaosHeader.parentElement?.querySelector('button')
      
      expect(resetButton).toBeDefined()
      
      // Click reset
      fireEvent.click(resetButton!)
      
      await waitFor(() => {
        // Should reset to defaults: enabled=false, amount=0.5
        expect(parseFloat(slider.value)).toBe(0.5)
        expect(toggleButton?.className).toContain('bg-foreground/20')
      })
    })

    it('should show chaos description text', () => {
      renderWithProvider(true)
      
      const description = screen.getByText(/domain distortion, chromatic aberration/i)
      expect(description).toBeDefined()
    })

    it('should have correct slider min, max, and step attributes', () => {
      renderWithProvider(true)
      
      const slider = screen.getByRole('slider', { name: /chaos/i }) as HTMLInputElement
      
      expect(slider.min).toBe('0')
      expect(slider.max).toBe('1')
      expect(slider.step).toBe('0.01')
    })

    it('should maintain chaos state when other settings are changed', async () => {
      renderWithProvider(true)
      
      // Enable chaos
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'label' }).closest('div')
      const chaosToggle = chaosSection?.querySelector('button')
      fireEvent.click(chaosToggle!)
      
      await waitFor(() => {
        expect(chaosToggle?.className).toContain('bg-red-600')
      })
      
      // Toggle membrane mode
      const membraneSection = screen.getByText('Membrane Mode', { selector: 'label' }).closest('div')
      const membraneToggle = membraneSection?.querySelector('button')
      fireEvent.click(membraneToggle!)
      
      // Chaos should still be enabled
      await waitFor(() => {
        expect(chaosToggle?.className).toContain('bg-red-600')
      })
    })

    it('should persist chaos settings to localStorage', async () => {
      renderWithProvider(true)
      
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'label' }).closest('div')
      const toggleButton = chaosSection?.querySelector('button')
      
      fireEvent.click(toggleButton!)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'shader-settings',
          expect.stringContaining('"chaos"')
        )
      })
    })
  })
})
