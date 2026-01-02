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
})
