import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { NodalParticlesGradient } from '@/components/nodal-particles-gradient'

describe('NodalParticlesGradient', () => {
  const mockColors = {
    swirlA: '#1275d8',
    swirlB: '#e19136',
    chromaBase: '#0066ff',
  }

  const defaultProps = {
    colors: mockColors,
    density: 0.5,
    size: 0.4,
    drift: 0.6,
    influence: 0.5,
    audioEnergy: 0.3,
    audioTransient: 0.2,
    audioBass: 0.4,
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
      render(<NodalParticlesGradient {...defaultProps} chaosEnabled={false} chaosAmount={0.5} />)

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
      render(<NodalParticlesGradient {...defaultProps} chaosEnabled={true} chaosAmount={0.75} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const chaosEnabledCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosEnabled')
      const chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')

      expect(chaosEnabledCall).toBeDefined()
      expect(chaosEnabledCall?.[1]).toBe(1.0) // true = 1.0

      expect(chaosAmountCall).toBeDefined()
      expect(chaosAmountCall?.[1]).toBe(0.75)
    })

    it('should update chaos uniforms when props change', async () => {
      const { rerender } = render(
        <NodalParticlesGradient {...defaultProps} chaosEnabled={false} chaosAmount={0.3} />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      // Clear previous calls
      mockGl.uniform1f.mockClear()

      // Update with chaos enabled
      rerender(<NodalParticlesGradient {...defaultProps} chaosEnabled={true} chaosAmount={0.9} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      const uniform1fCalls = mockGl.uniform1f.mock.calls
      const chaosEnabledCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosEnabled')
      const chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')

      expect(chaosEnabledCall?.[1]).toBe(1.0)
      expect(chaosAmountCall?.[1]).toBe(0.9)
    })

    it('should correctly handle chaos amount edge cases (0 and 1)', async () => {
      const { rerender } = render(
        <NodalParticlesGradient {...defaultProps} chaosEnabled={true} chaosAmount={0} />
      )

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      let uniform1fCalls = mockGl.uniform1f.mock.calls
      let chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')
      expect(chaosAmountCall?.[1]).toBe(0)

      mockGl.uniform1f.mockClear()

      rerender(<NodalParticlesGradient {...defaultProps} chaosEnabled={true} chaosAmount={1} />)

      await waitFor(() => {
        expect(mockGl.uniform1f).toHaveBeenCalled()
      })

      uniform1fCalls = mockGl.uniform1f.mock.calls
      chaosAmountCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_chaosAmount')
      expect(chaosAmountCall?.[1]).toBe(1)
    })
  })

  describe('cursor uniforms', () => {
    it('should pass cursor position and strength uniforms to WebGL', async () => {
      render(
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.75}
          cursorY={0.25}
          cursorStrength={0.6}
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
      expect(cursorPosCall?.[1]).toBe(0.75) // cursorX
      expect(cursorPosCall?.[2]).toBe(0.25) // cursorY

      // Check cursor strength uniform
      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      expect(cursorStrengthCall).toBeDefined()
      expect(cursorStrengthCall?.[1]).toBe(0.6)

      // Check isInteractingWithUI uniform
      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      expect(isInteractingCall).toBeDefined()
      expect(isInteractingCall?.[1]).toBe(0.0) // false = 0.0
    })

    it('should apply cursor domain warp when isInteractingWithUI is false', async () => {
      render(
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.5}
          cursorY={0.5}
          cursorStrength={0.8}
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

    it('should disable cursor domain warp when isInteractingWithUI is true', async () => {
      render(
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.5}
          cursorY={0.5}
          cursorStrength={0.8}
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

    it('should apply particle force based on cursor position and strength', async () => {
      render(
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.3}
          cursorY={0.7}
          cursorStrength={1.0}
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

      expect(cursorPosCall?.[1]).toBe(0.3)
      expect(cursorPosCall?.[2]).toBe(0.7)
      expect(cursorStrengthCall?.[1]).toBe(1.0)
    })

    it('should use default cursor values when not provided', async () => {
      render(<NodalParticlesGradient {...defaultProps} />)

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
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.2}
          cursorY={0.3}
          cursorStrength={0.4}
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
        <NodalParticlesGradient
          {...defaultProps}
          cursorX={0.8}
          cursorY={0.9}
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
      expect(cursorPosCall?.[1]).toBe(0.8)
      expect(cursorPosCall?.[2]).toBe(0.9)

      const cursorStrengthCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_cursorStrength')
      expect(cursorStrengthCall?.[1]).toBe(1.0)

      const isInteractingCall = uniform1fCalls.find((call: any) => call[0]?.name === 'u_isInteractingWithUI')
      expect(isInteractingCall?.[1]).toBe(1.0)
    })

    it('should handle cursor strength of 0 (disabled cursor)', async () => {
      render(
        <NodalParticlesGradient
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
  })
})
