# 3D Membrane/Portal Shader Implementation

## Overview
Added a WebGL-based 3D membrane effect that creates the illusion of a vibrating portal surface using heightmap displacement and real-time lighting calculations.

## Uniforms & Control Flow

### User Controls (Sliders in Settings Panel)
Located in `components/shader-settings-panel.tsx`:

1. **Depth (u_depth)** - Range: 0.0 to 1.0
   - Controls displacement intensity of the height field
   - Scales lighting effects (diffuse, specular, rim lighting)
   - Higher values = more pronounced 3D effect
   - Default: 0.3

2. **Ripple (u_ripple)** - Range: 0.0 to 1.0
   - Controls circular wave amplitude and frequency
   - Modulates wave frequency (8-20 Hz range)
   - Higher values = stronger, more visible ripples
   - Default: 0.5

### Audio Integration
Audio data flows from `use-audio.ts` → `page.tsx` → `membrane-shader.tsx`:

- **u_audioEnergy**: FFT energy (0-1) modulates ripple speed (2-5× multiplier)
- **u_audioTransient**: Beat detection (0-1) creates pulse waves from center

### State Management
- Settings stored in `ShaderSettingsProvider` context
- Persists to localStorage under key "shader-settings"
- Real-time updates via `updateMembrane()` function
- Slider changes immediately update uniforms in animation loop

## Height Field Computation

### Formula (in `getHeight()`)
```glsl
height = (waves + waves2 + pulse + organicMotion) * u_depth

where:
  waves     = sin(distance * waveFreq - time * waveSpeed) * waveAmp
  waves2    = sin(distance * waveFreq * 0.6 - time * waveSpeed * 0.8) * waveAmp * 0.5
  pulse     = exp(-distance * 5.0) * u_audioTransient * 0.4
  organicMotion = noise(uv * 3.0 + time * 0.5) * 0.15
```

### Components
1. **Primary Circular Waves**: Radial sine waves emanating from center
2. **Secondary Waves**: Lower frequency layer at 0.6× speed for complexity
3. **Transient Pulses**: Exponential falloff creates sharp beats from center
4. **Noise**: Perlin-like noise adds organic, non-uniform motion

## Normal Calculation

### Finite Difference Method (in `getNormal()`)
```glsl
// Sample height at 3 points (center, +x, +y)
h  = getHeight(uv, time)
hx = getHeight(uv + vec2(eps, 0), time)
hy = getHeight(uv + vec2(0, eps), time)

// Compute gradients
dx = (hx - h) / eps
dy = (hy - h) / eps

// Construct normal
normal = normalize(vec3(-dx * 2.0, -dy * 2.0, 1.0))
```

**Epsilon**: 0.005 (sampling distance for derivatives)
**Gradient scale**: 2.0× amplifies surface tilt for stronger lighting

## Lighting Model

### Three-Component Lighting

1. **Diffuse (Lambertian)**
   ```glsl
   diffuse = max(dot(normal, lightDir), 0.0)
   diffuse = mix(0.5, diffuse, u_depth)  // Less lighting when depth low
   ```

2. **Specular (Blinn-Phong)**
   ```glsl
   halfDir = normalize(lightDir + viewDir)
   specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * u_depth
   ```
   - Shininess: 32 (tight highlights)
   - Scales with depth for subtle effect

3. **Rim Lighting (Fresnel-like)**
   ```glsl
   rim = pow(1.0 - abs(dot(normal, viewDir)), 3.0) * u_depth * 0.4
   ```
   - Creates portal glow around edges
   - Cubic falloff (power of 3)

### Additional Effects
- **Ambient Occlusion**: `ao = 1.0 - abs(height) * 0.3` (darkens peaks/valleys)
- **Portal Tint**: Blue-purple color (0.4, 0.5, 1.0) at 30% strength when depth > 0
- **Depth Darkening**: `1.0 - height * u_depth * 0.5` adds contrast

## Rendering & Blending

### WebGL Setup
- **Blend mode**: `gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)`
- **CSS mix-blend-mode**: `screen` for additive overlay
- **Alpha calculation**: `u_depth * 0.4 + 0.1` (10-50% opacity)
- **Layer order**: Membrane rendered AFTER base shader, BEFORE dark overlay

### Performance
- Single fullscreen quad (4 vertices, TRIANGLE_STRIP)
- ~9 texture samples per pixel (height + 2 derivatives at 3 points each)
- No branching in fragment shader
- Mobile-optimized: medium precision floats, simple noise

## File Structure

### New Files
- `components/membrane-shader.tsx` - WebGL shader component
- `components/shader-settings-provider.tsx` - Updated with membrane state
- `MEMBRANE_SHADER_NOTES.md` - This document

### Modified Files
- `app/page.tsx` - Added MembraneShader component integration
- `components/shader-settings-panel.tsx` - Added Depth/Ripple sliders

## Usage

1. Open settings panel (gear icon bottom-right)
2. Adjust "Depth" slider (0-1) to control 3D intensity
3. Adjust "Ripple" slider (0-1) to control wave strength
4. Enable audio for reactive speed/pulses
5. Settings auto-save to localStorage

## Technical Notes

- **Why screen blend mode?** Adds highlights without darkening, creates portal glow
- **Why finite differences?** More accurate than analytical derivatives for complex height functions
- **Why no geometry?** Fragment shader displacement is faster and more flexible than vertex deformation
- **Audio integration**: Uses existing FFT energy and transient detection from enhanced audio system
