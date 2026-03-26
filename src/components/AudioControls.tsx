"use client";

import { motion } from "framer-motion";
import { PlayerState, VisualizationMode } from "@/lib/types";

interface AudioControlsProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const modes: { key: VisualizationMode; label: string }[] = [
  { key: "spectrum", label: "Spectrum" },
  { key: "waveform", label: "Waveform" },
  { key: "particles", label: "Particles" },
  { key: "combined", label: "Combined" },
];

export default function AudioControls({
  playerState,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onNextTrack,
  onPrevTrack,
  mode,
  onModeChange,
  onToggleFullscreen,
  isFullscreen,
}: AudioControlsProps) {
  const { isPlaying, currentTime, duration, volume, isMuted } = playerState;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const volumeDb = isMuted || volume === 0
    ? "-\u221EdB"
    : `${(20 * Math.log10(volume)).toFixed(0)}dB`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 sm:px-6"
    >
      {/* Seek bar */}
      <div className="mb-3 flex items-center gap-2">
        <span className="min-w-[40px] text-right text-xs text-white/60 font-mono">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="seek-bar flex-1"
          style={{
            "--seek-progress": duration
              ? `${(currentTime / duration) * 100}%`
              : "0%",
          } as React.CSSProperties}
        />
        <span className="min-w-[40px] text-xs text-white/60 font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Main controls row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Transport controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevTrack}
            className="rounded-full p-2 text-white/70 hover:text-white transition-colors hover:bg-white/10"
            aria-label="Previous track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
            </svg>
          </button>
          <motion.button
            onClick={onTogglePlay}
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <motion.div
              key={isPlaying ? "pause" : "play"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.div>
          </motion.button>
          <button
            onClick={onNextTrack}
            className="rounded-full p-2 text-white/70 hover:text-white transition-colors hover:bg-white/10"
            aria-label="Next track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="rounded p-1 text-white/70 hover:text-white transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="w-20"
          />
          <span className="min-w-[45px] text-xs text-white/50 font-mono">
            {volumeDb}
          </span>
        </div>

        {/* Visualization mode selector */}
        <div className="flex items-center gap-1">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mode === m.key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={onToggleFullscreen}
          className="rounded-full p-2 text-white/70 hover:text-white transition-colors hover:bg-white/10"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}
