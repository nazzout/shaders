export type ModalType = 
  | 'launcher'
  | 'chroma'
  | 'distortion'
  | 'membrane'
  | 'fieldLines'
  | 'colorway'
  | null

export interface ColorwayModalProps {
  section: 'hero' | 'work' | 'services' | 'about' | 'contact'
}
