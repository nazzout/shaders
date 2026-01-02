import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { WarpedGradientBackground } from '@/components/warped-gradient-background'

describe('WarpedGradientBackground', () => {
  const mockColors = {
    swirlA: '#1275d8',
    swirlB: '#e19136',
    chromaBase: '#0066ff',
  }

  const defaultProps = {
    colors: mockColors,
    depth: 0.3,
    ripple: 0.5,
    audioEnergy: 0.3,
    audioTransient: 0.2,
    time: 1.0,
    chaosEnabled: false,
    chaosAmount: 0.5,
    turbulenceEnabled: false,
    turbulenceStrength: 0.5,
    turbulenceScale: 2.0,
    turbulenceSpeed: 1.0,
    turbulenceOctaves: 2,
  }

  let mockGl: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockGl = {
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      getShaderInfoLog: vi.fn(() => ''),
      createProgram: vi.fn(() => ({})),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn((program, name) => ({ name })),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      drawArrays: vi.fn(),
      viewport: vi.fn(),
      deleteProgram: vi.fn(),
      VERTEX_SHADER: 0,
      FRAGMENT_SHADER: 1,
      COMPILE_STATUS: 2,
      ARRAY_BUFFER: 3,
      STATIC_DRAW: 4,
      FLOAT: 5,
      COLOR_BUFFER_BIT: 6,
      TRIANGLE_STRIP: 7,
    }

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockGl) as any
  })

  describe('chaos uniforms', () => {
    it('should pass chaosEnabled=false and chaosAmount to WebGL uniforms when chaos is disabled', async () => {
      render(<WarpedGradientBackground {...defaultProps} chaosEnabled={false} chaosAmount={0.5} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      // Find the calls for chaos uniforms
      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const chaosEnabledCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosEnabled')
      const chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')

      expect(chaosEnabledCall).toBeDefined()
      expect(chaosEnabledCall?.[1]).toBe(0.0) // false = 0.0

      expect(chaosAmountCall).toBeDefined()
      expect(chaosAmountCall?.[1]).toBe(0.5)
    })

    it('should pass chaosEnabled=true to WebGL uniforms when chaos is enabled', async () => {
      render(<WarpedGradientBackground {...defaultProps} chaosEnabled={true} chaosAmount={0.8} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const chaosEnabledCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosEnabled')
      const chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')

      expect(chaosEnabledCall).toBeDefined()
      expect(chaosEnabledCall?.[1]).toBe(1.0) // true = 1.0

      expect(chaosAmountCall).toBeDefined()
      expect(chaosAmountCall?.[1]).toBe(0.8)
    })

    it('should update chaos uniforms when props change', async () => {
      const { rerender } = render(
        <WarpedGradientBackground {...defaultProps} chaosEnabled={false} chaosAmount={0.2} />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      // Clear previous calls
      mockGl.uniform1f.mockClear()

      // Update with chaos enabled
      rerender(<WarpedGradientBackground {...defaultProps} chaosEnabled={true} chaosAmount={1.0} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const chaosEnabledCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosEnabled')
      const chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')

      expect(chaosEnabledCall?.[1]).toBe(1.0)
      expect(chaosAmountCall?.[1]).toBe(1.0)
    })

    it('should correctly handle chaos amount edge cases (0 and 1)', async () => {
      const { rerender } = render(
        <WarpedGradientBackground {...defaultProps} chaosEnabled={true} chaosAmount={0} />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      let uniform1fCalls = mockGl.uniform1f.mock.calls
      let chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')
      expect(chaosAmountCall?.[1]).toBe(0)

      mockGl.uniform1f.mockClear()

      rerender(<WarpedGradientBackground {...defaultProps} chaosEnabled={true} chaosAmount={1} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      uniform1fCalls = mockGl.uniform1f.mock.calls
      chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')
      expect(chaosAmountCall?.[1]).toBe(1)
    })

    it('should pass all required uniforms including chaos parameters', async () => {
      render(<WarpedGradientBackground {...defaultProps} chaosEnabled={true} chaosAmount={0.6} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const uniformNames = uniform1fCalls.map((call: any) => call[0]?.name)

      // Check that both chaos uniforms are present
      expect(uniformNames).toContain('u_chaosEnabled')
      expect(uniformNames).toContain('u_chaosAmount')
      
      // Also check other expected uniforms
      expect(uniformNames).toContain('u_time')
      expect(uniformNames).toContain('u_depth')
      expect(uniformNames).toContain('u_ripple')
      expect(uniformNames).toContain('u_audioEnergy')
      expect(uniformNames).toContain('u_audioTransient')
    })
  })

  describe('cursor uniforms', () => {
    it('should pass cursor position and strength uniforms to WebGL', async () => {
      render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.6}
          cursorY={0.4}
          cursorStrength={0.7}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
        expect(mockGl.uniform2f).toHaveBeenCalled()
      })

      const uniform2fCalls = mockGl.uniform2f.mock.calls
      const uniform1fCalls = mockGl.uniform1f.mock.calls

      // Check cursor position uniform (vec2)
      const cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      expect(cursorPosCall).toBeDefined()
      expect(cursorPosCall?.[1]).toBe(0.6) // cursorX
      expect(cursorPosCall?.[2]).toBe(0.4) // cursorY

      // Check cursor strength uniform
      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      expect(cursorStrengthCall).toBeDefined()
      expect(cursorStrengthCall?.[1]).toBe(0.7)

      // Check isInteractingWithUI uniform
      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      expect(isInteractingCall).toBeDefined()
      expect(isInteractingCall?.[1]).toBe(0.0) // false = 0.0
    })

    it('should apply cursor influence to height calculation when isInteractingWithUI is false', async () => {
      render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.5}
          cursorY={0.5}
          cursorStrength={0.9}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      
      // Should be 0.0 (false), allowing cursor effect
      expect(isInteractingCall?.[1]).toBe(0.0)
    })

    it('should disable cursor influence when isInteractingWithUI is true', async () => {
      render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.5}
          cursorY={0.5}
          cursorStrength={0.9}
          isInteractingWithUI={true}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      
      // Should be 1.0 (true), disabling cursor effect
      expect(isInteractingCall?.[1]).toBe(1.0)
    })

    it('should correctly update height field based on cursor position', async () => {
      render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.25}
          cursorY={0.75}
          cursorStrength={0.8}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform2fCalls = mockGl.uniform2f.mock.calls
      const uniform1fCalls = mockGl.uniform1f.mock.calls

      const cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')

      expect(cursorPosCall?.[1]).toBe(0.25)
      expect(cursorPosCall?.[2]).toBe(0.75)
      expect(cursorStrengthCall?.[1]).toBe(0.8)
    })

    it('should use default cursor values when not provided', async () => {
      render(<WarpedGradientBackground {...defaultProps} />)

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform2fCalls = mockGl.uniform2f.mock.calls
      const uniform1fCalls = mockGl.uniform1f.mock.calls

      // Default values from component props
      const cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      expect(cursorPosCall?.[1]).toBe(0.5) // default cursorX
      expect(cursorPosCall?.[2]).toBe(0.5) // default cursorY

      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      expect(cursorStrengthCall?.[1]).toBe(0) // default cursorStrength

      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      expect(isInteractingCall?.[1]).toBe(0.0) // default isInteractingWithUI
    })

    it('should update cursor uniforms when props change', async () => {
      const { rerender } = render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.1}
          cursorY={0.2}
          cursorStrength={0.3}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
      })

      // Clear previous calls
      mockGl.uniform2f.mockClear()
      mockGl.uniform1f.mockClear()

      // Update with new cursor values
      rerender(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.9}
          cursorY={0.8}
          cursorStrength={1.0}
          isInteractingWithUI={true}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform2fCalls = mockGl.uniform2f.mock.calls
      const uniform1fCalls = mockGl.uniform1f.mock.calls

      const cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      expect(cursorPosCall?.[1]).toBe(0.9)
      expect(cursorPosCall?.[2]).toBe(0.8)

      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      expect(cursorStrengthCall?.[1]).toBe(1.0)

      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      expect(isInteractingCall?.[1]).toBe(1.0)
    })

    it('should handle cursor strength of 0 (disabled cursor)', async () => {
      render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0.5}
          cursorY={0.5}
          cursorStrength={0}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      
      expect(cursorStrengthCall?.[1]).toBe(0)
    })

    it('should handle edge case cursor positions (corners)', async () => {
      const { rerender } = render(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={0}
          cursorY={0}
          cursorStrength={0.5}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
      })

      let uniform2fCalls = mockGl.uniform2f.mock.calls
      let cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      expect(cursorPosCall?.[1]).toBe(0)
      expect(cursorPosCall?.[2]).toBe(0)

      mockGl.uniform2f.mockClear()

      // Test opposite corner
      rerender(
        <WarpedGradientBackground
          {...defaultProps}
          cursorX={1}
          cursorY={1}
          cursorStrength={0.5}
          isInteractingWithUI={false}
        />
      )

      await waitFor(() => {
        expect(mockGl.uniform2f).toHaveBeenCalled()
      })

      uniform2fCalls = mockGl.uniform2f.mock.calls
      cursorPosCall = uniform2fCalls.find((call: any) => call[0]?.name === 'u_cursorPos')
      expect(cursorPosCall?.[1]).toBe(1)
      expect(cursorPosCall?.[2]).toBe(1)
    })
  })
})
