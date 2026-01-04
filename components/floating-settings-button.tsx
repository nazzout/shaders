"use client"

import { Settings } from "lucide-react"
import { useState } from "react"
import { ShaderLauncher } from "./shader-launcher"

export function FloatingSettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25 active:scale-95"
        aria-label="Open shader settings"
      >
        <Settings className="h-6 w-6 text-foreground/90 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <ShaderLauncher isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
