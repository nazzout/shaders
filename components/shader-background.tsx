"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { useEffect, useState } from "react"

interface ShaderBackgroundProps {
  audioVolume?: number
  audioBass?: number
  audioMid?: number
  audioTreble?: number
  currentSection?: number
}

export default function ShaderBackground({
  audioVolume = 0,
  audioBass = 0,
  audioMid = 0,
  audioTreble = 0,
  currentSection = 0,
}: ShaderBackgroundProps) {
  // Define color schemes for each section
  const colorSchemes = [
    // Hero (0)
    { swirlA: "#1275d8", swirlB: "#e19136", chromaBase: "#0066ff", chromaLeft: "#e19136", chromaRight: "#e19136" },
    // Work (1)
    { swirlA: "#8b5cf6", swirlB: "#ec4899", chromaBase: "#a855f7", chromaLeft: "#f472b6", chromaRight: "#f472b6" },
    // Services (2)
    { swirlA: "#10b981", swirlB: "#14b8a6", chromaBase: "#059669", chromaLeft: "#0d9488", chromaRight: "#0d9488" },
    // About (3)
    { swirlA: "#f59e0b", swirlB: "#ef4444", chromaBase: "#f97316", chromaLeft: "#dc2626", chromaRight: "#dc2626" },
    // Contact (4)
    { swirlA: "#6366f1", swirlB: "#06b6d4", chromaBase: "#4f46e5", chromaLeft: "#0891b2", chromaRight: "#0891b2" },
  ]

  const colors = colorSchemes[currentSection] || colorSchemes[0]

  // Chaotic modulation state
  const [chaos, setChaos] = useState({
    drift1: 0,
    drift2: 0,
    drift3: 0,
    drift4: 0,
    phase: 0,
  })

  // Update chaos values using noise-driven drift
  useEffect(() => {
    let animationFrame: number
    let lastTime = Date.now()

    const updateChaos = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      // Audio energy constrains the chaos - more audio = more stability
      const audioEnergy = (audioVolume + audioBass + audioMid + audioTreble) / 4
      const chaosStrength = Math.max(0.3, 1 - audioEnergy * 0.7) // Higher audio = lower chaos

      setChaos((prev) => {
        // Perlin-like noise using multiple sine waves with different frequencies
        const t = now / 1000
        const noise1 = Math.sin(t * 0.7 + prev.drift1) * Math.cos(t * 0.3)
        const noise2 = Math.sin(t * 1.1 + prev.drift2) * Math.cos(t * 0.5)
        const noise3 = Math.sin(t * 0.5 + prev.drift3) * Math.cos(t * 0.8)
        const noise4 = Math.sin(t * 0.9 + prev.drift4) * Math.cos(t * 0.4)

        // Drift accumulates slowly, creating long-form movement
        const driftSpeed = chaosStrength * deltaTime * 0.5

        return {
          drift1: (prev.drift1 + noise1 * driftSpeed) % (Math.PI * 2),
          drift2: (prev.drift2 + noise2 * driftSpeed) % (Math.PI * 2),
          drift3: (prev.drift3 + noise3 * driftSpeed) % (Math.PI * 2),
          drift4: (prev.drift4 + noise4 * driftSpeed) % (Math.PI * 2),
          phase: (prev.phase + deltaTime * 0.3) % (Math.PI * 2),
        }
      })

      animationFrame = requestAnimationFrame(updateChaos)
    }

    updateChaos()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [audioVolume, audioBass, audioMid, audioTreble])

  // Audio energy for scaling chaos impact
  const audioEnergy = (audioVolume + audioBass + audioMid + audioTreble) / 4
  const chaosStrength = Math.max(0.3, 1 - audioEnergy * 0.7)

  // Noise modulation values
  const noiseModulation1 = Math.sin(chaos.drift1) * chaosStrength * 0.3
  const noiseModulation2 = Math.cos(chaos.drift2) * chaosStrength * 0.25
  const noiseModulation3 = Math.sin(chaos.drift3) * chaosStrength * 0.2
  const noiseModulation4 = Math.cos(chaos.drift4) * chaosStrength * 0.35
  const phaseModulation = Math.sin(chaos.phase) * chaosStrength * 0.15

  // Map audio data to shader parameters with chaotic modulation
  const speed = 0.8 + audioVolume * 0.5 + noiseModulation1
  const detail = 0.8 + audioMid * 0.4 + noiseModulation2
  const blend = 50 + audioBass * 30 + noiseModulation3 * 20
  const intensity = 0.9 + audioTreble * 0.3 + noiseModulation4
  const radius = 1.8 + audioVolume * 0.6 + phaseModulation
  const momentum = 25 + audioBass * 20 + noiseModulation1 * 15

  // Add subtle drift to positions for organic movement
  const coarseX = 40 + Math.sin(chaos.drift1) * chaosStrength * 5
  const coarseY = 40 + Math.cos(chaos.drift2) * chaosStrength * 5
  const mediumX = 40 + Math.sin(chaos.drift3) * chaosStrength * 4
  const mediumY = 40 + Math.cos(chaos.drift4) * chaosStrength * 4
  const fineX = 40 + Math.sin(chaos.phase) * chaosStrength * 3
  const fineY = 40 + Math.cos(chaos.phase) * chaosStrength * 3

  return (
    <Shader className="h-full w-full">
      <Swirl
        colorA={colors.swirlA}
        colorB={colors.swirlB}
        speed={speed}
        detail={detail}
        blend={blend}
        coarseX={coarseX}
        coarseY={coarseY}
        mediumX={mediumX}
        mediumY={mediumY}
        fineX={fineX}
        fineY={fineY}
      />
      <ChromaFlow
        baseColor={colors.chromaBase}
        upColor={colors.chromaBase}
        downColor="#d1d1d1"
        leftColor={colors.chromaLeft}
        rightColor={colors.chromaRight}
        intensity={intensity}
        radius={radius}
        momentum={momentum}
        maskType="alpha"
        opacity={0.97}
      />
    </Shader>
  )
}
