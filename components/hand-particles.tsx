"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type { HandData } from "@/hooks/use-hand-tracking"

interface AudioData {
  volume: number
  bass: number
  mid: number
  treble: number
  isActive: boolean
  transient: number
  fftEnergy: number
  spectralCentroid: number
}

interface HandParticlesProps {
  colors: {
    swirlA: string
    swirlB: string
    chromaBase: string
  }
  handData: HandData
  particleCount: number // 0-1, density setting
  particleSize: number // 0-1, size setting
  responseSpeed: number // 0-1, movement response rate
  time: number // Animation time
  audioData?: AudioData // Optional audio reactivity
}

export function HandParticles({
  colors,
  handData,
  particleCount,
  particleSize,
  responseSpeed,
  time,
  audioData,
}: HandParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const targetPositionsRef = useRef<Float32Array | null>(null)
  const velocitiesRef = useRef<Float32Array | null>(null)
  const colorsArrayRef = useRef<Float32Array | null>(null)
  const particleCountRef = useRef<number>(0)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup with black background
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000) // Black background
    sceneRef.current = scene

    // Camera setup (orthographic for 2D overlay)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.z = 1
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: false, // No transparency, solid black background
      antialias: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current = renderer

    containerRef.current.appendChild(renderer.domElement)

    // Particle system setup with InstancedMesh for spheres
    const baseCount = Math.floor(800 * Math.max(0.1, particleCount)) // 80-800 particles
    particleCountRef.current = baseCount

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(1, 8, 8) // Low-poly sphere for performance

    // Create material with vertex colors
    const material = new THREE.MeshBasicMaterial({
      vertexColors: false, // We'll use per-instance colors
      toneMapped: false,
    })

    // Create instanced mesh
    const instancedMesh = new THREE.InstancedMesh(geometry, material, baseCount)
    scene.add(instancedMesh)
    instancedMeshRef.current = instancedMesh

    // Initialize per-instance data
    targetPositionsRef.current = new Float32Array(baseCount * 3)
    velocitiesRef.current = new Float32Array(baseCount * 3)
    colorsArrayRef.current = new Float32Array(baseCount * 3)

    // Initialize particle positions and colors
    const tempMatrix = new THREE.Matrix4()
    const tempColor = new THREE.Color()

    for (let i = 0; i < baseCount; i++) {
      // Initial position in center
      const angle = (i / baseCount) * Math.PI * 2 * 5
      const radius = 0.1 + (i % 10) * 0.05
      
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const z = 0
      
      // Set instance transformation matrix
      tempMatrix.makeTranslation(x, y, z)
      instancedMesh.setMatrixAt(i, tempMatrix)

      // Initialize target positions
      if (targetPositionsRef.current) {
        targetPositionsRef.current[i * 3] = x
        targetPositionsRef.current[i * 3 + 1] = y
        targetPositionsRef.current[i * 3 + 2] = z
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true

    // Handle window resize
    const handleResize = () => {
      if (!renderer || !camera) return
      
      const width = window.innerWidth
      const height = window.innerHeight
      const aspect = width / height

      camera.left = -aspect
      camera.right = aspect
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (renderer) {
        renderer.dispose()
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }

      if (instancedMesh) {
        instancedMesh.geometry.dispose()
        if (instancedMesh.material instanceof THREE.Material) {
          instancedMesh.material.dispose()
        }
      }

      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      instancedMeshRef.current = null
    }
  }, []) // Only run once on mount

  // Update colors when they change
  useEffect(() => {
    if (!instancedMeshRef.current || !colorsArrayRef.current) return

    const instancedMesh = instancedMeshRef.current
    const count = particleCountRef.current

    // Parse colors
    const colorA = new THREE.Color(colors.swirlA)
    const colorB = new THREE.Color(colors.swirlB)
    const colorChroma = new THREE.Color(colors.chromaBase)

    for (let i = 0; i < count; i++) {
      // Create gradient based on particle index
      const t = i / count
      let color: THREE.Color

      if (t < 0.33) {
        color = new THREE.Color().lerpColors(colorA, colorChroma, t * 3)
      } else if (t < 0.66) {
        color = new THREE.Color().lerpColors(colorChroma, colorB, (t - 0.33) * 3)
      } else {
        color = new THREE.Color().lerpColors(colorB, colorA, (t - 0.66) * 3)
      }

      // Store color for later use
      colorsArrayRef.current[i * 3] = color.r
      colorsArrayRef.current[i * 3 + 1] = color.g
      colorsArrayRef.current[i * 3 + 2] = color.b

      // Set instance color
      instancedMesh.setColorAt(i, color)
    }

    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true
    }
  }, [colors])

  // Animation loop
  useEffect(() => {
    if (!instancedMeshRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return
    }

    const instancedMesh = instancedMeshRef.current
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    const count = particleCountRef.current

    const tempMatrix = new THREE.Matrix4()
    const tempPosition = new THREE.Vector3()
    const tempScale = new THREE.Vector3()
    const tempColor = new THREE.Color()

    const animate = () => {
      if (!instancedMesh || !targetPositionsRef.current || !velocitiesRef.current || !colorsArrayRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const targetPositions = targetPositionsRef.current
      const velocities = velocitiesRef.current
      const colorsArray = colorsArrayRef.current

      // Audio reactivity
      const audioBass = audioData?.bass ?? 0
      const audioMid = audioData?.mid ?? 0
      const audioTransient = audioData?.transient ?? 0
      const audioVolume = audioData?.volume ?? 0
      const audioEnergy = audioData?.fftEnergy ?? 0

      // Base particle size with audio pulsing
      const baseSizeMultiplier = 0.005 + particleSize * 0.015 // 0.005 - 0.02
      const audioPulse = 1.0 + (audioBass * 0.5 + audioTransient * 1.0) // Pulse with bass and transients
      const finalSize = baseSizeMultiplier * audioPulse

      // Calculate hand closedness (average of both hands if available)
      let avgClosedness = 0.5 // Default: half open
      let closednessCount = 0

      if (handData.leftHandClosedness !== undefined) {
        avgClosedness += handData.leftHandClosedness
        closednessCount++
      }
      if (handData.rightHandClosedness !== undefined) {
        avgClosedness += handData.rightHandClosedness
        closednessCount++
      }

      if (closednessCount > 0) {
        avgClosedness /= closednessCount
      }

      // Clustering factor: closed hands = tighter cluster (lower spread)
      // Open hands = wider spread
      const clusteringFactor = 0.3 + (1.0 - avgClosedness) * 1.5 // 0.3 (closed) to 1.8 (open)

      // Update target positions based on hand data
      if (handData.hands > 0) {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 * 5 + time * (0.3 + audioMid * 0.5)
          const ringIndex = i % 10
          const baseRadius = (0.08 + ringIndex * 0.04) * clusteringFactor
          
          // Apply hand expansion (distance between hands)
          const expansionFactor = 0.7 + handData.expansion * 1.0
          let radius = baseRadius * expansionFactor

          // Audio turbulence - adds wobble
          const turbulence = (audioEnergy * 0.15 + audioMid * 0.1) * Math.sin(time * 3 + i * 0.1)
          radius += turbulence

          // Determine which hand to orbit around
          let centerX = 0
          let centerY = 0

          if (handData.hands === 1) {
            // Single hand - orbit around it
            const hand = handData.leftHand || handData.rightHand
            if (hand) {
              // Convert from normalized (0-1) to clip space (-1 to 1)
              // Note: Y is inverted in video coordinates
              centerX = (hand.x * 2 - 1) * (window.innerWidth / window.innerHeight)
              centerY = -(hand.y * 2 - 1)
            }
          } else if (handData.hands === 2 && handData.leftHand && handData.rightHand) {
            // Two hands - split particles between them
            const isLeftGroup = i < count / 2

            if (isLeftGroup && handData.leftHand) {
              centerX = (handData.leftHand.x * 2 - 1) * (window.innerWidth / window.innerHeight)
              centerY = -(handData.leftHand.y * 2 - 1)
            } else if (handData.rightHand) {
              centerX = (handData.rightHand.x * 2 - 1) * (window.innerWidth / window.innerHeight)
              centerY = -(handData.rightHand.y * 2 - 1)
            }
          }

          // Calculate orbit position
          targetPositions[i * 3] = centerX + Math.cos(angle) * radius
          targetPositions[i * 3 + 1] = centerY + Math.sin(angle) * radius
          targetPositions[i * 3 + 2] = Math.sin(time * 2 + i * 0.05) * 0.02 // Slight depth variation
        }
      } else {
        // No hands - particles drift to center with gentle motion
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 * 5 + time * 0.2
          const radius = 0.1 + (i % 10) * 0.03
          
          targetPositions[i * 3] = Math.cos(angle) * radius
          targetPositions[i * 3 + 1] = Math.sin(angle) * radius
          targetPositions[i * 3 + 2] = 0
        }
      }

      // Smoothly interpolate to target positions
      // Faster response with audio
      const baseSpeed = 0.02 + responseSpeed * 0.08
      const audioSpeedBoost = 1.0 + audioVolume * 0.5
      const lerpFactor = baseSpeed * audioSpeedBoost

      // Update instance matrices
      for (let i = 0; i < count; i++) {
        // Get current position from matrix
        instancedMesh.getMatrixAt(i, tempMatrix)
        tempMatrix.decompose(tempPosition, new THREE.Quaternion(), tempScale)

        const currentX = tempPosition.x
        const currentY = tempPosition.y
        const currentZ = tempPosition.z

        const targetX = targetPositions[i * 3]
        const targetY = targetPositions[i * 3 + 1]
        const targetZ = targetPositions[i * 3 + 2]

        // Update velocity with some inertia
        velocities[i * 3] = velocities[i * 3] * 0.95 + (targetX - currentX) * lerpFactor
        velocities[i * 3 + 1] = velocities[i * 3 + 1] * 0.95 + (targetY - currentY) * lerpFactor
        velocities[i * 3 + 2] = velocities[i * 3 + 2] * 0.95 + (targetZ - currentZ) * lerpFactor

        // Apply velocity
        const newX = currentX + velocities[i * 3]
        const newY = currentY + velocities[i * 3 + 1]
        const newZ = currentZ + velocities[i * 3 + 2]

        // Update matrix with new position and size
        tempMatrix.makeScale(finalSize, finalSize, finalSize)
        tempMatrix.setPosition(newX, newY, newZ)
        instancedMesh.setMatrixAt(i, tempMatrix)

        // Optional: Brighten color with audio
        if (audioVolume > 0.3) {
          const baseR = colorsArray[i * 3]
          const baseG = colorsArray[i * 3 + 1]
          const baseB = colorsArray[i * 3 + 2]
          
          const brightnessBoost = 1.0 + (audioVolume - 0.3) * 0.5
          tempColor.setRGB(
            Math.min(1, baseR * brightnessBoost),
            Math.min(1, baseG * brightnessBoost),
            Math.min(1, baseB * brightnessBoost)
          )
          instancedMesh.setColorAt(i, tempColor)
        } else {
          // Reset to base color
          tempColor.setRGB(colorsArray[i * 3], colorsArray[i * 3 + 1], colorsArray[i * 3 + 2])
          instancedMesh.setColorAt(i, tempColor)
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true
      }

      // Render
      renderer.render(scene, camera)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handData, responseSpeed, time, particleSize, audioData])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-10"
    />
  )
}
