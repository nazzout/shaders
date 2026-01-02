"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type {
  HandLandmarker,
  HandLandmarkerResult,
  FilesetResolver,
} from "@mediapipe/tasks-vision"

export interface HandData {
  hands: number // 0, 1, or 2 hands detected
  leftHand?: { x: number; y: number; z: number } // Normalized 0-1 position
  rightHand?: { x: number; y: number; z: number }
  leftHandClosedness?: number // 0 = open, 1 = closed fist
  rightHandClosedness?: number // 0 = open, 1 = closed fist
  distance?: number // Distance between hands (if both present), 0-1 normalized
  expansion: number // How "expanded" the hands are (0-1, affects particle spread)
}

export function useHandTracking() {
  const [isActive, setIsActive] = useState(false)
  const [handsDetected, setHandsDetected] = useState(0)
  const [handData, setHandData] = useState<HandData>({
    hands: 0,
    expansion: 0.5,
  })
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Calculate hand closedness (0 = open, 1 = closed)
  // Based on distance between fingertips and palm center
  const calculateHandClosedness = useCallback((landmarks: any[]) => {
    // Hand landmarks: 0=wrist, 4=thumb tip, 8=index tip, 12=middle tip, 16=ring tip, 20=pinky tip
    // Palm center is roughly at landmark 0 (wrist) or average of base knuckles
    const wrist = landmarks[0]
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]

    // Calculate distances from wrist to each fingertip
    const distances = [
      Math.sqrt((thumbTip.x - wrist.x) ** 2 + (thumbTip.y - wrist.y) ** 2 + (thumbTip.z - wrist.z) ** 2),
      Math.sqrt((indexTip.x - wrist.x) ** 2 + (indexTip.y - wrist.y) ** 2 + (indexTip.z - wrist.z) ** 2),
      Math.sqrt((middleTip.x - wrist.x) ** 2 + (middleTip.y - wrist.y) ** 2 + (middleTip.z - wrist.z) ** 2),
      Math.sqrt((ringTip.x - wrist.x) ** 2 + (ringTip.y - wrist.y) ** 2 + (ringTip.z - wrist.z) ** 2),
      Math.sqrt((pinkyTip.x - wrist.x) ** 2 + (pinkyTip.y - wrist.y) ** 2 + (pinkyTip.z - wrist.z) ** 2),
    ]

    // Average distance (normalized to 0-1 range, typical hand spread is ~0.3-0.4)
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length
    
    // Map to closedness: larger distance = more open (closedness near 0), smaller = more closed (near 1)
    // Typical open hand: ~0.35-0.4, closed fist: ~0.15-0.2
    const openThreshold = 0.35
    const closedThreshold = 0.15
    const closedness = 1 - Math.max(0, Math.min(1, (avgDistance - closedThreshold) / (openThreshold - closedThreshold)))
    
    return closedness
  }, [])

  // Process hand tracking results
  const processResults = useCallback((results: HandLandmarkerResult) => {
    if (!results.landmarks || results.landmarks.length === 0) {
      setHandsDetected(0)
      setHandData({
        hands: 0,
        expansion: 0.5,
      })
      return
    }

    const numHands = results.landmarks.length
    setHandsDetected(numHands)

    // Get hand positions from wrist landmark (index 0)
    const newHandData: HandData = {
      hands: numHands,
      expansion: 0.5,
    }

    if (numHands >= 1) {
      const hand1 = results.landmarks[0][0] // Wrist position
      const handedness1 = results.handedness?.[0]?.[0]?.categoryName
      const closedness1 = calculateHandClosedness(results.landmarks[0])

      if (handedness1 === "Left") {
        newHandData.leftHand = { x: hand1.x, y: hand1.y, z: hand1.z }
        newHandData.leftHandClosedness = closedness1
      } else {
        newHandData.rightHand = { x: hand1.x, y: hand1.y, z: hand1.z }
        newHandData.rightHandClosedness = closedness1
      }
    }

    if (numHands >= 2) {
      const hand2 = results.landmarks[1][0] // Wrist position
      const handedness2 = results.handedness?.[1]?.[0]?.categoryName
      const closedness2 = calculateHandClosedness(results.landmarks[1])

      if (handedness2 === "Left") {
        newHandData.leftHand = { x: hand2.x, y: hand2.y, z: hand2.z }
        newHandData.leftHandClosedness = closedness2
      } else {
        newHandData.rightHand = { x: hand2.x, y: hand2.y, z: hand2.z }
        newHandData.rightHandClosedness = closedness2
      }

      // Calculate distance between hands (normalized 0-1)
      if (newHandData.leftHand && newHandData.rightHand) {
        const dx = newHandData.leftHand.x - newHandData.rightHand.x
        const dy = newHandData.leftHand.y - newHandData.rightHand.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        newHandData.distance = Math.min(distance, 1.0)
        
        // Expansion is based on distance (wider hands = more expansion)
        newHandData.expansion = Math.min(distance * 2, 1.0)
      }
    }

    setHandData(newHandData)
  }, [calculateHandClosedness])

  // Start camera and hand tracking
  const startCamera = useCallback(async () => {
    try {
      setError(null)

      // Dynamically import MediaPipe libraries (client-side only)
      let HandLandmarker: any
      let FilesetResolver: any
      
      try {
        const visionModule = await import("@mediapipe/tasks-vision")
        HandLandmarker = visionModule.HandLandmarker
        FilesetResolver = visionModule.FilesetResolver
      } catch (err) {
        console.error("Failed to load MediaPipe libraries:", err)
        setError("Hand tracking is not available on this platform")
        return false
      }

      // Check for HTTPS requirement on mobile
      const isHTTPS = window.location.protocol === "https:"
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"

      if (!isHTTPS && !isLocalhost) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          setError(
            "Camera access requires HTTPS on mobile devices. Please use localhost or a secure connection."
          )
          return false
        }
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      streamRef.current = stream

      // Create video element
      if (!videoRef.current) {
        videoRef.current = document.createElement("video")
        videoRef.current.autoplay = true
        videoRef.current.playsInline = true
      }

      videoRef.current.srcObject = stream

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            resolve()
          }
        } else {
          resolve()
        }
      })

      // Initialize MediaPipe Hand Landmarker
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
      )

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 2,
        runningMode: "VIDEO",
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      handLandmarkerRef.current = handLandmarker

      // Start processing video frames
      const processFrame = () => {
        if (videoRef.current && handLandmarkerRef.current) {
          const results = handLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          )
          processResults(results)
        }
        animationFrameRef.current = requestAnimationFrame(processFrame)
      }

      processFrame()

      setIsActive(true)
      return true
    } catch (err) {
      console.error("Failed to start camera:", err)
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Please allow camera access in your browser settings."
          )
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.")
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError("Failed to access camera. Please check permissions.")
      }
      
      return false
    }
  }, [processResults])

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Close MediaPipe Hand Landmarker
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close()
      handLandmarkerRef.current = null
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }

    setIsActive(false)
    setHandsDetected(0)
    setHandData({
      hands: 0,
      expansion: 0.5,
    })
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    isActive,
    handsDetected,
    handData,
    error,
    startCamera,
    stopCamera,
  }
}
