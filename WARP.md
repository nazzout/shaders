# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# Start development server (default: http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Package Management
This project uses **pnpm** for dependency management. Use `pnpm install` to install dependencies, not npm or yarn.

## Architecture Overview

### Core Concept
This is a **single-page, horizontally-scrolling landing page** with WebGL shader-based backgrounds that react to audio input. The page features five sections (Hero, Work, Services, About, Contact) that scroll horizontally with color-themed shader transitions.

### Key Technical Features

#### 1. WebGL Shader System
- Uses the `shaders` npm package (v2.1.1) with two primary shader components:
  - **Swirl**: Creates the primary animated swirl effect with audio-reactive parameters
  - **ChromaFlow**: Adds chromatic aberration and flow effects layered on top
- Each section has its own color scheme defined in `shader-background.tsx`
- Graceful fallback to CSS gradient background when WebGL is unsupported
- Shader is dynamically imported with SSR disabled for client-side only rendering

#### 2. Audio Reactivity
- `use-audio` hook captures microphone input via Web Audio API
- Audio data is analyzed into four frequency bands: volume, bass, mid, treble
- These values modulate shader parameters (speed, detail, blend, intensity, radius, momentum)
- "Chaos system" adds organic drift to parameters when audio energy is low, creating continuous movement even without audio input

#### 3. Scroll Architecture
- Horizontal scroll implemented via `overflow-x-auto` on a flex container
- Custom wheel event handler converts vertical mouse wheel to horizontal scroll
- Touch gestures (swipe up/down) also trigger horizontal section navigation
- `currentSection` state (0-4) drives both UI state and shader color transitions
- Scroll behavior is throttled using `requestAnimationFrame`

### Project Structure

```
app/
  layout.tsx          # Root layout with metadata and Analytics
  page.tsx            # Main page with scroll logic, audio controls, and section rendering
  globals.css         # Global styles and Tailwind setup

components/
  shader-background.tsx   # WebGL shader wrapper with audio-reactive parameters
  custom-cursor.tsx       # Custom cursor component
  grain-overlay.tsx       # Film grain effect overlay
  magnetic-button.tsx     # Interactive button with magnetic effect
  sections/               # Individual page sections (work, services, about, contact)
  ui/                     # shadcn/ui components

hooks/
  use-audio.ts           # Audio capture and frequency analysis
  use-mobile.ts          # Mobile device detection
  use-reveal.ts          # Scroll reveal animations
  use-toast.ts           # Toast notifications

lib/
  utils.ts              # Utility functions (cn for className merging)
```

### Styling System
- **Tailwind CSS v4** with PostCSS
- **shadcn/ui** components (New York style variant)
- Path aliases configured: `@/` maps to project root
- Custom CSS variables for theming in `globals.css`
- `cn()` utility combines clsx and tailwind-merge for conditional classes

### Build Configuration
- **Next.js 15** with App Router
- TypeScript strict mode enabled
- ESLint and TypeScript errors ignored during builds (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`)
- Images are unoptimized (`unoptimized: true`)
- Vercel Analytics integrated

## Development Guidelines

### Working with Shaders
- Shader parameters are defined in `shader-background.tsx` with audio-reactive modulation
- Color schemes are section-specific arrays - modify `colorSchemes` to change section colors
- The "chaos system" prevents static visuals when audio is off - adjust `chaosStrength` calculation to modify this behavior
- Always test shader changes with both audio enabled and disabled

### Adding Sections
1. Create new section component in `components/sections/`
2. Add section to horizontal scroll container in `app/page.tsx`
3. Add corresponding color scheme to `colorSchemes` array in `shader-background.tsx`
4. Update section count validation (currently hardcoded to 0-4 range)

### Audio System
- Audio permission must be granted by user (toggle in nav bar)
- Frequency band splits are configurable in `use-audio.ts` (currently: bass 0-10%, mid 10-50%, treble 50-100%)
- Audio analysis runs on `requestAnimationFrame` loop when enabled

### WebGL Fallback
- Always check `webGLSupported` state before rendering shader components
- Fallback gradient defined inline in `app/page.tsx` should visually match shader aesthetic
- Test on devices/browsers without WebGL support

### Performance Considerations
- Shader components use `ssr: false` dynamic imports to prevent server-side rendering
- Scroll event handlers are throttled with `requestAnimationFrame`
- Container uses `contain: strict` for rendering optimization
- Loading states prevent FOUC (Flash of Unstyled Content)
