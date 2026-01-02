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
      
      const chaosLabel = screen.getByText('Chaos Mode')
      expect(chaosLabel).toBeDefined()
    })

    it('should not render when panel is closed', () => {
      renderWithProvider(false)
      
      const chaosLabel = screen.queryByText('Chaos Mode')
      expect(chaosLabel).toBeNull()
    })

    it('should show chaos toggle in off state by default', () => {
      const { container } = renderWithProvider(true)
      
      const toggleButton = container.querySelector('button[class*="bg-foreground/20"]')
      expect(toggleButton).toBeDefined()
    })

    it('should call updateChaos to enable chaos when toggle is clicked', async () => {
      const { container } = renderWithProvider(true)
      
      // Find the chaos mode toggle button - look for the heading then find the toggle in the parent
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      
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
      
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      
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
      
      // First enable chaos to make the slider visible (it's in a collapsible panel)
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      const chaosSliderLabel = screen.getByText('Chaos')
      expect(chaosSliderLabel).toBeDefined()
      
      const slider = screen.getByLabelText('Chaos') as HTMLInputElement
      expect(slider).toBeDefined()
    })

    it('should update chaos amount when slider is changed', async () => {
      renderWithProvider(true)
      
      // Enable chaos first to show the slider
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      const slider = screen.getByLabelText('Chaos') as HTMLInputElement
      
      // Change slider value
      fireEvent.change(slider, { target: { value: '0.75' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.75')
      })
    })

    it('should display current chaos amount value', () => {
      renderWithProvider(true)
      
      // Enable chaos first
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      // Find the chaos slider to locate its value display
      const slider = screen.getByLabelText('Chaos') as HTMLInputElement
      
      // Default chaos amount is 0.5
      expect(slider.value).toBe('0.5')
    })

    it('should reset chaos settings when reset button is clicked', async () => {
      renderWithProvider(true)
      
      // Find and enable chaos first
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      // Change chaos amount
      const slider = screen.getByLabelText('Chaos') as HTMLInputElement
      fireEvent.change(slider, { target: { value: '0.9' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.9')
      })
      
      // Find the reset button for chaos section (it's the last button in the chaos header)
      const resetButtons = chaosSection?.querySelectorAll('button')
      const resetButton = resetButtons?.[resetButtons.length - 1]
      
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
      
      // Enable chaos first to show the description (it's in the collapsible panel)
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      // Check for partial text that's definitely in the description
      const description = screen.getByText(/domain distortion/i)
      expect(description).toBeDefined()
    })

    it('should have correct slider min, max, and step attributes', () => {
      renderWithProvider(true)
      
      // Enable chaos first to show the slider
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(toggleButton!)
      
      const slider = screen.getByLabelText('Chaos') as HTMLInputElement
      
      expect(slider.min).toBe('0')
      expect(slider.max).toBe('1')
      expect(slider.step).toBe('0.01')
    })

    it('should maintain chaos state when other settings are changed', async () => {
      renderWithProvider(true)
      
      // Enable chaos
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const chaosToggle = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      fireEvent.click(chaosToggle!)
      
      await waitFor(() => {
        expect(chaosToggle?.className).toContain('bg-red-600')
      })
      
      // Toggle membrane mode
      const membraneHeading = screen.getByText('3D Membrane Effect')
      const membraneSection = membraneHeading.parentElement
      const membraneToggle = membraneSection?.querySelector('button[title="Toggle Membrane Mode"]')
      fireEvent.click(membraneToggle!)
      
      // Chaos should still be enabled
      await waitFor(() => {
        expect(chaosToggle?.className).toContain('bg-red-600')
      })
    })

    it('should persist chaos settings to localStorage', async () => {
      renderWithProvider(true)
      
      const chaosHeading = screen.getByText('Chaos Mode')
      const chaosSection = chaosHeading.parentElement
      const toggleButton = chaosSection?.querySelector('button.bg-foreground\\/20, button.bg-red-600')
      
      fireEvent.click(toggleButton!)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'shader-settings',
          expect.stringContaining('"chaos"')
        )
      })
    })
  })

  describe('Cursor Strength Slider', () => {
    it('should render cursor strength slider', () => {
      renderWithProvider(true)
      
      const cursorSliderLabel = screen.getByText('Cursor Strength')
      expect(cursorSliderLabel).toBeDefined()
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      expect(slider).toBeDefined()
      expect(slider.type).toBe('range')
    })

    it('should display default cursor strength value (0.35)', () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      expect(slider.value).toBe('0.35')
    })

    it('should have correct slider attributes', () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      expect(slider.min).toBe('0')
      expect(slider.max).toBe('1')
      expect(slider.step).toBe('0.01')
    })

    it('should update cursor strength when slider is changed', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Change slider value
      fireEvent.change(slider, { target: { value: '0.65' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.65')
      })
    })

    it('should display current cursor strength value in real-time', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Find the value display (it's in a span with specific class)
      const valueDisplay = slider.parentElement?.querySelector('.font-mono')
      expect(valueDisplay?.textContent).toBe('0.35')
      
      // Change slider value
      fireEvent.change(slider, { target: { value: '0.78' } })
      
      await waitFor(() => {
        expect(valueDisplay?.textContent).toBe('0.78')
      })
    })

    it('should handle cursor strength of 0 (disabled)', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      fireEvent.change(slider, { target: { value: '0' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0')
      })
    })

    it('should handle cursor strength of 1 (maximum)', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      fireEvent.change(slider, { target: { value: '1' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('1')
      })
    })

    it('should update cursor strength via ShaderSettingsProvider context', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Change to a specific value
      fireEvent.change(slider, { target: { value: '0.42' } })
      
      await waitFor(() => {
        // The slider value should reflect the change
        expect(parseFloat(slider.value)).toBeCloseTo(0.42, 2)
      })
    })

    it('should persist cursor strength to localStorage', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      fireEvent.change(slider, { target: { value: '0.88' } })
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'shader-settings',
          expect.stringContaining('"cursor"')
        )
      })
    })

    it('should display description text', () => {
      renderWithProvider(true)
      
      const description = screen.getByText(/Controls how much the cursor distorts\/pulls the effects/i)
      expect(description).toBeDefined()
    })

    it('should be in the Controls section', () => {
      renderWithProvider(true)
      
      const controlsHeading = screen.getByText('Controls')
      expect(controlsHeading).toBeDefined()
      
      // Cursor strength slider should be in the same section
      const slider = screen.getByLabelText('Cursor Strength')
      expect(slider).toBeDefined()
    })

    it('should allow fine-grained adjustments (0.01 step)', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Test multiple small increments
      fireEvent.change(slider, { target: { value: '0.35' } })
      await waitFor(() => expect(slider.value).toBe('0.35'))
      
      fireEvent.change(slider, { target: { value: '0.36' } })
      await waitFor(() => expect(slider.value).toBe('0.36'))
      
      fireEvent.change(slider, { target: { value: '0.37' } })
      await waitFor(() => expect(slider.value).toBe('0.37'))
    })

    it('should maintain cursor strength when other settings are changed', async () => {
      renderWithProvider(true)
      
      const cursorSlider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Set cursor strength
      fireEvent.change(cursorSlider, { target: { value: '0.55' } })
      
      await waitFor(() => {
        expect(cursorSlider.value).toBe('0.55')
      })
      
      // Toggle chaos mode
      const chaosSection = screen.getByText('Chaos Mode', { selector: 'button' }).closest('div')
      const chaosToggle = chaosSection?.querySelector('button')
      fireEvent.click(chaosToggle!)
      
      // Cursor strength should remain unchanged
      await waitFor(() => {
        expect(cursorSlider.value).toBe('0.55')
      })
    })

    it('should work independently of active effect state', async () => {
      renderWithProvider(true)
      
      const cursorSlider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Enable membrane effect
      const membraneSection = screen.getByText('3D Membrane Effect').closest('div')
      const membraneToggle = membraneSection?.querySelector('button[title="Toggle Membrane Mode"]')
      fireEvent.click(membraneToggle!)
      
      // Update cursor strength
      fireEvent.change(cursorSlider, { target: { value: '0.91' } })
      
      await waitFor(() => {
        expect(cursorSlider.value).toBe('0.91')
      })
    })

    it('should reset cursor strength when reset to defaults is clicked', async () => {
      renderWithProvider(true)
      
      const slider = screen.getByLabelText('Cursor Strength') as HTMLInputElement
      
      // Change cursor strength
      fireEvent.change(slider, { target: { value: '0.99' } })
      
      await waitFor(() => {
        expect(slider.value).toBe('0.99')
      })
      
      // Click the global reset button (in the header, not the per-section reset buttons)
      const allResetButtons = screen.getAllByTitle('Reset to defaults')
      // The first one is in the panel header (global reset)
      const globalResetButton = allResetButtons[0]
      fireEvent.click(globalResetButton)
      
      await waitFor(() => {
        // Should reset to default value
        expect(slider.value).toBe('0.35')
      })
    })
  })
})
