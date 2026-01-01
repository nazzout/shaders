"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { useEffect, useState, useMemo } from "react"
import { useShaderSettings } from "@/components/shader-settings-provider"

interface ShaderBackgroundProps {
  audioVolume?: number
  audioBass?: number
  audioMid?: number
  audioTreble?: number
  audioTransient?: number
  audioFFTEnergy?: number
  audioSpectralCentroid?: number
  currentSection?: number
}

export default function ShaderBackground({
  audioVolume = 0,
  audioBass = 0,
  audioMid = 0,
  audioTreble = 0,
  audioTransient = 0,
  audioFFTEnergy = 0,
  audioSpectralCentroid = 0,
  currentSection = 0,
}: ShaderBackgroundProps) {
  // Load color schemes from settings hook - this will reactively update
  const { settings } = useShaderSettings()
  
  // Memoize colors based on settings to ensure proper re-renders
  const colors = useMemo(() => {
    const colorSchemes = [
      settings.sections.hero,
      settings.sections.work,
      settings.sections.services,
      settings.sections.about,
      settings.sections.contact,
    ]
    return colorSchemes[currentSection] || colorSchemes[0]
  }, [settings, currentSection])

  // Chaotic modulation state
  const [chaos, setChaos] = useState({
    drift1: 0,
    drift2: 0,
    drift3: 0,
    drift4: 0,
    drift5: 0,
    drift6: 0,
    phase: 0,
    turbulence: 0,
  })

  // Update chaos values using noise-driven drift
  useEffect(() => {
    let animationFrame: number
    let lastTime = Date.now()

    const updateChaos = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      // FFT energy drives chaos intensity - more energy = more controlled chaos
      const audioEnergy = (audioVolume + audioBass + audioMid + audioTreble) / 4
      const fftDrivenChaos = audioFFTEnergy * 1.5 // Amplify FFT influence
      
      // Transients add sharp, musical bursts of chaos
      const transientBoost = audioTransient * 2.0
      
      // Base chaos inversely proportional to audio, but FFT adds controlled unpredictability
      const baseChaosStrength = Math.max(0.2, 1 - audioEnergy * 0.5)
      const chaosStrength = baseChaosStrength + fftDrivenChaos * 0.6

      setChaos((prev) => {
        const t = now / 1000
        
        // Multi-layered Perlin-like noise with FFT and transient modulation
        const noise1 = Math.sin(t * 0.7 + prev.drift1) * Math.cos(t * 0.3 + fftDrivenChaos)
        const noise2 = Math.sin(t * 1.1 + prev.drift2) * Math.cos(t * 0.5 + audioSpectralCentroid * Math.PI)
        const noise3 = Math.sin(t * 0.5 + prev.drift3) * Math.cos(t * 0.8 - transientBoost)
        const noise4 = Math.sin(t * 0.9 + prev.drift4) * Math.cos(t * 0.4 + audioBass * Math.PI)
        const noise5 = Math.sin(t * 1.3 + prev.drift5) * Math.cos(t * 0.6 + audioMid * Math.PI)
        const noise6 = Math.sin(t * 0.8 + prev.drift6) * Math.cos(t * 0.7 + audioTreble * Math.PI)
        
        // Turbulence driven by transients and FFT energy
        const turbulenceNoise = Math.sin(t * 2.5 + prev.turbulence) * (transientBoost + fftDrivenChaos)
        
        // Variable drift speed - faster during high energy, with transient spikes
        const baseDriftSpeed = chaosStrength * deltaTime * 0.7
        const transientDriftBoost = transientBoost * deltaTime * 2.0
        const driftSpeed = baseDriftSpeed + transientDriftBoost

        return {
          drift1: (prev.drift1 + noise1 * driftSpeed) % (Math.PI * 2),
          drift2: (prev.drift2 + noise2 * driftSpeed) % (Math.PI * 2),
          drift3: (prev.drift3 + noise3 * driftSpeed) % (Math.PI * 2),
          drift4: (prev.drift4 + noise4 * driftSpeed) % (Math.PI * 2),
          drift5: (prev.drift5 + noise5 * driftSpeed) % (Math.PI * 2),
          drift6: (prev.drift6 + noise6 * driftSpeed) % (Math.PI * 2),
          phase: (prev.phase + deltaTime * (0.3 + audioEnergy * 0.5)) % (Math.PI * 2),
          turbulence: (prev.turbulence + turbulenceNoise * deltaTime) % (Math.PI * 2),
        }
      })

      animationFrame = requestAnimationFrame(updateChaos)
    }

    updateChaos()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [audioVolume, audioBass, audioMid, audioTreble, audioFFTEnergy, audioTransient, audioSpectralCentroid])

  // Audio energy metrics for advanced modulation
  const audioEnergy = (audioVolume + audioBass + audioMid + audioTreble) / 4
  const fftDrivenChaos = audioFFTEnergy * 1.5
  const transientBoost = audioTransient * 2.0
  const baseChaosStrength = Math.max(0.2, 1 - audioEnergy * 0.5)
  const chaosStrength = baseChaosStrength + fftDrivenChaos * 0.6
  
  // Expanded noise modulation with multiple layers
  const noiseModulation1 = Math.sin(chaos.drift1) * chaosStrength * 0.8  // Increased depth
  const noiseModulation2 = Math.cos(chaos.drift2) * chaosStrength * 0.7
  const noiseModulation3 = Math.sin(chaos.drift3) * chaosStrength * 0.6
  const noiseModulation4 = Math.cos(chaos.drift4) * chaosStrength * 0.75
  const noiseModulation5 = Math.sin(chaos.drift5) * chaosStrength * 0.5
  const noiseModulation6 = Math.cos(chaos.drift6) * chaosStrength * 0.65
  const phaseModulation = Math.sin(chaos.phase) * chaosStrength * 0.4
  const turbulenceModulation = Math.cos(chaos.turbulence) * transientBoost * 1.2
  
  // Spectral brightness affects detail and intensity
  const brightnessBoost = audioSpectralCentroid * 0.8

  // Map audio data to shader parameters with expanded modulation depth
  // Speed: driven by volume, transients, and chaos
  const speed = 0.6 + audioVolume * 1.2 + noiseModulation1 + transientBoost * 0.5
  
  // Detail: mid frequencies + brightness + chaos
  const detail = 0.7 + audioMid * 0.9 + brightnessBoost + noiseModulation2
  
  // Blend: bass-heavy with strong chaos influence
  const blend = 45 + audioBass * 60 + noiseModulation3 * 35 + turbulenceModulation * 20
  
  // Intensity: treble + brightness + transients
  const intensity = 0.8 + audioTreble * 0.7 + brightnessBoost * 0.5 + noiseModulation4 + transientBoost * 0.3
  
  // Radius: volume-driven with FFT chaos
  const radius = 1.6 + audioVolume * 1.2 + phaseModulation + fftDrivenChaos * 0.6
  
  // Momentum: bass + chaos + transient bursts
  const momentum = 20 + audioBass * 45 + noiseModulation1 * 25 + turbulenceModulation * 15

  // Expanded positional drift with FFT and transient influence
  const coarseX = 40 + Math.sin(chaos.drift1) * (chaosStrength * 8 + transientBoost * 6)
  const coarseY = 40 + Math.cos(chaos.drift2) * (chaosStrength * 8 + fftDrivenChaos * 5)
  const mediumX = 40 + Math.sin(chaos.drift3 + audioSpectralCentroid * Math.PI) * (chaosStrength * 7)
  const mediumY = 40 + Math.cos(chaos.drift4 + audioBass * Math.PI) * (chaosStrength * 7)
  const fineX = 40 + Math.sin(chaos.phase + chaos.drift5) * (chaosStrength * 6 + turbulenceModulation * 4)
  const fineY = 40 + Math.cos(chaos.phase + chaos.drift6) * (chaosStrength * 6 + noiseModulation6 * 3)

  // Create a key from colors to force shader re-render when colors change
  const colorKey = `${colors.swirlA}-${colors.swirlB}-${colors.chromaBase}-${colors.chromaLeft}-${colors.chromaRight}`

  return (
    <Shader key={colorKey} className="h-full w-full">
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
