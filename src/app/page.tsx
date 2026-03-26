"use client";

import dynamic from "next/dynamic";

const MusicVisualizer = dynamic(
  () => import("@/components/MusicVisualizer"),
  { ssr: false }
);

export default function Home() {
  return <MusicVisualizer />;
}
