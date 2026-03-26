"use client";

import { useRef, useMemo, useEffect, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioAnalysis } from "@/lib/types";

interface WaveformVisualizerProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
}

const POINTS = 256;

export default function WaveformVisualizer({ analysisRef }: WaveformVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lineObjRef = useRef<THREE.Line | null>(null);
  const positions = useMemo(() => new Float32Array(POINTS * 3), []);
  const colorsArr = useMemo(() => new Float32Array(POINTS * 3), []);

  useEffect(() => {
    if (!groupRef.current) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      toneMapped: false,
    });

    const line = new THREE.Line(geometry, material);
    groupRef.current.add(line);
    lineObjRef.current = line;

    return () => {
      groupRef.current?.remove(line);
      geometry.dispose();
      material.dispose();
    };
  }, [positions, colorsArr]);

  useFrame(() => {
    if (!lineObjRef.current) return;

    const analysis = analysisRef.current;
    const geometry = lineObjRef.current.geometry;
    const step = Math.max(1, Math.floor(analysis.timeDomainData.length / POINTS));

    for (let i = 0; i < POINTS; i++) {
      const x = (i / POINTS - 0.5) * 10;
      const sample = (analysis.timeDomainData[i * step] || 128) / 128 - 1;
      const y = sample * 3;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;

      const intensity = Math.abs(sample);
      colorsArr[i * 3] = 0.2 + intensity * 0.8;
      colorsArr[i * 3 + 1] = 0.6 - intensity * 0.3;
      colorsArr[i * 3 + 2] = 1.0 - intensity * 0.5;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  return <group ref={groupRef} />;
}
