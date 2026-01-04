"use client"

import dynamic from "next/dynamic"
import { CustomCursor, CursorProvider, useCursorPosition } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { MagneticButton } from "@/components/magnetic-button"
import { FloatingSettingsButton } from "@/components/floating-settings-button"
import { ShaderSettingsProvider, useShaderSettings } from "@/components/shader-settings-provider"
import { WarpedGradientBackground } from "@/components/warped-gradient-background"
import { NodalParticlesGradient } from "@/components/nodal-particles-gradient"
import { useRef, useEffect, useState } from "react"
import { useAudio } from "@/hooks/use-audio"

const ShaderBackground = dynamic(() => import("@/components/shader-background"), {
  ssr: false,
  loading: () => null,
})

function HomeContent() {
  const { settings, getSectionColors } = useShaderSettings()
  const { position: cursorPosition, isOverUI: isInteractingWithUI } = useCursorPosition()
  const [time, setTime] = useState(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number>()
  const { audioData, isEnabled, enableAudio, disableAudio } = useAudio()
  const [audioError, setAudioError] = useState<string | null>(null)
  
  const handleAudioToggle = async () => {
    if (isEnabled) {
      disableAudio()
      setAudioError(null)
    } else {
      const success = await enableAudio()
      if (!success) {
        // Check if we're on HTTP (not HTTPS)
        const isHTTP = window.location.protocol === 'http:'
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        
        if (isHTTP && !isLocalhost) {
          setAudioError('Microphone access requires HTTPS on mobile devices. Please use localhost or a secure connection.')
        } else {
          setAudioError('Could not access microphone. Please check permissions in your browser settings.')
        }
        
        // Clear error after 5 seconds
        setTimeout(() => setAudioError(null), 5000)
      } else {
        setAudioError(null)
      }
    }
  }

  // Animation time for shader coordination
  useEffect(() => {
    const startTime = Date.now()
    const updateTime = () => {
      setTime((Date.now() - startTime) / 1000)
      requestAnimationFrame(updateTime)
    }
    updateTime()
  }, [])

  // Fade out scroll hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (!gl) {
          console.log("[v0] WebGL not supported, using fallback")
          setWebGLSupported(false)
          setIsLoaded(true)
          return false
        }
        console.log("[v0] WebGL is supported")
        setWebGLSupported(true)
        return true
      } catch (e) {
        console.log("[v0] WebGL check failed:", e)
        setWebGLSupported(false)
        setIsLoaded(true)
        return false
      }
    }

    const isSupported = checkWebGLSupport()

    if (!isSupported) {
      return
    }

    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 4) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 4) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
        <CustomCursor />
        <GrainOverlay />
        <FloatingSettingsButton />

      {webGLSupported === true ? (
        <div
          ref={shaderContainerRef}
          data-custom-cursor
          className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ contain: "strict" }}
        >
          {settings.activeEffect === 'nodalParticles' ? (
            <NodalParticlesGradient
              colors={getSectionColors(currentSection)}
              density={settings.nodalParticles.density}
              size={settings.nodalParticles.size}
              drift={settings.nodalParticles.drift}
              influence={settings.nodalParticles.influence}
              audioEnergy={audioData.fftEnergy}
              audioTransient={audioData.transient}
              audioBass={audioData.bass}
              time={time}
              chaosEnabled={settings.chaos.enabled}
              chaosAmount={settings.chaos.amount}
              turbulenceEnabled={settings.turbulence.enabled}
              turbulenceStrength={settings.turbulence.strength}
              turbulenceScale={settings.turbulence.scale}
              turbulenceSpeed={settings.turbulence.speed}
              turbulenceOctaves={settings.turbulence.octaves}
              cursorX={cursorPosition.x}
              cursorY={cursorPosition.y}
              cursorStrength={settings.cursor.strength}
              isInteractingWithUI={isInteractingWithUI}
            />
          ) : settings.activeEffect === 'membrane' ? (
            <WarpedGradientBackground
              colors={getSectionColors(currentSection)}
              depth={settings.membrane.depth}
              ripple={settings.membrane.ripple}
              audioEnergy={audioData.fftEnergy}
              audioTransient={audioData.transient}
              time={time}
              chaosEnabled={settings.chaos.enabled}
              chaosAmount={settings.chaos.amount}
              turbulenceEnabled={settings.turbulence.enabled}
              turbulenceStrength={settings.turbulence.strength}
              turbulenceScale={settings.turbulence.scale}
              turbulenceSpeed={settings.turbulence.speed}
              turbulenceOctaves={settings.turbulence.octaves}
              cursorX={cursorPosition.x}
              cursorY={cursorPosition.y}
              cursorStrength={settings.cursor.strength}
              isInteractingWithUI={isInteractingWithUI}
            />
          ) : (
            <ShaderBackground
              audioVolume={audioData.volume}
              audioBass={audioData.bass}
              audioMid={audioData.mid}
              audioTreble={audioData.treble}
              audioTransient={audioData.transient}
              audioFFTEnergy={audioData.fftEnergy}
              audioSpectralCentroid={audioData.spectralCentroid}
              currentSection={currentSection}
              chaosEnabled={settings.chaos.enabled}
              chaosAmount={settings.chaos.amount}
              turbulenceEnabled={settings.turbulence.enabled}
              turbulenceStrength={settings.turbulence.strength}
              turbulenceScale={settings.turbulence.scale}
              turbulenceSpeed={settings.turbulence.speed}
              turbulenceOctaves={settings.turbulence.octaves}
            />
          )}
        </div>
      ) : webGLSupported === false ? (
        <div
          data-custom-cursor
          className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(18, 117, 216, 0.3) 0%, rgba(225, 145, 54, 0.2) 50%, rgba(18, 18, 18, 1) 100%)",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : null}

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex flex-col items-end gap-2 px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={handleAudioToggle}
          className="group relative flex items-center gap-2 rounded-lg bg-foreground/15 px-4 py-2 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-foreground/25 active:scale-95"
        >
          <div className="relative h-2 w-2">
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                isEnabled ? "bg-green-500" : "bg-foreground/60"
              } ${
                audioData.isActive ? "animate-pulse" : ""
              }`}
            />
          </div>
          <span className="font-mono text-xs text-foreground/90">
            {isEnabled ? "Audio On" : "Audio Off"}
          </span>
        </button>
        
        {audioError && (
          <div className="max-w-xs rounded-lg bg-red-500/90 px-4 py-2 text-xs text-white backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            {audioError}
          </div>
        )}
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        data-custom-cursor
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
            showScrollHint ? "opacity-100 animate-in fade-in delay-500" : "opacity-0 pointer-events-none"
          }`}>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
              <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <WorkSection />
        <ServicesSection />
        <AboutSection scrollToSection={scrollToSection} />
        <ContactSection />
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}

export default function Home() {
  return (
        <CursorProvider>
      <ShaderSettingsProvider>
          <HomeContent />
      </ShaderSettingsProvider>
    </CursorProvider>
  )
}
