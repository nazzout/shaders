"use client"

import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from "react"

interface CursorContextType {
  position: { x: number; y: number }
  isOverUI: boolean
}

const CursorContext = createContext<CursorContextType>({
  position: { x: 0.5, y: 0.5 },
  isOverUI: false,
})

export function useCursorPosition() {
  return useContext(CursorContext)
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [isOverUI, setIsOverUI] = useState(false)
  const positionRef = useRef({ x: 0.5, y: 0.5 })
  const rafIdRef = useRef<number>()
  const activePointerRef = useRef<number | null>(null)

  useEffect(() => {
    let pendingUpdate = false

    // Update position via RAF for smooth updates during touch drag
    const updatePosition = () => {
      if (pendingUpdate) {
        setPosition({ ...positionRef.current })
        pendingUpdate = false
      }
      rafIdRef.current = requestAnimationFrame(updatePosition)
    }
    rafIdRef.current = requestAnimationFrame(updatePosition)

    const checkUIElement = (target: HTMLElement): boolean => {
      return (
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.closest('input') !== null ||
        target.closest('select') !== null ||
        target.closest('textarea') !== null ||
        target.closest('[role="button"]') !== null ||
        target.closest('[data-ui-panel]') !== null ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      )
    }

    const updateCursorPosition = (clientX: number, clientY: number, target: HTMLElement) => {
      // Normalize to 0-1 range
      positionRef.current = {
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight,
      }
      pendingUpdate = true
      
      // Check if hovering over UI elements
      setIsOverUI(checkUIElement(target))
    }

    // Mouse events for desktop
    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e.clientX, e.clientY, e.target as HTMLElement)
    }

    // Touch events for mobile with proper drag tracking
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        updateCursorPosition(touch.clientX, touch.clientY, e.target as HTMLElement)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        updateCursorPosition(touch.clientX, touch.clientY, document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement)
      }
    }

    const handleTouchEnd = () => {
      // Keep last position on touch end
    }

    // Pointer events as fallback
    const handlePointerDown = (e: PointerEvent) => {
      activePointerRef.current = e.pointerId
      updateCursorPosition(e.clientX, e.clientY, e.target as HTMLElement)
      
      // Capture pointer for smooth dragging
      if (e.target instanceof Element) {
        try {
          e.target.setPointerCapture(e.pointerId)
        } catch (err) {
          // Ignore capture errors
        }
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointerRef.current === null || activePointerRef.current === e.pointerId) {
        updateCursorPosition(e.clientX, e.clientY, e.target as HTMLElement)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (activePointerRef.current === e.pointerId) {
        activePointerRef.current = null
      }
    }

    // Add all event listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    window.addEventListener("pointercancel", handlePointerUp, { passive: true })
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [])

  return (
    <CursorContext.Provider value={{ position, isOverUI }}>
      {children}
    </CursorContext.Provider>
  )
}

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const targetPositionRef = useRef({ x: 0, y: 0 })
  const isPointerRef = useRef(false)
  const { isOverUI } = useCursorPosition()

  useEffect(() => {
    let animationFrameId: number

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const updateCursor = () => {
      positionRef.current.x = lerp(positionRef.current.x, targetPositionRef.current.x, 0.15)
      positionRef.current.y = lerp(positionRef.current.y, targetPositionRef.current.y, 0.15)

      if (outerRef.current && innerRef.current) {
        const scale = isPointerRef.current ? 1.5 : 1
        const innerScale = isPointerRef.current ? 0.5 : 1

        outerRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%) scale(${scale})`
        innerRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%) scale(${innerScale})`
      }

      animationFrameId = requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY }

      const target = e.target as HTMLElement
      
      isPointerRef.current =
        window.getComputedStyle(target).cursor === "pointer" || target.tagName === "BUTTON" || target.tagName === "A"
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    animationFrameId = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <div
        ref={outerRef}
        className={`pointer-events-none fixed left-0 top-0 z-50 mix-blend-difference will-change-transform transition-opacity duration-200 ${
          isOverUI ? "opacity-0" : "opacity-100"
        }`}
        style={{ contain: "layout style paint" }}
      >
        <div className="h-4 w-4 rounded-full border-2 border-white" />
      </div>
      <div
        ref={innerRef}
        className={`pointer-events-none fixed left-0 top-0 z-50 mix-blend-difference will-change-transform transition-opacity duration-200 ${
          isOverUI ? "opacity-0" : "opacity-100"
        }`}
        style={{ contain: "layout style paint" }}
      >
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
    </>
  )
}
