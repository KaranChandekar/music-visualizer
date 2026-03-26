"use client";

import { Suspense, MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import { AudioAnalysis, VisualizationMode } from "@/lib/types";
import SpectrumBars from "./SpectrumBars";
import WaveformVisualizer from "./WaveformVisualizer";
import ParticleSystem from "./ParticleSystem";
import BackgroundShader from "./BackgroundShader";
import AlbumArt3D from "./AlbumArt3D";

interface SceneProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
  mode: VisualizationMode;
  isPlaying: boolean;
}

function SceneContent({ analysisRef, mode, isPlaying }: SceneProps) {
  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const particleCount = isMobile ? 250 : 600;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      <BackgroundShader analysisRef={analysisRef} />
      <AlbumArt3D analysisRef={analysisRef} isPlaying={isPlaying} />

      {(mode === "spectrum" || mode === "combined") && (
        <SpectrumBars analysisRef={analysisRef} />
      )}
      {(mode === "waveform" || mode === "combined") && (
        <WaveformVisualizer analysisRef={analysisRef} />
      )}
      {(mode === "particles" || mode === "combined") && (
        <ParticleSystem analysisRef={analysisRef} particleCount={particleCount} />
      )}

      <EffectComposer>
        <Bloom
          intensity={isMobile ? 0.8 : 1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.35}
      />
    </>
  );
}

export default function Scene({ analysisRef, mode, isPlaying }: SceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContent
            analysisRef={analysisRef}
            mode={mode}
            isPlaying={isPlaying}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
