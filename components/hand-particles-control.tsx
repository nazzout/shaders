"use client"

import { useEffect } from "react"
import { Camera } from "lucide-react"
import { useShaderSettings } from "@/components/shader-settings-provider"

interface HandParticlesControlProps {
  isCameraActive: boolean
  handsDetected: number
  cameraError: string | null
  startCamera: () => Promise<boolean>
  stopCamera: () => void
}

export function HandParticlesControl({
  isCameraActive,
  handsDetected,
  cameraError,
  startCamera,
  stopCamera,
}: HandParticlesControlProps) {
  const { settings, updateHandParticles } = useShaderSettings()

  // Sync camera active state with settings
  useEffect(() => {
    if (isCameraActive !== settings.handParticles?.cameraActive) {
      updateHandParticles({ cameraActive: isCameraActive })
    }
  }, [isCameraActive, settings.handParticles?.cameraActive, updateHandParticles])

  const handleStartCamera = async () => {
    const success = await startCamera()
    if (success) {
      updateHandParticles({ cameraActive: true })
    }
  }

  const handleStopCamera = () => {
    stopCamera()
    updateHandParticles({ cameraActive: false })
  }

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-foreground/5 p-4">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-foreground/60" />
        <span className="text-sm font-medium text-foreground">Camera</span>
      </div>
      
      <div className="text-xs text-foreground/60">
        <p>Status: <span className="font-mono">{isCameraActive ? "Camera On" : "Camera Off"}</span></p>
        <p className="mt-1">Hands Detected: <span className="font-mono">{handsDetected}</span></p>
      </div>

      {cameraError && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
          {cameraError}
        </div>
      )}

      {!isCameraActive && (
        <div>
          <p className="text-xs text-foreground/50 mb-2">
            Click to request camera permission and start hand tracking.
          </p>
          <button
            onClick={handleStartCamera}
            className="w-full rounded-lg bg-foreground/10 px-4 py-2 text-sm text-foreground hover:bg-foreground/20 transition-colors"
            title="Start Camera"
          >
            Start Camera
          </button>
        </div>
      )}

      {isCameraActive && (
        <button
          onClick={handleStopCamera}
          className="w-full rounded-lg bg-red-600/10 px-4 py-2 text-sm text-red-600 hover:bg-red-600/20 transition-colors"
          title="Stop Camera"
        >
          Stop Camera
        </button>
      )}
    </div>
  )
}
