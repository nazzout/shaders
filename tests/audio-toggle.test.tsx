import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'

// Mock the use-audio hook
const mockEnableAudio = vi.fn()
const mockDisableAudio = vi.fn()
const mockAudioData = {
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  isActive: false,
  transient: 0,
  fftEnergy: 0,
  spectralCentroid: 0,
}

vi.mock('@/hooks/use-audio', () => ({
  useAudio: () => ({
    audioData: mockAudioData,
    isEnabled: mockIsEnabled,
    enableAudio: mockEnableAudio,
    disableAudio: mockDisableAudio,
  }),
}))

let mockIsEnabled = false

// Test the handleAudioToggle logic in isolation
const useHandleAudioToggle = (isEnabled: boolean, enableAudio: () => Promise<boolean>, disableAudio: () => void) => {
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
  
  return { audioError, handleAudioToggle }
}

describe('handleAudioToggle', () => {
  let originalLocation: Location

  beforeEach(() => {
    vi.clearAllMocks()
    originalLocation = window.location
    mockEnableAudio.mockReset()
    mockDisableAudio.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
    vi.useRealTimers()
  })

  it('correctly enables audio when disabled', async () => {
    mockEnableAudio.mockResolvedValue(true)
    
    const { result } = renderHook(() => useHandleAudioToggle(false, mockEnableAudio, mockDisableAudio))
    
    await act(async () => {
      await result.current.handleAudioToggle()
    })
    
    expect(mockEnableAudio).toHaveBeenCalledTimes(1)
    expect(mockDisableAudio).not.toHaveBeenCalled()
    expect(result.current.audioError).toBeNull()
  })

  it('correctly disables audio when enabled', async () => {
    const { result } = renderHook(() => useHandleAudioToggle(true, mockEnableAudio, mockDisableAudio))
    
    await act(async () => {
      await result.current.handleAudioToggle()
    })
    
    expect(mockDisableAudio).toHaveBeenCalledTimes(1)
    expect(mockEnableAudio).not.toHaveBeenCalled()
    expect(result.current.audioError).toBeNull()
  })

  it('sets the correct error message for HTTP on mobile when audio access fails', async () => {
    delete (window as any).location
    window.location = {
      ...originalLocation,
      protocol: 'http:',
      hostname: 'example.com',
    } as Location

    mockEnableAudio.mockResolvedValue(false)
    
    const { result } = renderHook(() => useHandleAudioToggle(false, mockEnableAudio, mockDisableAudio))
    
    await act(async () => {
      await result.current.handleAudioToggle()
    })
    
    expect(mockEnableAudio).toHaveBeenCalledTimes(1)
    expect(result.current.audioError).toBe('Microphone access requires HTTPS on mobile devices. Please use localhost or a secure connection.')
  })

  it('sets the correct error message for general microphone access issues when audio access fails', async () => {
    delete (window as any).location
    window.location = {
      ...originalLocation,
      protocol: 'https:',
      hostname: 'example.com',
    } as Location

    mockEnableAudio.mockResolvedValue(false)
    
    const { result } = renderHook(() => useHandleAudioToggle(false, mockEnableAudio, mockDisableAudio))
    
    await act(async () => {
      await result.current.handleAudioToggle()
    })
    
    expect(mockEnableAudio).toHaveBeenCalledTimes(1)
    expect(result.current.audioError).toBe('Could not access microphone. Please check permissions in your browser settings.')
  })

  it('clears error message after 5 seconds', async () => {
    delete (window as any).location
    window.location = {
      ...originalLocation,
      protocol: 'https:',
      hostname: 'example.com',
    } as Location

    mockEnableAudio.mockResolvedValue(false)
    
    const { result } = renderHook(() => useHandleAudioToggle(false, mockEnableAudio, mockDisableAudio))
    
    await act(async () => {
      await result.current.handleAudioToggle()
    })
    
    expect(result.current.audioError).toBe('Could not access microphone. Please check permissions in your browser settings.')
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    
    expect(result.current.audioError).toBeNull()
  })
})
