"use client";

import { useRef, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioAnalysis } from "@/lib/types";
import {
  backgroundVertexShader,
  backgroundFragmentShader,
} from "@/shaders/background";

interface BackgroundShaderProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
}

export default function BackgroundShader({ analysisRef }: BackgroundShaderProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const analysis = analysisRef.current;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uAudioLevel.value = analysis.averageEnergy;
    materialRef.current.uniforms.uBassLevel.value = analysis.bassEnergy;
    materialRef.current.uniforms.uTrebleLevel.value = analysis.trebleEnergy;
  });

  return (
    <mesh position={[0, 0, -8]} renderOrder={-1}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={backgroundVertexShader}
        fragmentShader={backgroundFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uAudioLevel: { value: 0 },
          uBassLevel: { value: 0 },
          uTrebleLevel: { value: 0 },
        }}
        depthWrite={false}
      />
    </mesh>
  );
}
