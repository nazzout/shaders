# Shaders Landing Page

A single-page, horizontally-scrolling landing page with WebGL shader-based backgrounds that react to audio input. Built with Next.js 15, React 19, and TypeScript.

## Features

- **WebGL Shader System**: Audio-reactive shader effects using the `shaders` package
- **Horizontal Scroll Navigation**: Smooth section transitions with touch and wheel support
- **Audio Reactivity**: Real-time audio analysis with Web Audio API
- **Five Sections**: Hero, Work, Services, About, and Contact
- **Responsive Design**: Optimized for all devices with fallback for non-WebGL browsers

## Security Notice ⚠️

### CVE-2025-55182 (React2Shell) - Critical Vulnerability

This project has been patched to address **CVE-2025-55182**, a critical (CVSS 10.0) remote code execution vulnerability in React Server Components.

#### Required Versions

- **Next.js**: `15.5.9` or higher (15.5.x line)
- **React**: `19.2.3` or higher
- **React DOM**: `19.2.3` or higher

**Netlify will block deployments** using vulnerable versions of Next.js (< 15.5.9).

#### Verification

To verify your installation has the patched versions:

```bash
pnpm list next react react-dom
```

Expected output:
```
next 15.5.9
react 19.2.3
react-dom 19.2.3
```

### Updating Safely

This project includes `pnpm.overrides` in `package.json` to prevent accidental installation of vulnerable versions. To update dependencies:

```bash
# Update lockfile
pnpm install

# Verify no vulnerable versions were installed
pnpm list next react react-dom

# Build and test
pnpm build
pnpm start
```

**Never manually downgrade** `next`, `react`, or `react-dom` below the patched versions listed above.

## Development

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests with Vitest
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Generate test coverage report

## Deployment

### Netlify

This project is configured for deployment on Netlify using the `@netlify/plugin-nextjs` plugin.

#### Configuration

- Build command: `pnpm build`
- Publish directory: `.next`
- Node.js version: 18.17.0+

The `netlify.toml` file is pre-configured with the correct settings.

#### Security Requirements

Netlify enforces the following requirements:

1. **Next.js >= 15.5.9** - Versions below this will fail with HTTP 400 during deploy
2. **React >= 19.2.3** - Required for CVE-2025-55182 patch
3. Valid `pnpm-lock.yaml` - Lockfile must be committed with `package.json` changes

#### Deploy Steps

```bash
# 1. Ensure dependencies are up-to-date
pnpm install

# 2. Test build locally
pnpm build

# 3. Commit changes
git add package.json pnpm-lock.yaml netlify.toml
git commit -m "security: Patch CVE-2025-55182 (upgrade Next.js to 15.5.9)"

# 4. Push to trigger Netlify deployment
git push origin main
```

## Architecture

### Core Technologies

- **Next.js 15.5.9** - React framework with App Router
- **React 19.2.3** - UI library with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **pnpm** - Fast, disk-efficient package manager

### Key Dependencies

- `shaders@2.1.1` - WebGL shader components (Swirl, ChromaFlow)
- `@vercel/analytics` - Analytics integration
- `shadcn/ui` - Accessible component library
- `lucide-react` - Icon system

For complete dependency management and security overrides, see `package.json`.

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Main page with horizontal scroll
  globals.css         # Global styles

components/
  shader-background.tsx   # Audio-reactive WebGL shaders
  custom-cursor.tsx       # Custom cursor
  grain-overlay.tsx       # Film grain effect
  magnetic-button.tsx     # Interactive button
  sections/               # Page sections
  ui/                     # shadcn/ui components

hooks/
  use-audio.ts           # Audio capture and analysis
  use-mobile.ts          # Mobile detection
  use-reveal.ts          # Scroll reveal animations

lib/
  utils.ts              # Utility functions
```

## Audio System

The application can capture microphone input for audio-reactive visuals:

1. Click the audio toggle in the navigation
2. Grant microphone permission
3. Audio is analyzed in real-time (bass, mid, treble frequencies)
4. Shader parameters react to audio levels

When audio is disabled, the "chaos system" provides organic movement.

## Browser Support

- **Modern browsers** with WebGL support (Chrome, Firefox, Safari, Edge)
- **Fallback** to CSS gradients for browsers without WebGL
- **Mobile** optimized with touch gesture support

## Contributing

When contributing to this project:

1. Never downgrade `next`, `react`, or `react-dom` below patched versions
2. Always run `pnpm install` after pulling changes
3. Test builds locally with `pnpm build` before committing
4. Include lockfile changes with dependency updates

## License

Private project - All rights reserved

## References

- [Next.js Security Advisory CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)
- [React Security Advisory CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)
