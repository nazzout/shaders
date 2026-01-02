"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface AudioData {
  volume: number
  bass: number
  mid: number
  treble: number
  isActive: boolean
  transient: number      // Transient spike detection (0-1)
  fftEnergy: number      // Total FFT energy (0-1)
  spectralCentroid: number  // Brightness measure (0-1)
}

export function useAudio() {
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    isActive: false,
    transient: 0,
    fftEnergy: 0,
    spectralCentroid: 0,
  })
  const [isEnabled, setIsEnabled] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number>()
  const previousVolumeRef = useRef<number>(0)
  const volumeHistoryRef = useRef<number[]>([])

  const enableAudio = useCallback(async () => {
    try {
      // Check if getUserMedia API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn(
          "getUserMedia is not supported. " +
          "This may be due to: " +
          "1) Accessing via HTTP instead of HTTPS, " +
          "2) Browser doesn't support the API, or " +
          "3) Permissions are blocked."
        )
        return false
      }

      // Check if AudioContext is available
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn("Web Audio API is not supported in this browser.")
        return false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 512  // Increased for better frequency resolution
      analyserRef.current.smoothingTimeConstant = 0.7  // Balanced smoothing
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)
      
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
      
      setIsEnabled(true)
      
      return true
    } catch (error) {
      console.error("Error accessing microphone:", error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.warn("Microphone access was denied by the user.")
        } else if (error.name === 'NotFoundError') {
          console.warn("No microphone found on this device.")
        } else if (error.name === 'NotSupportedError') {
          console.warn("Microphone access is not supported (may require HTTPS).")
        }
      }
      return false
    }
  }, [])

  const disableAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current.mediaStream.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    setIsEnabled(false)
    setAudioData({
      volume: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      isActive: false,
      transient: 0,
      fftEnergy: 0,
      spectralCentroid: 0,
    })
    previousVolumeRef.current = 0
    volumeHistoryRef.current = []
  }, [])

  useEffect(() => {
    if (!isEnabled || !analyserRef.current || !dataArrayRef.current) return

    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    const bufferLength = analyser.frequencyBinCount

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray)

      // Calculate volume (average of all frequencies)
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255

      // Calculate bass (low frequencies: 0-15%)
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15))
      const bass = bassRange.reduce((sum, value) => sum + value, 0) / bassRange.length / 255

      // Calculate mid (mid frequencies: 15-60%)
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.15),
        Math.floor(bufferLength * 0.6)
      )
      const mid = midRange.reduce((sum, value) => sum + value, 0) / midRange.length / 255

      // Calculate treble (high frequencies: 60-100%)
      const trebleRange = dataArray.slice(Math.floor(bufferLength * 0.6))
      const treble = trebleRange.reduce((sum, value) => sum + value, 0) / trebleRange.length / 255

      // Transient detection - detect sudden volume increases
      const volumeDelta = volume - previousVolumeRef.current
      const transientThreshold = 0.08
      let transient = 0
      
      if (volumeDelta > transientThreshold) {
        // Strong transient spike
        transient = Math.min(1, volumeDelta / 0.2)
      } else if (volumeDelta > 0) {
        // Gradual increase, decay previous transient
        transient = Math.max(0, previousVolumeRef.current * 0.85)
      }
      
      previousVolumeRef.current = transient

      // Calculate FFT energy (sum of squares for better dynamic range)
      const fftEnergy = Math.sqrt(
        dataArray.reduce((sum, value) => sum + (value / 255) ** 2, 0) / bufferLength
      )

      // Calculate spectral centroid (weighted average frequency - brightness measure)
      let weightedSum = 0
      let magnitudeSum = 0
      for (let i = 0; i < bufferLength; i++) {
        const magnitude = dataArray[i] / 255
        weightedSum += magnitude * i
        magnitudeSum += magnitude
      }
      const spectralCentroid = magnitudeSum > 0 ? (weightedSum / magnitudeSum) / bufferLength : 0

      setAudioData({
        volume,
        bass,
        mid,
        treble,
        isActive: volume > 0.01,
        transient,
        fftEnergy,
        spectralCentroid,
      })

      animationFrameRef.current = requestAnimationFrame(analyze)
    }

    analyze()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isEnabled])

  return {
    audioData,
    isEnabled,
    enableAudio,
    disableAudio,
  }
}
