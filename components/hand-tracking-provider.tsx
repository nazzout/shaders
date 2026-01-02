"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useHandTracking } from "@/hooks/use-hand-tracking"
import type { HandData } from "@/hooks/use-hand-tracking"

interface HandTrackingContextType {
  isActive: boolean
  handsDetected: number
  handData: HandData
  error: string | null
  startCamera: () => Promise<boolean>
  stopCamera: () => void
}

const HandTrackingContext = createContext<HandTrackingContextType | undefined>(undefined)

export function HandTrackingProvider({ children }: { children: ReactNode }) {
  const handTracking = useHandTracking()

  return (
    <HandTrackingContext.Provider value={handTracking}>
      {children}
    </HandTrackingContext.Provider>
  )
}

export function useHandTrackingContext() {
  const context = useContext(HandTrackingContext)
  if (context === undefined) {
    throw new Error("useHandTrackingContext must be used within a HandTrackingProvider")
  }
  return context
}
