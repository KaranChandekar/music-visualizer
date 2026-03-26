# Music Visualizer - Claude Code Prompt

Build a complete immersive music visualizer web application with real-time audio analysis, interactive 3D frequency visualizations, particle systems that react to beats, and shader-based visual effects. The visualizer should sync perfectly with audio playback and provide multiple visualization modes.

## Core Requirements

### Tech Stack Setup
- Initialize Next.js 15 with TypeScript
- Install and configure: Three.js, React Three Fiber, Tone.js, GSAP, Framer Motion, Tailwind CSS
- Set up Web Audio API with AudioContext and AnalyserNode for real-time frequency analysis

### Audio Playback and Analysis
- Integrate Tone.js for reliable audio playback across browsers
- Set up Web Audio API AnalyserNode with FFT size of 2048
- Implement frequency data extraction with `getByteFrequencyData()`
- Implement time-domain data extraction with `getTimeDomainData()`
- Divide audio spectrum into 64 frequency bands (bass, mid, treble ranges)

### 3D Frequency Spectrum Visualization
- Create 64 individual bars arranged in a circular formation around center
- Map bar height directly to frequency amplitude (0-255 scale)
- Apply smooth easing to bar height changes using GSAP (duration: 0.05s)
- Color bars by frequency range: red for bass, green for mids, blue for treble
- Add emissive material and bloom post-processing for glow effect
- Update bar positions every frame in `useFrame()` hook

### Particle System
- Pre-allocate 500+ particles in single BufferGeometry for performance
- Map particles to different frequency bands (bass particles move vertically, mid expand outward, treble spiral)
- Color particles based on frequency energy using HSL color space
- Apply gravity, damping, and periodic reset for organic motion
- Emit new particles on beat detection with trajectories mapped to frequency distribution
- Use InstancedMesh for efficient rendering of thousands of particles

### Beat Detection
- Calculate rolling average of frequency energy over time
- Compare current energy to rolling average (multiplier: 1.3x)
- Trigger visual effects when beat is detected:
  - Scale particle emitter outward then contract
  - Flash background shader to bright colors
  - Pulse album art and UI elements with GSAP animations

### Shader-Based Background
- Create dynamic fragment shader responding to real-time audio levels
- Map audio level (0-1) to color interpolation (cool blue when quiet, warm orange when loud)
- Add Perlin noise layers for organic, non-repetitive patterns
- Implement optional chromatic aberration or lens distortion effects
- Update shader uniforms every frame with average frequency amplitude

### Visualization Modes
Implement switchable visualization modes:
1. **Spectrum Bars** - Classic frequency bars (default)
2. **Waveform** - Oscilloscope-style real-time waveform
3. **Particle Cloud** - Pure abstract particle system
4. **Combined** - Blend all visualizations together

### Audio Controls
- **Play/Pause**: Toggle with icon morphing animation (play ↔ pause)
- **Volume Slider**: Horizontal slider with decibel display and mute button
- **Seek Bar**:
  - Show waveform preview of track (sampled from audio data)
  - Clickable timeline for seeking to any position
  - Display current time and total duration
  - Draggable progress indicator with smooth seeking
- **Visualization Mode Selector**: Buttons to switch between 4 modes

### Playlist Management
- Display current track with artwork, title, artist, duration
- Show upcoming tracks in scrollable list
- Implement drag-to-reorder with Framer Motion Reorder component
- Add track addition/removal with staggered reveal animations
- Current playing indicator with animated progress bar
- Real-time queue preview with smooth fade transitions

### Album Art Display
- Render album artwork centered in 3D scene on PlaneGeometry
- Add pulse animation synced to detected beats: `scale: 1.0 + (beatEnergy * 0.15)`
- Apply subtle spin rotation based on playback progress
- Circular border and soft shadow styling
- Fade in/out transitions between tracks with Framer Motion

### Fullscreen Mode
- Enable using Fullscreen API (`element.requestFullscreen()`)
- Hide UI controls except visualization mode switcher and close button
- Apply cinematic fade transitions entering/exiting fullscreen
- Scale visualizations to fill entire viewport
- Maintain 60 FPS on fullscreen mode

### Responsive Design & Mobile Optimization
- Reduce particle count on mobile: 500+ on desktop → 200-300 on mobile
- Simplify shaders: remove multiple noise layers, reduce bloom intensity
- Use lower FFT size (1024) on mobile for faster analysis
- Stack controls vertically on small screens
- Touch-friendly button/slider sizes (min 44px)
- Test on iPhone, iPad, and Android devices

## Default Content

If not provided, use free resources:
- Load sample tracks from Pixabay Audio (https://pixabay.com/music/)
- Include 3-5 diverse music genres for testing
- Provide fallback album art (gradient or geometric pattern)

## Visual Polish

- Smooth animations with appropriate easing (power2.inOut for most)
- Consistent color scheme supporting dark mode
- Loading states for audio buffering
- Clear visual feedback for user interactions
- Smooth transitions between visualization modes
- Performance optimizations ensuring 60 FPS on modern devices

## Deliverables

- Fully functional music visualizer running on localhost:3000
- Clean, type-safe TypeScript codebase
- Modular component architecture
- Performance optimized for desktop and mobile
- Free/open assets (no commercial restrictions)
- Comprehensive inline code comments
- README with setup, usage, and customization instructions
