"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface AudioData {
  volume: number
  bass: number
  mid: number
  treble: number
  isActive: boolean
}

export function useAudio() {
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    isActive: false,
  })
  const [isEnabled, setIsEnabled] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number>()

  const enableAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)
      
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
      
      setIsEnabled(true)
      
      return true
    } catch (error) {
      console.error("Error accessing microphone:", error)
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
    })
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

      // Calculate bass (low frequencies: 0-10)
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.1))
      const bass = bassRange.reduce((sum, value) => sum + value, 0) / bassRange.length / 255

      // Calculate mid (mid frequencies: 10-50%)
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.1),
        Math.floor(bufferLength * 0.5)
      )
      const mid = midRange.reduce((sum, value) => sum + value, 0) / midRange.length / 255

      // Calculate treble (high frequencies: 50-100%)
      const trebleRange = dataArray.slice(Math.floor(bufferLength * 0.5))
      const treble = trebleRange.reduce((sum, value) => sum + value, 0) / trebleRange.length / 255

      setAudioData({
        volume,
        bass,
        mid,
        treble,
        isActive: volume > 0.01,
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
