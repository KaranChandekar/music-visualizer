"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Track, AudioAnalysis } from "@/lib/types";

interface TrackInfoProps {
  track: Track | undefined;
  analysis: AudioAnalysis;
  isPlaying: boolean;
}

export default function TrackInfo({ track, analysis, isPlaying }: TrackInfoProps) {
  if (!track) return null;

  return (
    <div className="absolute top-4 left-4 z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 rounded-xl bg-black/40 px-4 py-3 backdrop-blur-sm"
        >
          {/* Mini album art */}
          <motion.div
            animate={{
              scale: isPlaying ? 1 + analysis.beatEnergy * 0.1 : 1,
            }}
            transition={{ duration: 0.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-900"
          >
            <span className="text-lg">{"\u266B"}</span>
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-white">{track.title}</p>
            <p className="text-xs text-white/50">{track.artist}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
