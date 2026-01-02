# Accordion Behavior Implementation

## Overview
The shader settings panel now features an accordion UI with mutual exclusivity between effects.

## Key Features

### 1. Default State
- ✅ All effect menus (Chaos, Membrane, Nodal Particles) are **collapsed by default** on page load
- Panel content is hidden until toggled open

### 2. Accordion Behavior
- ✅ When an effect toggle is turned **ON**, its menu automatically **opens**
- ✅ Other non-Chaos effect menus automatically **close** when a new effect is enabled
- ✅ Chevron icon rotates to indicate open/closed state:
  - Down (▼) = Open
  - Right (▶) = Closed

### 3. Mutual Exclusivity
- ✅ **3D Membrane** and **Nodal Particles** are mutually exclusive
- When turning ON Membrane while Nodal Particles is ON:
  - Nodal Particles is automatically turned OFF
  - Nodal Particles menu closes
  - Membrane menu opens
- When turning ON Nodal Particles while Membrane is ON:
  - Membrane is automatically turned OFF
  - Membrane menu closes
  - Nodal Particles menu opens

### 4. Chaos Mode Special Rule
- ✅ **Chaos Mode can stack** with either Membrane OR Nodal Particles
- When Chaos Mode is turned ON:
  - Chaos menu opens and stays open
  - It is **not auto-closed** when other effects are toggled
- When Chaos Mode is turned OFF:
  - Chaos menu collapses

### 5. Manual Panel Control
- ✅ Users can manually collapse/expand panels by clicking the section header
- ✅ Panel open/closed state is separate from enabled/disabled state
- ✅ Toggling effects ON still enforces accordion rules even if panels are manually collapsed

## UI Changes

### Visual Indicators
1. **Chevron Icon**: Shows expand/collapse state
2. **Toggle Switch**: Shows enabled/disabled state (moved to header row)
3. **Color Coding**: 
   - Red toggle = Chaos enabled
   - Blue toggle = Membrane/Nodal Particles enabled
4. **Left Border**: Indented content with left border when panel is open

### Layout Updates
- Section headers are now clickable buttons with chevron icons
- Toggle switches moved to the right side of the header alongside Reset button
- Panel content has left indentation with a border when expanded
- All controls maintain the same functionality but with improved organization

## Implementation Details

### State Management
```typescript
const [openPanels, setOpenPanels] = useState({
  chaos: false,
  membrane: false,
  nodalParticles: false,
})
```

### Handler Functions

#### `handleChaosToggle()`
- Toggles chaos enabled state
- Opens/closes chaos panel based on new state
- Does not affect other panels

#### `handleMembraneToggle()`
- Toggles membrane enabled state
- If enabling: disables nodal particles, opens membrane, closes nodal particles
- If disabling: just closes membrane panel

#### `handleNodalParticlesToggle()`
- Toggles nodal particles enabled state
- If enabling: disables membrane, opens nodal particles, closes membrane
- If disabling: just closes nodal particles panel

#### `togglePanel()`
- Manually toggles panel open/closed state
- Independent of enabled/disabled state
- Used for chevron button clicks

## User Experience Flow

### Example 1: Enabling Membrane
1. User clicks Membrane toggle (currently OFF)
2. System checks if Nodal Particles is ON
3. If yes, Nodal Particles is turned OFF and its panel closes
4. Membrane is turned ON and its panel opens
5. Chaos stays in its current state (open if enabled, closed if disabled)

### Example 2: Enabling Chaos
1. User clicks Chaos toggle (currently OFF)
2. Chaos is turned ON and its panel opens
3. Current effect (Membrane or Nodal Particles) stays enabled and open
4. Both panels are now visible simultaneously

### Example 3: Manual Panel Collapse
1. User has Membrane enabled and panel open
2. User clicks Membrane header (chevron)
3. Membrane panel collapses but remains enabled
4. User enables Nodal Particles
5. System disables Membrane and opens Nodal Particles panel
6. Membrane panel stays collapsed (as it should, since it's now disabled)

## Testing the Feature

1. Open the shader settings panel
2. Verify all sections are collapsed by default
3. Toggle Membrane ON → should open Membrane panel
4. Toggle Nodal Particles ON → should disable Membrane, close its panel, and open Nodal Particles panel
5. Toggle Chaos ON → should open Chaos panel while keeping Nodal Particles open
6. Toggle Nodal Particles OFF → should close its panel, Chaos panel remains open
7. Click section headers to manually collapse/expand panels
8. Verify toggling effects still works correctly with manually collapsed panels

## Files Modified

- `components/shader-settings-panel.tsx` - Complete accordion implementation with mutual exclusivity logic

## Dependencies Added

- `ChevronDown` icon from `lucide-react` (chevron indicator for accordion)
