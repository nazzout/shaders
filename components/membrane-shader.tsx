"use client"

import { useEffect, useRef } from "react"

interface MembraneShaderProps {
  depth: number        // 0-1, displacement intensity
  ripple: number       // 0-1, wave strength
  audioEnergy: number  // 0-1, from audio analysis
  audioTransient: number // 0-1, beat detection
}

export function MembraneShader({ depth, ripple, audioEnergy, audioTransient }: MembraneShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize WebGL
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
    if (!gl) {
      console.error("WebGL not supported")
      return
    }
    glRef.current = gl

    // Vertex shader - simple fullscreen quad
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader - membrane with heightmap and lighting
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      
      uniform float u_time;
      uniform float u_depth;
      uniform float u_ripple;
      uniform float u_audioEnergy;
      uniform float u_audioTransient;
      uniform vec2 u_resolution;
      
      // Simple noise function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Compute membrane height at position
      float getHeight(vec2 uv, float time) {
        // Center of membrane
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);
        
        // Base circular waves (ripple effect)
        float waveFreq = 8.0 + u_ripple * 12.0;
        float waveSpeed = 2.0 + u_audioEnergy * 3.0;
        float waveAmp = u_ripple * 0.3;
        
        float waves = sin(dist * waveFreq - time * waveSpeed) * waveAmp;
        
        // Add transient pulses
        float pulse = exp(-dist * 5.0) * u_audioTransient * 0.4;
        
        // Organic motion with noise
        float noiseScale = 3.0;
        float noiseSpeed = 0.5;
        float organicMotion = noise(uv * noiseScale + time * noiseSpeed) * 0.15;
        
        // Secondary ripple layer
        float waves2 = sin(dist * waveFreq * 0.6 + time * waveSpeed * 0.8) * waveAmp * 0.5;
        
        // Combine all height contributions
        float height = (waves + waves2 + pulse + organicMotion) * u_depth;
        
        return height;
      }
      
      // Compute normal from height field using finite differences
      vec3 getNormal(vec2 uv, float time) {
        float eps = 0.005; // sampling distance for derivatives
        
        float h = getHeight(uv, time);
        float hx = getHeight(uv + vec2(eps, 0.0), time);
        float hy = getHeight(uv + vec2(0.0, eps), time);
        
        // Compute gradients
        float dx = (hx - h) / eps;
        float dy = (hy - h) / eps;
        
        // Normal vector (larger z = flatter surface)
        vec3 normal = normalize(vec3(-dx * 2.0, -dy * 2.0, 1.0));
        
        return normal;
      }
      
      void main() {
        vec2 uv = v_uv;
        float time = u_time;
        
        // Get height and normal
        float height = getHeight(uv, time);
        vec3 normal = getNormal(uv, time);
        
        // Lighting setup
        vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0)); // light from top-right
        vec3 viewDir = vec3(0.0, 0.0, 1.0); // orthographic view
        
        // Diffuse lighting
        float diffuse = max(dot(normal, lightDir), 0.0);
        diffuse = mix(0.5, diffuse, u_depth); // less lighting when depth is low
        
        // Specular lighting (Blinn-Phong)
        vec3 halfDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * u_depth;
        
        // Ambient occlusion based on height
        float ao = 1.0 - abs(height) * 0.3;
        
        // Rim lighting for portal effect
        float rim = pow(1.0 - abs(dot(normal, viewDir)), 3.0) * u_depth * 0.4;
        
        // Combine lighting
        vec3 lighting = vec3(diffuse * ao + specular * 1.5 + rim);
        
        // Portal color tint (subtle blue-purple glow)
        vec3 portalColor = vec3(0.4, 0.5, 1.0);
        lighting = mix(vec3(1.0), lighting * portalColor, u_depth * 0.3);
        
        // Add depth-based darkening for contrast
        float depthDarken = 1.0 - height * u_depth * 0.5;
        lighting *= depthDarken;
        
        // Output with alpha for blending
        float alpha = u_depth * 0.4 + 0.1; // subtle overlay
        gl_FragColor = vec4(lighting, alpha);
      }
    `

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

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
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
    }

    // Setup blending for overlay effect
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Handle resize
    const handleResize = () => {
      if (canvas && gl) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform2f(uniformsRef.current.u_resolution, canvas.width, canvas.height)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      if (!gl || !programRef.current) return

      const time = (Date.now() - startTimeRef.current) / 1000

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uniformsRef.current.u_time, time)
      gl.uniform1f(uniformsRef.current.u_depth, depth)
      gl.uniform1f(uniformsRef.current.u_ripple, ripple)
      gl.uniform1f(uniformsRef.current.u_audioEnergy, audioEnergy)
      gl.uniform1f(uniformsRef.current.u_audioTransient, audioTransient)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (gl && program) {
        gl.deleteProgram(program)
      }
    }
  }, [depth, ripple, audioEnergy, audioTransient])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
