"use client";

import { useRef, useMemo, useEffect, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioAnalysis } from "@/lib/types";

interface SpectrumBarsProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
}

const NUM_BARS = 64;
const RADIUS = 4;
const BAR_WIDTH = 0.12;

export default function SpectrumBars({ analysisRef }: SpectrumBarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const smoothedHeights = useRef(new Float32Array(NUM_BARS));

  const colors = useMemo(() => {
    const arr = new Float32Array(NUM_BARS * 3);
    for (let i = 0; i < NUM_BARS; i++) {
      const ratio = i / NUM_BARS;
      if (ratio < 0.33) {
        arr[i * 3] = 1.0;
        arr[i * 3 + 1] = 0.15;
        arr[i * 3 + 2] = 0.1;
      } else if (ratio < 0.67) {
        arr[i * 3] = 0.1;
        arr[i * 3 + 1] = 1.0;
        arr[i * 3 + 2] = 0.3;
      } else {
        arr[i * 3] = 0.2;
        arr[i * 3 + 1] = 0.4;
        arr[i * 3 + 2] = 1.0;
      }
    }
    return arr;
  }, []);

  // Set instance colors once on mount, not every frame
  useEffect(() => {
    if (!meshRef.current) return;
    const attr = new THREE.InstancedBufferAttribute(colors, 3);
    meshRef.current.instanceColor = attr;
  }, [colors]);

  useFrame(() => {
    if (!meshRef.current) return;

    const analysis = analysisRef.current;

    for (let i = 0; i < NUM_BARS; i++) {
      const angle = (i / NUM_BARS) * Math.PI * 2;
      const targetHeight = (analysis.bands[i] || 0) / 255;

      smoothedHeights.current[i] +=
        (targetHeight - smoothedHeights.current[i]) * 0.3;
      const height = Math.max(0.05, smoothedHeights.current[i]) * 4;

      const x = Math.cos(angle) * RADIUS;
      const z = Math.sin(angle) * RADIUS;

      dummy.position.set(x, height / 2, z);
      dummy.scale.set(BAR_WIDTH, height, BAR_WIDTH);
      dummy.lookAt(0, height / 2, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_BARS]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        toneMapped={false}
        emissive={new THREE.Color(0.2, 0.3, 0.5)}
        emissiveIntensity={1.5}
      />
    </instancedMesh>
  );
}
