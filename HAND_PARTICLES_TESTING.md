# Hand-Controlled Particles - Testing Guide

## Overview
The Hand-Controlled Particles feature uses your webcam and MediaPipe Hands to track hand movements and control a Three.js particle system that overlays the shader background.

## Prerequisites
- **Camera**: Working webcam
- **Browser**: Modern browser with camera support (Chrome, Firefox, Safari, Edge)
- **HTTPS**: Required on mobile (localhost is exempt)
- **Permissions**: Camera access must be granted

## Starting the Application

```bash
pnpm dev
```

Navigate to `http://localhost:3000`

## Testing Checklist

### ✅ Basic Toggle Functionality

1. **Open Settings Panel**
   - Click the floating settings button (bottom right)
   - Settings panel should slide in from the right

2. **Find Hand-Controlled Particles Section**
   - Scroll down in settings panel
   - Look for "Hand-Controlled Particles" section
   - Should be collapsed by default with toggle switch OFF (gray)

3. **Toggle ON**
   - Click the toggle switch
   - Toggle should turn GREEN
   - Section should expand automatically
   - Should show:
     - Description text
     - Camera controls (in gray box)
     - Three sliders (Particle Count, Particle Size, Response Speed)

4. **Toggle OFF**
   - Click toggle switch again
   - Toggle should turn GRAY
   - Section should collapse
   - If camera was active, it should stop (indicator light turns off)

### ✅ Camera Functionality

1. **Start Camera (Desktop)**
   - Toggle Hand-Controlled Particles ON
   - Click "Start Camera" button
   - Browser should request camera permission
   - Grant permission
   - Status should change to "Camera On"
   - "Start Camera" button should change to red "Stop Camera" button

2. **Hand Detection**
   - Hold your hand(s) in front of the camera
   - "Hands Detected" count should update:
     - 0 = No hands visible
     - 1 = One hand visible
     - 2 = Two hands visible
   - Particles should appear when hands are detected

3. **Stop Camera**
   - Click red "Stop Camera" button
   - Status should change to "Camera Off"
   - Hands Detected should reset to 0
   - Particles should disappear
   - Browser camera indicator light should turn off

### ✅ Particle Behavior

1. **No Hands (Idle State)**
   - Start camera with no hands visible
   - Particles should gently orbit in center of screen
   - Smooth, slow animation

2. **One Hand**
   - Show one hand to camera
   - Particles should orbit around your hand position
   - Move hand left/right/up/down
   - Particles should follow smoothly

3. **Two Hands**
   - Show both hands to camera
   - Particles should split into two groups
   - Each group orbits one hand
   - Move hands independently to see groups follow

4. **Hand Expansion**
   - Show two hands close together
   - Slowly move hands apart
   - Particle orbit radius should increase
   - Bring hands together
   - Particle orbit radius should decrease

### ✅ Particle Settings

1. **Particle Count Slider**
   - Adjust slider from 0 to 1
   - Lower values = fewer particles (better performance)
   - Higher values = more particles (more visual density)
   - Changes should be visible immediately

2. **Particle Size Slider**
   - Adjust slider from 0 to 1
   - Lower values = smaller particles
   - Higher values = larger particles
   - Changes should be visible immediately

3. **Response Speed Slider**
   - Adjust slider from 0 to 1
   - Lower values = slower, smoother movement
   - Higher values = faster, more responsive movement
   - Move your hand to feel the difference

### ✅ Color Integration

1. **Color Inheritance**
   - With particles active, scroll to "Colorways" section
   - Change any color (Swirl A, Swirl B, or Chroma Base)
   - Particles should update to use new colors immediately
   - Particle colors should create a gradient between the three colors

2. **Section Colors**
   - Scroll horizontally through the page sections (01-05)
   - Each section has different colors
   - Particles should update to match section colors
   - Smooth color transitions

### ✅ Compatibility with Other Effects

Test particles work alongside existing features:

1. **Base Gradient Mode**
   - Particles ON + all effects OFF
   - Should see particles over base gradient
   - ✓ Works

2. **3D Membrane Effect**
   - Enable "3D Membrane Effect"
   - Enable "Hand-Controlled Particles"
   - Should see particles over membrane shader
   - ✓ Works

3. **Nodal Particles Effect**
   - Enable "Nodal Particles" gradient
   - Enable "Hand-Controlled Particles"
   - Should see hand particles over nodal gradient
   - ✓ Works

4. **Chaos Mode**
   - Enable "Chaos Mode"
   - Enable "Hand-Controlled Particles"
   - Background becomes chaotic
   - Hand particles still respond normally
   - ✓ Works

