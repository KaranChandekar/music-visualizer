"use client";

import { useRef, useMemo, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioAnalysis } from "@/lib/types";

interface ParticleSystemProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
  particleCount?: number;
}

interface ParticleData {
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  band: number;
}

export default function ParticleSystem({
  analysisRef,
  particleCount = 600,
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleDataRef = useRef<ParticleData[]>([]);
  // Reuse a single Color object for all HSL calculations
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const data: ParticleData[] = [];

    for (let i = 0; i < particleCount; i++) {
      const band = i < particleCount / 3 ? 0 : i < (particleCount * 2) / 3 ? 1 : 2;
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      col[i * 3] = 1;
      col[i * 3 + 1] = 1;
      col[i * 3 + 2] = 1;

      data.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 100,
        band,
      });
    }

    particleDataRef.current = data;
    return { positions: pos, colors: col };
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;

    const analysis = analysisRef.current;
    const { bassEnergy, midEnergy, trebleEnergy, isBeat } = analysis;

    for (let i = 0; i < particleCount; i++) {
      const pd = particleDataRef.current[i];
      pd.life += 1;

      if (pd.life > pd.maxLife) {
        pd.life = 0;
        posArray[i * 3] = (Math.random() - 0.5) * 2;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 2;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 2;
        pd.velocity.set(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        );
      }

      let energy = 0;
      if (pd.band === 0) {
        energy = bassEnergy;
        pd.velocity.y += energy * 0.015;
        pd.velocity.x *= 0.98;
        pd.velocity.z *= 0.98;
      } else if (pd.band === 1) {
        energy = midEnergy;
        const x = posArray[i * 3];
        const z = posArray[i * 3 + 2];
        const len = Math.sqrt(x * x + z * z) || 1;
        pd.velocity.x += (x / len) * energy * 0.008;
        pd.velocity.z += (z / len) * energy * 0.008;
      } else {
        energy = trebleEnergy;
        const x = posArray[i * 3];
        const z = posArray[i * 3 + 2];
        const len = Math.sqrt(x * x + z * z) || 1;
        pd.velocity.x += (-z / len) * energy * 0.006;
        pd.velocity.z += (x / len) * energy * 0.006;
        pd.velocity.y += energy * 0.003;
      }

      if (isBeat) {
        pd.velocity.x += (Math.random() - 0.5) * 0.08;
        pd.velocity.y += (Math.random() - 0.5) * 0.08;
        pd.velocity.z += (Math.random() - 0.5) * 0.08;
      }

      pd.velocity.y -= 0.001;
      pd.velocity.multiplyScalar(0.97);

      posArray[i * 3] += pd.velocity.x;
      posArray[i * 3 + 1] += pd.velocity.y;
      posArray[i * 3 + 2] += pd.velocity.z;

      // Reuse tmpColor instead of allocating a new Color per particle per frame
      const hue = (pd.band * 0.33 + energy * 0.2) % 1;
      tmpColor.setHSL(hue, 0.8, 0.4 + energy * 0.4);
      const lifeRatio = 1 - pd.life / pd.maxLife;
      colArray[i * 3] = tmpColor.r * lifeRatio;
      colArray[i * 3 + 1] = tmpColor.g * lifeRatio;
      colArray[i * 3 + 2] = tmpColor.b * lifeRatio;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
