# Music Visualizer

An immersive music visualizer with real-time audio analysis, interactive 3D frequency visualizations, particle systems that react to beats, and shader-based visual effects.

## Features

- **Real-time Audio Analysis** - Web Audio API with FFT size 2048, 64 frequency bands, beat detection
- **3D Spectrum Bars** - 64 bars in circular formation, colored by frequency range (bass=red, mid=green, treble=blue)
- **Particle System** - 600+ particles responding to bass, mid, and treble with unique motion patterns
- **Shader Background** - Dynamic Perlin noise shader that shifts from cool blue (quiet) to warm orange (loud)
- **Beat Detection** - Rolling energy average with visual burst effects on detected beats
- **4 Visualization Modes** - Spectrum Bars, Waveform, Particle Cloud, Combined
- **Drag & Drop** - Drop audio files directly onto the visualizer to add tracks
- **Playlist Management** - Drag-to-reorder with Framer Motion, track removal, auto-advance
- **Album Art** - Animated disc with beat-synced pulse and rotation
- **Fullscreen Mode** - Auto-hiding controls, cinematic experience
- **Mobile Optimized** - Reduced particle count, simplified shaders, touch-friendly controls

## Tech Stack

- **Next.js 15** with TypeScript
- **Three.js** + React Three Fiber + Drei + Postprocessing (bloom)
- **Web Audio API** for real-time frequency and time-domain analysis
- **GSAP** for smooth animations
- **Framer Motion** for UI transitions and drag-to-reorder
- **Tailwind CSS** for styling

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Add Music** - Drag & drop audio files (MP3, WAV, OGG, etc.) onto the page, or click "Choose Audio Files"
2. **Play** - Click the play button or select a track from the playlist
3. **Switch Modes** - Use the mode buttons (Spectrum, Waveform, Particles, Combined)
4. **Adjust Volume** - Use the volume slider or mute button
5. **Seek** - Click/drag the seek bar to jump to any position
6. **Fullscreen** - Click the fullscreen icon for an immersive experience
7. **Manage Playlist** - Open the playlist panel, drag to reorder, click to select

## Project Structure

```
src/
  app/
    page.tsx          - Entry point (client component)
    layout.tsx        - Root layout with metadata
    globals.css       - Global styles, scrollbar, range inputs
  components/
    MusicVisualizer.tsx  - Main orchestrator with drag-drop support
    Scene.tsx            - Three.js Canvas with all 3D elements
    SpectrumBars.tsx     - 64 instanced bars in circular layout
    WaveformVisualizer.tsx - Real-time oscilloscope waveform
    ParticleSystem.tsx   - 600+ particles with band-specific motion
    BackgroundShader.tsx - Dynamic audio-reactive shader background
    AlbumArt3D.tsx       - Beat-synced album art disc
    AudioControls.tsx    - Play/pause, seek, volume, mode selector
    Playlist.tsx         - Drag-to-reorder playlist panel
    TrackInfo.tsx        - Current track info overlay
  hooks/
    useAudioEngine.ts   - Audio playback and analysis hook
  lib/
    audioEngine.ts      - Web Audio API engine with beat detection
    types.ts            - TypeScript type definitions
    tracks.ts           - Default track definitions
  shaders/
    background.ts       - GLSL vertex and fragment shaders
```

## Customization

- **Particle count**: Adjust `particleCount` prop in `Scene.tsx`
- **Beat sensitivity**: Change `BEAT_THRESHOLD_MULTIPLIER` in `audioEngine.ts`
- **Bar count**: Modify `NUM_BARS` in `SpectrumBars.tsx`
- **Bloom intensity**: Adjust `intensity` in `Scene.tsx` EffectComposer
- **Shader colors**: Edit color values in `shaders/background.ts`
- **Auto-rotate speed**: Change `autoRotateSpeed` in `Scene.tsx` OrbitControls
