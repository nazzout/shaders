"use client"

import { useEffect, useRef } from "react"

interface WarpedGradientBackgroundProps {
  colors: {
    swirlA: string
    swirlB: string
    chromaBase: string
  }
  depth: number          // 0-1, membrane displacement strength
  ripple: number         // 0-1, wave amplitude/frequency
  audioEnergy: number    // 0-1, modulates wave speed
  audioTransient: number // 0-1, creates pulse waves
  time: number           // animation time for coordination
}

export function WarpedGradientBackground({
  colors,
  depth,
  ripple,
  audioEnergy,
  audioTransient,
  time,
}: WarpedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
    if (!gl) return
    glRef.current = gl

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader with UV warping and lighting
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      
      uniform float u_time;
      uniform float u_depth;
      uniform float u_ripple;
      uniform float u_audioEnergy;
      uniform float u_audioTransient;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorChroma;
      
      // Noise function for organic motion
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }
      
      // === MEMBRANE HEIGHT FIELD ===
      // Computes heightfield H(uv) for ripple distortion
      float getHeight(vec2 uv, float time) {
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);
        
        // Primary circular waves
        float waveFreq = 6.0 + u_ripple * 14.0;
        float waveSpeed = 1.5 + u_audioEnergy * 3.5;
        float waveAmp = u_ripple * 0.25;
        float waves = sin(dist * waveFreq - time * waveSpeed) * waveAmp;
        
        // Secondary layer for complexity
        float waves2 = sin(dist * waveFreq * 0.7 - time * waveSpeed * 0.6) * waveAmp * 0.4;
        
        // Transient pulse from center
        float pulse = exp(-dist * 6.0) * u_audioTransient * 0.3;
        
        // Organic drift
        float organic = noise(uv * 2.5 + time * 0.4) * 0.12;
        
        return (waves + waves2 + pulse + organic) * u_depth;
      }
      
      // === NORMAL CALCULATION ===
      // Compute surface normal from height field using finite differences
      vec3 getNormal(vec2 uv, float time) {
        float eps = 0.004;
        float h = getHeight(uv, time);
        float hx = getHeight(uv + vec2(eps, 0.0), time);
        float hy = getHeight(uv + vec2(0.0, eps), time);
        
        float dx = (hx - h) / eps;
        float dy = (hy - h) / eps;
        
        return normalize(vec3(-dx * 2.5, -dy * 2.5, 1.0));
      }
      
      // === UV WARPING ===
      // Use height gradient to warp UVs (makes gradient bend with waves)
      vec2 warpUV(vec2 uv, float time) {
        float eps = 0.006;
        float h = getHeight(uv, time);
        float hx = getHeight(uv + vec2(eps, 0.0), time);
        float hy = getHeight(uv + vec2(0.0, eps), time);
        
        // Gradient of height field
        vec2 gradient = vec2((hx - h) / eps, (hy - h) / eps);
        
        // Warp strength scales with depth
        float warpStrength = u_depth * 0.15;
        
        // Displace UV perpendicular to gradient (creates flow along waves)
        vec2 uvWarped = uv + vec2(-gradient.y, gradient.x) * warpStrength;
        
        return uvWarped;
      }
      
      // Gradient color sampling (radial + noise-based)
      vec3 sampleGradient(vec2 uv) {
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);
        
        // Radial gradient base
        float radial = smoothstep(0.0, 1.4, dist);
        
        // Add noise texture for variation
        float noiseVal = noise(uv * 3.0 + u_time * 0.1);
        radial = mix(radial, radial * noiseVal, 0.3);
        
        // Mix between colors
        vec3 baseGradient = mix(u_colorA, u_colorB, radial);
        
        // Add chroma influence
        float chromaInfluence = noise(uv * 4.0 - u_time * 0.2) * 0.4;
        baseGradient = mix(baseGradient, u_colorChroma, chromaInfluence * 0.3);
        
        return baseGradient;
      }
      
      void main() {
        float time = u_time;
        
        // === 1. WARP UVs BASED ON MEMBRANE ===
        vec2 uvWarped = warpUV(v_uv, time);
        
        // === 2. SAMPLE GRADIENT WITH WARPED UVs ===
        vec3 gradientColor = sampleGradient(uvWarped);
        
        // === 3. COMPUTE LIGHTING FROM MEMBRANE NORMAL ===
        vec3 normal = getNormal(v_uv, time);
        
        // Light direction (from top-right-front)
        vec3 lightDir = normalize(vec3(0.6, 0.4, 1.0));
        
        // Diffuse lighting
        float diffuse = max(dot(normal, lightDir), 0.0);
        diffuse = mix(0.6, diffuse, u_depth * 0.8); // Subtle when depth is low
        
        // Specular (Blinn-Phong)
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfDir), 0.0), 24.0);
        specular *= u_depth * 0.4; // Scale with depth
        
        // Rim light (Fresnel-like)
        float rim = pow(1.0 - abs(dot(normal, viewDir)), 2.5);
        rim *= u_depth * 0.25;
        
        // === 4. APPLY LIGHTING TO GRADIENT ===
        vec3 litColor = gradientColor * (0.4 + diffuse * 0.6);
        litColor += vec3(1.0) * specular; // Specular highlights
        litColor += gradientColor * rim; // Rim glow
        
        // Add depth-based darkening for contrast
        float height = getHeight(v_uv, time);
        float depthDarken = 1.0 - abs(height) * u_depth * 0.4;
        litColor *= depthDarken;
        
        gl_FragColor = vec4(litColor, 1.0);
      }
    `

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("Fragment shader error:", gl.getShaderInfoLog(fragmentShader))
    }

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)
    programRef.current = program

    // Setup fullscreen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    uniformsRef.current = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_depth: gl.getUniformLocation(program, "u_depth"),
      u_ripple: gl.getUniformLocation(program, "u_ripple"),
      u_audioEnergy: gl.getUniformLocation(program, "u_audioEnergy"),
      u_audioTransient: gl.getUniformLocation(program, "u_audioTransient"),
      u_colorA: gl.getUniformLocation(program, "u_colorA"),
      u_colorB: gl.getUniformLocation(program, "u_colorB"),
      u_colorChroma: gl.getUniformLocation(program, "u_colorChroma"),
    }

    // Handle resize
    const handleResize = () => {
      if (canvas && gl) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (gl && program) {
        gl.deleteProgram(program)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program) return

    // Helper to parse hex color to vec3
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      return [r, g, b]
    }

    const colorA = hexToRgb(colors.swirlA)
    const colorB = hexToRgb(colors.swirlB)
    const colorChroma = hexToRgb(colors.chromaBase)

    const animate = () => {
      if (!gl) return

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uniformsRef.current.u_time, time)
      gl.uniform1f(uniformsRef.current.u_depth, depth)
      gl.uniform1f(uniformsRef.current.u_ripple, ripple)
      gl.uniform1f(uniformsRef.current.u_audioEnergy, audioEnergy)
      gl.uniform1f(uniformsRef.current.u_audioTransient, audioTransient)
      gl.uniform3f(uniformsRef.current.u_colorA, ...colorA)
      gl.uniform3f(uniformsRef.current.u_colorB, ...colorB)
      gl.uniform3f(uniformsRef.current.u_colorChroma, ...colorChroma)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [colors, depth, ripple, audioEnergy, audioTransient, time])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
