import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock requestAnimationFrame
let rafId = 0
global.requestAnimationFrame = vi.fn((cb) => {
  // Don't call the callback immediately to prevent infinite recursion in tests
  // Instead, return a unique ID that can be cancelled
  return ++rafId
})

global.cancelAnimationFrame = vi.fn()

// Mock document.elementFromPoint for touch event testing
if (typeof document !== 'undefined') {
  document.elementFromPoint = vi.fn((x: number, y: number) => {
    // Return a mock element
    return document.body
  })
}

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return {
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
      getUniformLocation: vi.fn(() => ({})),
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
  }
  return null
}) as any