5. **Turbulence**
   - Enable "Turbulence"
   - Enable "Hand-Controlled Particles"
   - Background warps
   - Hand particles still respond normally
   - ✓ Works

6. **Cursor Strength**
   - Adjust "Cursor Strength" slider
   - Hand particles are independent
   - Should not affect particle behavior
   - ✓ Works

### ✅ Settings Persistence

1. **Save Settings**
   - Toggle particles ON
   - Adjust sliders to specific values
   - Note the values
   - Refresh the page (⌘+R / Ctrl+R)
   - Open settings panel
   - Hand particles should still be ON
   - Slider values should be preserved

2. **Camera State**
   - Camera state does NOT persist (always starts OFF)
   - This is intentional for privacy
   - Must click "Start Camera" after each page load

### ✅ Reset Functionality

1. **Section Reset**
   - Adjust all three sliders
   - Toggle particles ON
   - Click "Reset" button (next to toggle)
   - Should reset to defaults:
     - enabled: false
     - particleCount: 0.6
     - particleSize: 0.5
     - responseSpeed: 0.7
   - Camera should stop if active

2. **Global Reset**
   - Adjust multiple settings across panel
   - Click global "Reset to defaults" button (top right)
   - All settings including hand particles should reset
   - Camera should stop if active

### ✅ Error Handling

1. **Camera Permission Denied**
   - Toggle ON
   - Click "Start Camera"
   - Deny permission when browser asks
   - Should show error message in red box
   - "Camera permission denied. Please allow camera access in your browser settings."

2. **No Camera Available**
   - Test on device without camera (if possible)
   - Should show error: "No camera found. Please connect a camera and try again."

3. **Mobile HTTPS Check**
   - On mobile (iPhone/iPad), access via HTTP (not localhost)
   - Toggle ON
   - Click "Start Camera"
   - Should show error about HTTPS requirement
   - "Camera access requires HTTPS on mobile devices."

### ✅ Performance Testing

1. **Particle Count Impact**
   - Set Particle Count to 1.0 (maximum)
   - Check frame rate (should be smooth 60fps on desktop)
   - If choppy, reduce particle count

2. **Mobile Performance**
   - Test on mobile device
   - Start with Particle Count at 0.6
   - Adjust down if performance is poor
   - Should maintain 30-60fps

3. **Memory Leaks**
   - Toggle particles ON/OFF multiple times
   - Start/stop camera multiple times
   - Check browser memory usage (should not grow)
   - Camera indicator should turn off when stopped

### ✅ Cleanup & Navigation

1. **Toggle Off Cleanup**
   - Start camera
   - Toggle particles OFF
   - Camera should stop immediately
   - Webcam indicator light should turn off

2. **Navigation Cleanup**
   - Start camera with particles active
   - Navigate to different URL or close tab
   - Camera should stop
   - No memory leaks

3. **Settings Panel Close**
   - Camera should keep running when panel closes
   - Particles should keep working
   - Re-open panel to see camera status

## Known Limitations

- **Browser Support**: Safari on iOS requires iOS 14.3+ for MediaPipe
- **Performance**: Maximum ~1000 particles (adjustable via slider)
- **Hand Detection**: Works best with good lighting
- **HTTPS**: Required on mobile devices (except localhost)
- **Privacy**: Camera stream is processed locally, nothing sent to server

## Troubleshooting

### Particles Not Appearing
- Check "Hands Detected" count - must be > 0
- Ensure hands are visible to camera
- Check lighting (MediaPipe needs good lighting)
- Try increasing Particle Size slider

### Camera Won't Start
- Check browser permissions (Camera allowed?)
- Try HTTPS if on mobile
- Check if another app is using camera
- Try refreshing page

### Slow Performance
- Reduce Particle Count slider
- Close other browser tabs
- Check CPU usage
- Try disabling other effects (Chaos, Turbulence)

### Colors Not Updating
- Colors should update immediately when changed
- If not, try toggling particles OFF then ON
- Check if particles are actually visible (Hands Detected > 0)

## Success Criteria

✅ All checklist items pass
✅ Camera starts/stops reliably  
✅ Hands detected accurately (0-2)
✅ Particles follow hand movements smoothly
✅ Colors update in real-time
✅ Works with all existing shader modes
✅ Settings persist across page reloads
✅ No memory leaks or performance issues
✅ Clean camera cleanup on toggle off

## Reporting Issues

If you find any bugs, note:
1. Browser & version
2. Device (desktop/mobile)
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (F12 → Console tab)
