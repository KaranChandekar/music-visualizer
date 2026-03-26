---
name: music-visualizer
description: Build an immersive music visualizer web app with real-time audio analysis, 3D frequency spectrum, particle systems that react to beats, and shader-based visual effects. Use this skill when building audio visualization, music players with visual effects, or creative audio-reactive experiences. Trigger when the user mentions music visualizer, audio visualization, frequency spectrum, beat detection, Web Audio API, sound reactive visuals, or audio-driven 3D animations.
---

# Music Visualizer Skill

Build an immersive, real-time music visualizer application with advanced audio analysis, 3D graphics, particle systems, and shader-based visual effects synchronized to audio playback.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **3D Graphics**: Three.js with React Three Fiber for declarative 3D scene management
- **Audio Processing**: Tone.js for audio playback + Web Audio API for real-time frequency analysis
- **Animation**: GSAP for timeline-based animations and Framer Motion for UI transitions
- **Styling**: Tailwind CSS with custom CSS for shaders
- **Language**: TypeScript for type safety

## Core Architecture

### Web Audio API Integration

The Web Audio API is the backbone of real-time audio analysis. Set up an AudioContext connected to the audio playback:

```typescript
// Create audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create analyser node for frequency data extraction
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048; // Frequency resolution (default: 1024, up to 32768)

// Connect audio source to analyser
const source = audioContext.createMediaElementAudioSource(audioElement);
source.connect(analyser);
analyser.connect(audioContext.destination);
```

**Key frequency analysis methods:**
- `getByteFrequencyData(array)`: Get frequency spectrum as 0-255 values
- `getTimeDomainData(array)`: Get raw waveform amplitude data
- Divide frequency bands into low (bass), mid, high for targeted visual reactions

### 3D Frequency Spectrum Bars

Create a real-time 3D frequency visualization with individual bars representing frequency bands:

