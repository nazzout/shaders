"use client"

import { useState, useCallback } from "react"
import { ModalContainer } from "./modal-container"
import { LauncherMain } from "./launcher-main"
import { ChromaModal } from "./modals/chroma-modal"
import { DistortionModal } from "./modals/distortion-modal"
import { MembraneModal } from "./modals/membrane-modal"
import { FieldLinesModal } from "./modals/field-lines-modal"
import { ColorwayModal } from "./modals/colorway-modal"
import type { ModalType } from "./types"

interface ShaderLauncherProps {
  isOpen: boolean
  onClose: () => void
}

export function ShaderLauncher({ isOpen, onClose }: ShaderLauncherProps) {
  const [currentModal, setCurrentModal] = useState<ModalType>('launcher')
  const [colorwaySection, setColorwaySection] = useState<'hero' | 'work' | 'services' | 'about' | 'contact'>('hero')
  const [modalResetFn, setModalResetFn] = useState<(() => void) | null>(null)

  // Handle modal navigation
  const openModal = useCallback((modal: ModalType, section?: 'hero' | 'work' | 'services' | 'about' | 'contact') => {
    if (modal === 'colorway' && section) {
      setColorwaySection(section)
    }
    setCurrentModal(modal)
  }, [])

  const closeAllModals = () => {
    setCurrentModal('launcher')
    onClose()
  }

  const backToLauncher = () => {
    setCurrentModal('launcher')
  }

  // Don't render anything if not open
  if (!isOpen) return null

  // Render launcher
  if (currentModal === 'launcher') {
    return (
      <ModalContainer
        isOpen={true}
        onClose={closeAllModals}
        isMobileLauncher={true}
      >
        <LauncherMain onOpenModal={openModal} onClose={closeAllModals} />
      </ModalContainer>
    )
  }

  // Render appropriate modal
  const modalTitles = {
    chroma: 'Chroma',
    distortion: 'Distortion',
    membrane: 'Membrane',
    fieldLines: 'Field Lines',
    colorway: 'Colorway',
  }

  const handleReset = () => {
    if (modalResetFn) {
      modalResetFn()
    }
  }

  const handleModalMount = (resetFn: () => void) => {
    setModalResetFn(() => resetFn)
  }

  const renderModalContent = () => {
    switch (currentModal) {
      case 'chroma':
        return <ChromaModal onMount={handleModalMount} />
      case 'distortion':
        return <DistortionModal onMount={handleModalMount} />
      case 'membrane':
        return <MembraneModal onMount={handleModalMount} />
      case 'fieldLines':
        return <FieldLinesModal onMount={handleModalMount} />
      case 'colorway':
        return <ColorwayModal section={colorwaySection} />
      default:
        return null
    }
  }

  return (
    <ModalContainer
      isOpen={true}
      onClose={backToLauncher}
      title={modalTitles[currentModal as keyof typeof modalTitles]}
      isMobileLauncher={false}
      onReset={handleReset}
    >
      {renderModalContent()}
    </ModalContainer>
  )
}
