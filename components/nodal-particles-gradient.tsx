"use client"

import { useEffect, useRef } from "react"

interface NodalParticlesGradientProps {
  colors: {
    swirlA: string
    swirlB: string
    chromaBase: string
  }
  // Nodal particle settings
  density: number     // 0-1, particle count
  size: number        // 0-1, particle radius
  drift: number       // 0-1, flow along field
  influence: number   // 0-1, gradient manipulation strength
  // Audio
  audioEnergy: number
  audioTransient: number
  audioBass: number
  time: number
  // Chaos
  chaosEnabled: boolean
  chaosAmount: number // 0-1
  // Turbulence
  turbulenceEnabled: boolean
  turbulenceStrength: number // 0-1
  turbulenceScale: number    // 0.25-5
  turbulenceSpeed: number    // 0-3
  turbulenceOctaves: number  // 1-4
  // Cursor
  cursorX?: number           // 0-1, normalized cursor X
  cursorY?: number           // 0-1, normalized cursor Y
  cursorStrength?: number    // 0-1, cursor influence intensity
  isInteractingWithUI?: boolean // disable cursor when over UI
}

export function NodalParticlesGradient({
  colors,
  density,
  size,
  drift,
  influence,
  audioEnergy,
  audioTransient,
  audioBass,
  time,
  chaosEnabled,
  chaosAmount,
  turbulenceEnabled,
  turbulenceStrength,
  turbulenceScale,
  turbulenceSpeed,
  turbulenceOctaves,
  cursorX = 0.5,
  cursorY = 0.5,
  cursorStrength = 0,
  isInteractingWithUI = false,
}: NodalParticlesGradientProps) {
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

    // Fragment shader with Chladni nodal field + particles + gradient integration
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      
      uniform float u_time;
      uniform float u_density;
      uniform float u_size;
      uniform float u_drift;
      uniform float u_influence;
      uniform float u_audioEnergy;
      uniform float u_audioTransient;
      uniform float u_audioBass;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorChroma;
      uniform float u_chaosEnabled;
      uniform float u_chaosAmount;
      uniform float u_turbulenceEnabled;
      uniform float u_turbulenceStrength;
      uniform float u_turbulenceScale;
      uniform float u_turbulenceSpeed;
      uniform float u_turbulenceOctaves;
      uniform vec2 u_cursorPos;
      uniform float u_cursorStrength;
      uniform float u_isInteractingWithUI;
      
      const float PI = 3.14159265359;
      
      // === CHLADNI / CYMATICS NODAL FIELD ===
      // Returns nodal field value (closer to 0 = on nodal line)
      float chladniField(vec2 uv, float time) {
        vec2 workingUV = uv;
        
        // === CURSOR DOMAIN WARP ===
        if (u_isInteractingWithUI < 0.5 && u_cursorStrength > 0.0) {
          // Distance from cursor
          float cursorDist = length(uv - u_cursorPos);
          
          // Exponential falloff
          float falloff = exp(-cursorDist * cursorDist * 12.0);
          
          // Pull vector toward cursor (creates distortion/swirl)
          vec2 pullVec = normalize(u_cursorPos - uv);
          
          // Add slight rotation for swirl effect
          float angle = falloff * u_cursorStrength * 0.8;
          mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pullVec = rotation * pullVec;
          
          // Apply domain warp to UV
          workingUV = uv + pullVec * falloff * u_cursorStrength * 0.15;
        }
        
        // Shift to centered coordinates
        vec2 p = (workingUV - 0.5) * 2.0;
        
        // Chladni mode numbers (n, m) - vary with time for animation
        float n = 3.0 + sin(time * 0.2) * 1.0;
        float m = 4.0 + cos(time * 0.15) * 1.0;
        
        // Chladni equation: sin(n*pi*x)*sin(m*pi*y) + sin(m*pi*x)*sin(n*pi*y)
        float chladni1 = sin(PI * n * p.x) * sin(PI * m * p.y);
        float chladni2 = sin(PI * m * p.x) * sin(PI * n * p.y);
        float chladni = chladni1 + chladni2;
        
        // Add audio modulation\n        chladni += u_audioBass * 0.3 * sin(time * 2.0);
        
        return chladni;
      }
      
      // Convert field to nodal mask (1 = on line, 0 = off line)
      float getNodalMask(vec2 uv, float time) {
        float field = chladniField(uv, time);
        float lineWidth = 0.08 + u_audioTransient * 0.05;
        return 1.0 - smoothstep(0.0, lineWidth, abs(field));
      }
      
      // === NOISE FOR PARTICLE DISTRIBUTION ===
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
      
      // === FIELD GRADIENT FOR PARTICLE DRIFT ===
      vec2 fieldGradient(vec2 uv, float time) {
        float eps = 0.01;
        float fx = chladniField(uv + vec2(eps, 0.0), time);
        float fy = chladniField(uv + vec2(0.0, eps), time);
        float f = chladniField(uv, time);
        return vec2((fx - f) / eps, (fy - f) / eps);
      }
      
      // === GPU PARTICLE SAMPLING ===
      // Simple fragment-based approach: each grid cell spawns a particle
      float renderParticles(vec2 uv, float time) {
        // Particle grid density
        float gridSize = 40.0 * (0.5 + u_density * 1.5);
        vec2 grid = floor(uv * gridSize);
        vec2 cellUV = fract(uv * gridSize);
        
        // Particle seed from grid position
        float seed = hash(grid + vec2(0.0, time * 0.1));
        
        // Only spawn particle if density threshold met
        if (seed > u_density) return 0.0;
        
        // Get nodal mask at grid center
        vec2 gridCenter = (grid + 0.5) / gridSize;
        float nodalMask = getNodalMask(gridCenter, time);
        
        // Particles concentrate on nodal lines
        if (nodalMask < 0.3) return 0.0;
        
        // Particle drift along field gradient
        vec2 gradient = fieldGradient(gridCenter, time);
        vec2 flow = normalize(vec2(-gradient.y, gradient.x)) * u_drift; // Perpendicular to gradient
        float flowPhase = hash(grid) * PI * 2.0;
        vec2 offset = flow * sin(time * 0.5 + flowPhase) * 0.3;
        
        // === CURSOR FORCE ON PARTICLES ===
        if (u_isInteractingWithUI < 0.5 && u_cursorStrength > 0.0) {
          float cursorDist = length(gridCenter - u_cursorPos);
          float cursorFalloff = exp(-cursorDist * cursorDist * 10.0);
          
          // Particles drift toward/orbit around cursor
          vec2 toCursor = normalize(u_cursorPos - gridCenter);
          vec2 cursorForce = toCursor * cursorFalloff * u_cursorStrength * 0.4;
          offset += cursorForce;
        }
        
        // Particle position with drift
        vec2 particlePos = vec2(0.5) + offset;
        float dist = length(cellUV - particlePos);
        
        // Particle radius
        float radius = 0.02 + u_size * 0.08;
        radius *= (0.7 + nodalMask * 0.3); // Size varies with field
        
        // Soft particle
        float particle = 1.0 - smoothstep(radius * 0.5, radius, dist);
        particle *= nodalMask; // Fade with field strength
        
        // Audio boost
        particle *= 1.0 + u_audioTransient * 2.0;
        
        return particle;
      }
      
      // === GRADIENT WITH NODAL INFLUENCE ===
      vec3 sampleGradient(vec2 uv, float time) {
        // Apply chaos domain distortion
        vec2 workingUV = uv;
        if (u_chaosEnabled > 0.5) {
          float chaosScale = u_chaosAmount * 4.0;
          float n1 = noise(uv * chaosScale + time * 0.3);
          float n2 = noise(uv * chaosScale * 1.3 - time * 0.2);
          vec2 warp = vec2(n1 - 0.5, n2 - 0.5) * u_chaosAmount * 0.2;
          workingUV = uv + warp;
        }
        
        // Base radial gradient
        vec2 center = vec2(0.5, 0.5);
        float dist = length(workingUV - center);
        float radial = smoothstep(0.0, 1.4, dist);
        
        // Add noise variation
        float noiseVal = noise(uv * 3.0 + time * 0.1);
        radial = mix(radial, radial * noiseVal, 0.3);
        
        // Mix colors
        vec3 baseGradient = mix(u_colorA, u_colorB, radial);
        
        // Chroma influence
        float chromaInfluence = noise(uv * 4.0 - time * 0.2) * 0.4;
        baseGradient = mix(baseGradient, u_colorChroma, chromaInfluence * 0.3);
        
        // === NODAL FIELD MANIPULATION ===
        float nodalMask = getNodalMask(uv, time);
        
        // Domain warp along nodal lines
        vec2 gradient = fieldGradient(uv, time);
        vec2 warp = vec2(-gradient.y, gradient.x) * nodalMask * u_influence * 0.1;
        vec2 warpedUV = uv + warp;
        
        // Re-sample gradient with warped UV
        dist = length(warpedUV - center);
        radial = smoothstep(0.0, 1.4, dist);
        baseGradient = mix(u_colorA, u_colorB, radial);
        
        // Glow/contrast boost on nodal lines
        float glow = nodalMask * u_influence * 0.4;
        baseGradient += baseGradient * glow;
        
        // Saturation boost
        float saturation = 1.0 + nodalMask * u_influence * 0.5;
        vec3 gray = vec3(dot(baseGradient, vec3(0.299, 0.587, 0.114)));
        baseGradient = mix(gray, baseGradient, saturation);
        
        return baseGradient;
      }
      
      // Multi-octave turbulence function
      vec2 turbulence(vec2 uv, float time) {
        vec2 displacement = vec2(0.0);
        float amplitude = 1.0;
        float frequency = 1.0;
        
        for (float i = 0.0; i < 4.0; i++) {
          if (i >= u_turbulenceOctaves) break;
          
          vec2 p = uv * u_turbulenceScale * frequency + time * u_turbulenceSpeed * 0.1;
          float n1 = noise(p);
          float n2 = noise(p + vec2(5.2, 1.3));
          
          displacement += vec2(n1 - 0.5, n2 - 0.5) * amplitude;
          
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return displacement * u_turbulenceStrength;
      }
      
      void main() {
        vec2 uv = v_uv;
        float t = u_time;
        
        // Apply turbulence as initial UV distortion (domain warping)
        if (u_turbulenceEnabled > 0.5) {
          vec2 turbDisplacement = turbulence(uv, t);
          uv = uv + turbDisplacement;
        }
        
        // Apply chaos temporal desync
        float chaosTime = t;
        if (u_chaosEnabled > 0.5) {
          chaosTime = t + u_chaosAmount * 2.0; // Offset by up to 2 seconds
        }
        
        // Apply chaos audio overdrive
        float chaosAudioBoost = 1.0;
        if (u_chaosEnabled > 0.5) {
          chaosAudioBoost = 1.0 + pow(u_audioEnergy, 1.0 + u_chaosAmount * 2.0) * u_chaosAmount * 3.0;
        }
        
        // Sample gradient with nodal field influence
        vec3 gradientColor = sampleGradient(uv, chaosTime) * chaosAudioBoost;
        
        // Render particles on top
        float particles = renderParticles(uv, chaosTime);
        
        // Composite particles with gradient
        vec3 particleColor = mix(u_colorChroma, vec3(1.0), 0.5);
        vec3 finalColor = mix(gradientColor, particleColor, particles * 0.7);
        
        // Add subtle glow around particles
        float particleGlow = particles * 0.3;
        finalColor += gradientColor * particleGlow;
        
        // Apply chaos chromatic aberration
        if (u_chaosEnabled > 0.5) {
          float aberration = u_chaosAmount * 0.01;
          vec3 rColor = sampleGradient(uv + vec2(aberration, 0.0), chaosTime);
          vec3 gColor = finalColor;
          vec3 bColor = sampleGradient(uv - vec2(aberration, 0.0), chaosTime);
          finalColor = vec3(rColor.r, gColor.g, bColor.b);
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
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
      u_density: gl.getUniformLocation(program, "u_density"),
      u_size: gl.getUniformLocation(program, "u_size"),
      u_drift: gl.getUniformLocation(program, "u_drift"),
      u_influence: gl.getUniformLocation(program, "u_influence"),
      u_audioEnergy: gl.getUniformLocation(program, "u_audioEnergy"),
      u_audioTransient: gl.getUniformLocation(program, "u_audioTransient"),
      u_audioBass: gl.getUniformLocation(program, "u_audioBass"),
      u_colorA: gl.getUniformLocation(program, "u_colorA"),
      u_colorB: gl.getUniformLocation(program, "u_colorB"),
      u_colorChroma: gl.getUniformLocation(program, "u_colorChroma"),
      u_chaosEnabled: gl.getUniformLocation(program, "u_chaosEnabled"),
      u_chaosAmount: gl.getUniformLocation(program, "u_chaosAmount"),
      u_turbulenceEnabled: gl.getUniformLocation(program, "u_turbulenceEnabled"),
      u_turbulenceStrength: gl.getUniformLocation(program, "u_turbulenceStrength"),
      u_turbulenceScale: gl.getUniformLocation(program, "u_turbulenceScale"),
      u_turbulenceSpeed: gl.getUniformLocation(program, "u_turbulenceSpeed"),
      u_turbulenceOctaves: gl.getUniformLocation(program, "u_turbulenceOctaves"),
      u_cursorPos: gl.getUniformLocation(program, "u_cursorPos"),
      u_cursorStrength: gl.getUniformLocation(program, "u_cursorStrength"),
      u_isInteractingWithUI: gl.getUniformLocation(program, "u_isInteractingWithUI"),
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
      gl.uniform1f(uniformsRef.current.u_density, density)
      gl.uniform1f(uniformsRef.current.u_size, size)
      gl.uniform1f(uniformsRef.current.u_drift, drift)
      gl.uniform1f(uniformsRef.current.u_influence, influence)
      gl.uniform1f(uniformsRef.current.u_audioEnergy, audioEnergy)
      gl.uniform1f(uniformsRef.current.u_audioTransient, audioTransient)
      gl.uniform1f(uniformsRef.current.u_audioBass, audioBass)
      gl.uniform3f(uniformsRef.current.u_colorA, ...colorA)
      gl.uniform3f(uniformsRef.current.u_colorB, ...colorB)
      gl.uniform3f(uniformsRef.current.u_colorChroma, ...colorChroma)
      gl.uniform1f(uniformsRef.current.u_chaosEnabled, chaosEnabled ? 1.0 : 0.0)
      gl.uniform1f(uniformsRef.current.u_chaosAmount, chaosAmount)
      gl.uniform1f(uniformsRef.current.u_turbulenceEnabled, turbulenceEnabled ? 1.0 : 0.0)
      gl.uniform1f(uniformsRef.current.u_turbulenceStrength, turbulenceStrength)
      gl.uniform1f(uniformsRef.current.u_turbulenceScale, turbulenceScale)
      gl.uniform1f(uniformsRef.current.u_turbulenceSpeed, turbulenceSpeed)
      gl.uniform1f(uniformsRef.current.u_turbulenceOctaves, turbulenceOctaves)
      gl.uniform2f(uniformsRef.current.u_cursorPos, cursorX, cursorY)
      gl.uniform1f(uniformsRef.current.u_cursorStrength, cursorStrength)
      gl.uniform1f(uniformsRef.current.u_isInteractingWithUI, isInteractingWithUI ? 1.0 : 0.0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [colors, density, size, drift, influence, audioEnergy, audioTransient, audioBass, time, chaosEnabled, chaosAmount, turbulenceEnabled, turbulenceStrength, turbulenceScale, turbulenceSpeed, turbulenceOctaves, cursorX, cursorY, cursorStrength, isInteractingWithUI])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