- Generate 64 or 128 frequency bars arranged in a circle or grid layout
- Each bar's height maps directly to frequency amplitude from analyser data
- Use `useFrame()` hook in React Three Fiber to update bar positions every frame
- Apply smooth easing to height changes for fluid motion (GSAP's `gsap.to()` with duration 0.05)
- Implement height scaling with `Math.pow()` to amplify quieter frequencies
- Color each bar based on frequency range: red (bass), green (mids), blue (treble)
- Add glow effect using emissive material and bloom post-processing

### Particle System

Implement a dynamic 500+ particle system that reacts to audio energy:

- **Particle generation**: Pre-allocate 500 particles in a single BufferGeometry for performance
- **Position mapping**: Map particle positions to frequency bands - bass particles move up, mid particles expand outward, treble particles twirl
- **Color dynamics**: Hue shifts based on average frequency energy using `HSL(hue, saturation, lightness)`
- **Size animation**: Particle size pulses with energy in specific frequency ranges
- **Physics**: Apply gravity and damping for organic motion, reset particles periodically
- **Emitter**: Emit new particles from center on beat detection, with trajectory mapped to frequency distribution
- **Performance optimization**: Use InstancedMesh for thousands of particles rendered efficiently

### Beat Detection Algorithm

Detect music beats and trigger visual burst effects:

```typescript
// Compare current frequency energy to rolling average
const smoothingFactor = 0.98;
let rollingAverage = 0;

function detectBeat(frequencyData) {
  const energy = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
  rollingAverage = smoothingFactor * rollingAverage + (1 - smoothingFactor) * energy;

  const beatThreshold = 1.3; // Multiplier for energy spike
  if (energy > rollingAverage * beatThreshold) {
    triggerBeatEffect(); // Scale particles, emit burst, color flash
  }
}
```

**Beat effects:**
- Scale particle emitter radius outward, then contract
- Flash background shader brightness
- Trigger GSAP timeline with staggered animations
- Pulse album art or UI elements

### Shader-Based Background

Create a dynamic fragment shader that responds to audio levels:

```glsl
uniform float audioLevel;
uniform float time;
varying vec2 vUv;

void main() {
  vec3 color = mix(
    vec3(0.1, 0.2, 0.4), // Cool blue when quiet
    vec3(1.0, 0.3, 0.1), // Warm orange/red when loud
    audioLevel
  );

  // Add animated noise or wave distortion
  vec2 dist = sin(vUv * 10.0 + time) * 0.1;
  gl_FragColor = vec4(color + dist, 1.0);
}
```

**Features:**
- Update `audioLevel` uniform every frame with average frequency amplitude
- Implement color interpolation between cool (quiet) and warm (loud) palettes
- Add Perlin noise for organic, non-repetitive patterns
- Layer multiple noise functions for complexity
- Optional: Implement chromatic aberration or lens distortion

### Album Art Display

Display and animate album artwork synchronized to audio:

- Render album image in the center of 3D scene using a PlaneGeometry
- Add pulse animation tied to detected beats
- Scale: `1.0 + (beatEnergy * 0.15)` for subtle, responsive growth
- Rotation: Apply subtle spin based on playback progress
- Apply circular border and soft shadow using CSS or ShaderMaterial
- Fade in/out between tracks with Framer Motion

### Playlist Management UI

Build an interactive playlist with Framer Motion animations:

**Features:**
- Display current track with large artwork, title, artist, duration
- List upcoming tracks with drag-to-reorder using `Reorder` component
- Add/remove tracks with staggered list item reveal animation
- Current playing indicator with animated progress bar
- Queue preview with fade-in/fade-out on scroll

```typescript
<Reorder.Group values={playlist} onReorder={setPlaylist}>
  {playlist.map((track) => (
    <Reorder.Item key={track.id} value={track}>
      <motion.div layoutId={track.id}>
        {/* Track info */}
      </motion.div>
    </Reorder.Item>
  ))}
</Reorder.Group>
```

### Audio Controls

Implement essential audio playback controls:

**Play/Pause Button:**
- Toggle playback with visual state indicator
- Animated icon morph using Framer Motion (play ↔ pause)

**Volume Control:**
- Horizontal slider with visual feedback
- Display decibel level as text
- Mute button that shows/hides slider

**Seek Bar:**
- Show waveform preview of current track (sample audio data and draw canvas representation)
- Clickable timeline for seeking to any position
- Display current time and total duration
- Draggable progress indicator with smooth seeking

**Visualization Mode Selector:**
- Buttons to switch between modes: "Spectrum Bars", "Waveform", "Particles", "Combined"
- Smooth transition animations when switching modes

### Multiple Visualization Modes

Implement several visualization modes users can toggle:

**Mode 1: Frequency Spectrum**
- Classic bar visualization in circular or linear arrangement
- Height mapped to frequency amplitude
- Most responsive to bass and mids

**Mode 2: Waveform**
- Real-time oscilloscope-style waveform
- Plot time-domain data from analyser in 3D using LineGeometry
- Animate waveform spiral or 2D plot

**Mode 3: Particle Cloud**
- Pure particle system without frequency bars
- Particles fill entire 3D space, driven by global audio energy
- More abstract, less frequency-specific

**Mode 4: Combined**
- Blend all visualizations with partial opacity
- Frequency bars, waveform, and particle system all active
- Complex, immersive visual density

### Fullscreen Experience

Enable immersive fullscreen mode:

- Use Fullscreen API (`element.requestFullscreen()`)
- Hide all UI controls except visualization mode switcher and close button
- Apply cinematic fade transitions when entering/exiting fullscreen
- Scale visualizations to fill viewport
- Adjust particle count or shader complexity based on device performance

### Responsive Design

Optimize for mobile and tablet devices:

**Mobile Optimizations:**
- Reduce particle count from 500+ to 200-300 on mobile for performance
- Simplify shader effects: remove multiple noise layers, reduce bloom intensity
- Use lower FFT size (1024 instead of 2048) for faster analysis
- Stack UI controls vertically to fit narrow screens
- Use touch-friendly slider and button sizes (min 44px)
- Disable video background effects on low-end devices

**Tablet:**
- Intermediate particle count (300-400)
- Full feature set with slight complexity reduction
- Larger touch targets than desktop

**Breakpoints:**
```typescript
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 250 : 500;
const shaderComplexity = isMobile ? 1 : 2;
```

### Performance Optimization

Ensure smooth 60 FPS playback:

**requestAnimationFrame Loop:**
- Use Three.js renderer's built-in animation loop
- Separate frequency analysis from visual updates (can analyze every frame, render every 2-3 frames)

**Offscreen Canvas Analysis:**
- Optional: Run audio analysis in Web Worker for non-blocking processing
- Transfer frequency data via Transferable Objects for zero-copy performance

**Throttle UI Updates:**
- Update numeric displays (BPM, energy level) at lower frequency (30 FPS)
- Keep 3D visualization at 60 FPS
- Debounce window resize events

**Memory Management:**
- Pre-allocate all particle buffers and frequency arrays at app start
- Reuse TypedArrays for frequency data instead of creating new ones each frame
- Use `InstancedMesh` instead of individual geometries
- Implement garbage collection friendly patterns, avoid creating objects in tight loops

## Free Resources

- **Audio Tracks**: Pixabay Audio (royalty-free, high-quality music) at https://pixabay.com/music/
- **Shader Inspiration**: Shadertoy (https://www.shadertoy.com/) for GLSL fragment shader examples
- **Three.js Examples**: Official examples at https://threejs.org/examples/ for bloom, post-processing
- **Tone.js Documentation**: https://tonejs.org/ for audio synthesis and scheduling
- **Web Audio API Guide**: MDN Web Docs for comprehensive Web Audio API reference

## File Structure

```
04-music-visualizer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (main visualizer page)
│   └── api/
│       └── tracks/ (optional: serve track list)
├── components/
│   ├── Visualizer.tsx (Three.js scene wrapper)
│   ├── FrequencyBars.tsx (3D bar component)
│   ├── ParticleSystem.tsx (particle geometry)
│   ├── BackgroundShader.tsx (shader material)
│   ├── Controls.tsx (play, volume, seek)
│   ├── Playlist.tsx (track list)
│   └── AudioAnalyser.ts (Web Audio setup)
├── hooks/
│   ├── useAudioContext.ts (AudioContext management)
│   ├── useFrequencyData.ts (frequency extraction)
│   └── useBeatDetection.ts (beat detection logic)
├── lib/
│   ├── shaders/ (vertex and fragment shaders)
│   └── utils.ts (helper functions)
└── public/
    └── audio/ (sample tracks)
```

## Implementation Steps

1. **Set up Next.js project** with React Three Fiber and required dependencies
2. **Initialize Web Audio API** with AudioContext and AnalyserNode
3. **Build basic 3D scene** with Three.js and add lighting
4. **Implement frequency extraction** and create responsive frequency bars
5. **Add particle system** with buffer geometry for performance
6. **Develop beat detection** and trigger visual effects
7. **Create shader-based background** with color mapping to audio energy
8. **Build UI controls** for play/pause, volume, seeking, and visualization modes
9. **Implement playlist management** with Framer Motion animations
10. **Optimize for performance** and responsiveness across devices
11. **Add fullscreen mode** with cinematic transitions
12. **Test on mobile devices** and optimize particle/shader settings

## Advanced Features (Optional)

- **Microphone input mode**: Visualize live audio from device microphone
- **Audio file upload**: Allow users to upload MP3/WAV and visualize
- **Save visualization**: Capture visualizer output as video using MediaRecorder API
- **Multiple color themes**: Predefined palettes for different moods
- **Audio Metadata**: Extract and display ID3 tags from uploaded files
- **Keyboard shortcuts**: Spacebar to play/pause, arrow keys to seek, M for mute
