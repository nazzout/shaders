# Nodal Particles Implementation Notes

## Overview
GPU-based particle system constrained to Chladni/cymatics nodal patterns. Particles align to nodal lines and flow along the field, while the same field manipulates the gradient through domain warping and lighting effects.

## Chladni Nodal Field Computation

### Location
`components/nodal-particles-gradient.tsx` - `chladniField()` function (lines 79-95)

### Formula
```glsl
// Centered coordinates
p = (uv - 0.5) * 2.0

// Time-varying mode numbers
n = 3.0 + sin(time * 0.2) * 1.0
m = 4.0 + cos(time * 0.15) * 1.0

// Chladni equation
chladni = sin(π*n*x)*sin(π*m*y) + sin(π*m*x)*sin(π*n*y)

// Audio modulation
chladni += audioBass * 0.3 * sin(time * 2.0)
```

### Nodal Mask
Converts field value to "on line" intensity:
```glsl
lineWidth = 0.08 + audioTransient * 0.05
nodalMask = 1 - smoothstep(0, lineWidth, abs(chladni))
```
- Returns 1.0 on nodal lines (where chladni ≈ 0)
- Returns 0.0 away from lines
- Line width expands with audio transients

## Particle System

### GPU Fragment-Based Approach (lines 131-172)
**Why**: Mobile-optimized, no geometry buffers needed, simple implementation

### Grid-Based Spawning
```glsl
gridSize = 40 * (0.5 + density * 1.5)  // 20-100 cells per axis
grid = floor(uv * gridSize)
```
- Particle count: ~400-10,000 depending on density slider
- Each grid cell can spawn one particle
- Seed-based culling: `if (seed > density) return 0.0`

### Nodal Line Constraint
```glsl
nodalMask = getNodalMask(gridCenter, time)
if (nodalMask < 0.3) return 0.0  // Cull particles far from lines
```
Particles only render where nodalMask > 0.3

### Particle Drift (lines 150-154)
Particles flow along nodal lines using field gradient:
```glsl
gradient = fieldGradient(gridCenter, time)  // dH/dx, dH/dy
flow = normalize(vec2(-gradient.y, gradient.x))  // Perpendicular = tangent to line
offset = flow * drift * sin(time * 0.5 + phase) * 0.3
```
- Perpendicular to gradient = tangent to nodal line
- Phase-shifted sine wave creates back-and-forth "crawl"
- Drift slider controls amplitude

### Particle Rendering
```glsl
radius = 0.02 + size * 0.08
radius *= (0.7 + nodalMask * 0.3)  // Size varies with field
particle = 1 - smoothstep(radius * 0.5, radius, dist)  // Soft falloff
particle *= nodalMask  // Fade with field strength
particle *= 1 + audioTransient * 2.0  // Audio bursts
```

## Gradient Integration

### Location
`sampleGradient()` function (lines 175-215)

### Domain Warping (lines 195-203)
**NOT an overlay** - the gradient itself bends:
```glsl
nodalMask = getNodalMask(uv, time)
gradient = fieldGradient(uv, time)

// Warp UV perpendicular to field gradient (along nodal lines)
warp = vec2(-gradient.y, gradient.x) * nodalMask * influence * 0.1
warpedUV = uv + warp

// Re-sample gradient at warped position
baseGradient = mix(colorA, colorB, radial(warpedUV))
```

### Lighting/Glow (lines 205-207)
```glsl
glow = nodalMask * influence * 0.4
baseGradient += baseGradient * glow  // Self-illumination on lines
```

### Saturation Boost (lines 209-212)
```glsl
saturation = 1.0 + nodalMask * influence * 0.5
gray = dot(baseGradient, vec3(0.299, 0.587, 0.114))
baseGradient = mix(gray, baseGradient, saturation)
```
Colors "pop" more along nodal lines

## Audio Integration

### Bass (line 92)
Modulates Chladni field directly:
```glsl
chladni += audioBass * 0.3 * sin(time * 2.0)
```
Changes nodal pattern shape dynamically

### Transients (lines 100, 169)
- Widens nodal lines: `lineWidth = 0.08 + audioTransient * 0.05`
- Particle intensity bursts: `particle *= 1 + audioTransient * 2.0`

### Energy
General modulation strength (passed to shader but can be expanded)

## Controls → Uniforms Mapping

| UI Control | Uniform | Effect |
|------------|---------|--------|
| **Toggle** | - | Switches to `NodalParticlesGradient` component |
| **Density** | `u_density` | Particle count (0.5-2.0× multiplier on gridSize) |
| **Size** | `u_size` | Particle radius (0.02-0.10) |
| **Drift** | `u_drift` | Flow amplitude along lines |
| **Influence** | `u_influence` | Gradient warp + glow strength |

## Performance Notes

### Mobile Optimized
- **No branching**: All `if` statements return early (compiler-friendly)
- **Fixed particle count**: Grid-based, deterministic
- **Per-fragment evaluation**: No geometry buffers or feedback textures
- **Particle budget**: ~400-10k depending on density
- **Cheap advection**: Single gradient computation per particle, no integration

### Computation Cost
Per frame:
- Chladni field: ~6 sin/cos calls per pixel
- Field gradient: 3 field evaluations (finite differences)
- Particles: Grid lookup + distance check
- Total: <20 texture-equivalent samples per pixel

## Technical Trade-offs

### Why fragment-based particles?
✅ Simple, mobile-friendly  
✅ No ping-pong buffers or state management  
✅ Deterministic (same pattern every frame)  
✅ Stable particle count

❌ Can't do complex physics or trails  
❌ Particles reset every frame (no persistence)

### Why grid-based spawning?
✅ Uniform distribution  
✅ Density control via seed culling  
✅ Predictable performance

❌ Not as "organic" as true random distribution

## Integration with Other Modes

### Independence
Nodal Particles is **separate** from Membrane mode:
- Each has its own toggle
- Can theoretically be combined (priority: Nodal > Membrane > Default)
- Settings persist independently

### Render Priority (page.tsx lines 248-264)
```typescript
if (nodalParticles.enabled) {
  <NodalParticlesGradient />
} else if (membrane.enabled) {
  <WarpedGradientBackground />
} else {
  <ShaderBackground />  // Original
}
```

## Future Enhancements

Possible additions:
1. **Particle trails**: Ping-pong position buffer for history
2. **Color variation**: Per-particle hue shift
3. **More Chladni modes**: User-selectable (n,m) values
4. **Interaction**: Mouse/touch attracts or repels particles
5. **Reaction-diffusion**: Combine with RD patterns
