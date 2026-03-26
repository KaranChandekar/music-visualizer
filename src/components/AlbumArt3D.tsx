"use client";

import { useRef, useMemo, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioAnalysis } from "@/lib/types";

interface AlbumArt3DProps {
  analysisRef: MutableRefObject<AudioAnalysis>;
  isPlaying: boolean;
}

const tmpScale = new THREE.Vector3();

export default function AlbumArt3D({ analysisRef, isPlaying }: AlbumArt3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef(0);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    gradient.addColorStop(0, "#6366f1");
    gradient.addColorStop(0.4, "#8b5cf6");
    gradient.addColorStop(0.7, "#a855f7");
    gradient.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let r = 20; r < 128; r += 15) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u266B", 128, 128);

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const analysis = analysisRef.current;
    const targetScale = 1.0 + analysis.beatEnergy * 0.15;
    tmpScale.set(targetScale, targetScale, 1);
    meshRef.current.scale.lerp(tmpScale, 0.2);

    if (isPlaying) {
      rotationRef.current += delta * 0.3;
    }
    meshRef.current.rotation.z = rotationRef.current;

    if (ringRef.current) {
      const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
      ringMat.opacity = 0.3 + analysis.averageEnergy * 0.5;
      ringRef.current.rotation.z = rotationRef.current;
      ringRef.current.scale.copy(meshRef.current.scale);
    }
  });

  return (
    <group position={[0, 0, -1]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[1.05, 1.2, 64]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={meshRef}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
