"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Track, VisualizationMode } from "@/lib/types";
import AudioControls from "./AudioControls";
import Playlist from "./Playlist";
import TrackInfo from "./TrackInfo";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

let trackIdCounter = 0;
function createTrackFromFile(file: File): Track {
  trackIdCounter++;
  const url = URL.createObjectURL(file);
  const name = file.name.replace(/\.[^/.]+$/, "");
  return {
    id: `file-${trackIdCounter}`,
    title: name,
    artist: "Local File",
    url,
    duration: 0,
  };
}

export default function MusicVisualizer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mode, setMode] = useState<VisualizationMode>("spectrum");
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const {
    analysis,
    analysisRef,
    playerState,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    loadAndPlay,
  } = useAudioEngine(tracks);

  const currentTrack = tracks[playerState.currentTrackIndex];

  // Use a ref to track whether first-load autoplay should happen,
  // avoiding stale closure issues with loadAndPlay
  const pendingAutoplayRef = useRef(false);

  // When tracks go from empty to non-empty and autoplay is pending, trigger play
  useEffect(() => {
    if (pendingAutoplayRef.current && tracks.length > 0) {
      pendingAutoplayRef.current = false;
      loadAndPlay(0);
    }
  }, [tracks, loadAndPlay]);

  const handleFilesAdded = useCallback(
    (files: FileList | File[]) => {
      const audioFiles = Array.from(files).filter((f) =>
        f.type.startsWith("audio/")
      );
      if (audioFiles.length === 0) return;

      const newTracks = audioFiles.map(createTrackFromFile);
      setTracks((prev) => {
        if (prev.length === 0) {
          // Signal that we should autoplay once the state update is committed
          pendingAutoplayRef.current = true;
        }
        return [...prev, ...newTracks];
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFilesAdded(e.dataTransfer.files);
    },
    [handleFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFilesAdded(e.target.files);
      }
    },
    [handleFilesAdded]
  );

  const handleTrackSelect = useCallback(
    async (index: number) => {
      await loadAndPlay(index);
    },
    [loadAndPlay]
  );

  const handleReorder = useCallback((newTracks: Track[]) => {
    setTracks(newTracks);
  }, []);

  const handleRemoveTrack = useCallback(
    (id: string) => {
      if (tracks.length <= 1) return;
      setTracks((prev) => prev.filter((t) => t.id !== id));
    },
    [tracks.length]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isFullscreen) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) setShowControls(true);
  }, [isFullscreen]);

  const hasNoTracks = tracks.length === 0;

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* 3D Scene - reads from analysisRef at 60fps, never re-renders from analysis state */}
      <Scene
        analysisRef={analysisRef}
        mode={mode}
        isPlaying={playerState.isPlaying}
      />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/40 p-16">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white" opacity="0.6">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <p className="text-lg text-white/60">Drop audio files here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {hasNoTracks && !isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-white/5 border border-white/10"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity="0.5">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-medium text-white/70 mb-2">
                Drop audio files here to start
              </p>
              <p className="text-sm text-white/40 mb-4">
                or click the button below to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                Choose Audio Files
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Track info overlay */}
      {!hasNoTracks && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TrackInfo
                track={currentTrack}
                analysis={analysis}
                isPlaying={playerState.isPlaying}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Playlist */}
      {showControls && (
        <Playlist
          tracks={tracks}
          currentTrackIndex={playerState.currentTrackIndex}
          isPlaying={playerState.isPlaying}
          onTrackSelect={handleTrackSelect}
          onReorder={handleReorder}
          onRemoveTrack={handleRemoveTrack}
          isOpen={isPlaylistOpen}
          onToggle={() => setIsPlaylistOpen((prev) => !prev)}
        />
      )}

      {/* Audio Controls */}
      {!hasNoTracks && (
        <AnimatePresence>
          {showControls && (
            <AudioControls
              playerState={playerState}
              onTogglePlay={togglePlay}
              onSeek={seek}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
              onNextTrack={nextTrack}
              onPrevTrack={prevTrack}
              mode={mode}
              onModeChange={setMode}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
          )}
        </AnimatePresence>
      )}

      {/* Add more files button */}
      {!hasNoTracks && showControls && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-4 right-16 z-30 rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
          aria-label="Add audio files"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
