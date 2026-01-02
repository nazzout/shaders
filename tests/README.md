# Chaos System Unit Tests

This directory contains comprehensive unit tests for the chaos system functionality.

## Test Coverage

### 1. ShaderSettingsProvider (`shader-settings-provider.test.tsx`)
Tests the `updateChaos` function in the ShaderSettingsProvider context:
- ✅ Correctly updates chaos `enabled` setting
- ✅ Correctly updates chaos `amount` setting
- ✅ Updates both `enabled` and `amount` simultaneously
- ✅ Persists chaos settings to localStorage
- ✅ Loads chaos settings from localStorage on mount
- ✅ Handles partial updates without losing other settings

### 2. NodalParticlesGradient (`nodal-particles-gradient.test.tsx`)
Tests chaos uniform passing to WebGL shader:
- ✅ Passes `chaosEnabled=false` (0.0) and `chaosAmount` uniforms when chaos is disabled
- ✅ Passes `chaosEnabled=true` (1.0) and `chaosAmount` uniforms when chaos is enabled
- ✅ Updates chaos uniforms when props change
- ✅ Correctly handles chaos amount edge cases (0 and 1)

### 3. WarpedGradientBackground (`warped-gradient-background.test.tsx`)
Tests chaos uniform passing to WebGL shader:
- ✅ Passes `chaosEnabled=false` (0.0) and `chaosAmount` uniforms when chaos is disabled
- ✅ Passes `chaosEnabled=true` (1.0) and `chaosAmount` uniforms when chaos is enabled
- ✅ Updates chaos uniforms when props change
- ✅ Correctly handles chaos amount edge cases (0 and 1)
- ✅ Passes all required uniforms including chaos parameters

### 4. ShaderBackground (`shader-background.test.tsx`)
Tests shader parameter modifications based on chaos settings:
- ✅ Does not apply chaos overdrive when chaos is disabled
- ✅ Applies chaos audio overdrive when chaos is enabled
- ✅ Modifies detail parameter based on chaos
- ✅ Modifies blend parameter based on chaos domain warp
- ✅ Modifies intensity parameter with chaos domain warp
- ✅ Modifies radius with chaos temporal offset
- ✅ Modifies positional drift with chaos drift offsets
- ✅ Scales chaos effects with chaosAmount
- ✅ Passes modified parameters to ChromaFlow component

### 5. ShaderSettingsPanel (`shader-settings-panel.test.tsx`)
Tests UI toggle and controls for chaos mode:
- ✅ Renders chaos mode toggle button when panel is open
- ✅ Does not render when panel is closed
- ✅ Shows chaos toggle in off state by default
- ✅ Calls `updateChaos` to enable chaos when toggle is clicked
- ✅ Calls `updateChaos` to disable chaos when toggle is clicked again
- ✅ Renders chaos amount slider
- ✅ Updates chaos amount when slider is changed
- ✅ Displays current chaos amount value
- ✅ Resets chaos settings when reset button is clicked
- ✅ Shows chaos description text
- ✅ Has correct slider min, max, and step attributes
- ✅ Maintains chaos state when other settings are changed
- ✅ Persists chaos settings to localStorage

## Running Tests

### Install Dependencies
First, install the testing dependencies:
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test --watch
```

### Run Tests with UI
```bash
pnpm test:ui
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Run Specific Test File
```bash
pnpm test shader-settings-provider.test
```

## Test Setup

The test environment is configured with:
- **Vitest**: Fast unit test framework
- **React Testing Library**: For testing React components
- **jsdom**: Browser environment simulation
- **@testing-library/jest-dom**: Custom matchers for DOM testing

### Mocks
The `setup.ts` file includes mocks for:
- `localStorage` (for settings persistence)
- `requestAnimationFrame` / `cancelAnimationFrame` (for animations)
- WebGL context (for shader testing)

## File Structure

```
tests/
├── README.md                           # This file
├── setup.ts                            # Test environment setup
├── shader-settings-provider.test.tsx   # Tests for updateChaos function
├── nodal-particles-gradient.test.tsx   # Tests for chaos uniforms in NodalParticlesGradient
├── warped-gradient-background.test.tsx # Tests for chaos uniforms in WarpedGradientBackground
├── shader-background.test.tsx          # Tests for chaos parameter modifications
└── shader-settings-panel.test.tsx      # Tests for chaos UI toggle
```

## Notes

- All tests use mocked WebGL contexts to avoid requiring actual GPU resources
- localStorage is mocked to test persistence behavior
- The `shaders/react` module is mocked in `shader-background.test.tsx` to test parameter passing without actual shader rendering
