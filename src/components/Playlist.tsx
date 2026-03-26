"use client";

import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Track } from "@/lib/types";

interface PlaylistProps {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onReorder: (tracks: Track[]) => void;
  onRemoveTrack: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Playlist({
  tracks,
  currentTrackIndex,
  isPlaying,
  onTrackSelect,
  onReorder,
  onRemoveTrack,
  isOpen,
  onToggle,
}: PlaylistProps) {
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-4 z-30 rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
        aria-label="Toggle playlist"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
        </svg>
      </button>

      {/* Playlist panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 z-20 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-white/10"
          >
            <div className="p-4 pt-16">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                Queue
              </h2>
              <Reorder.Group
                axis="y"
                values={tracks}
                onReorder={onReorder}
                className="custom-scrollbar flex flex-col gap-1 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 220px)" }}
              >
                {tracks.map((track, index) => {
                  const isCurrent = index === currentTrackIndex;
                  return (
                    <Reorder.Item
                      key={track.id}
                      value={track}
                      className={`group flex cursor-grab items-center gap-3 rounded-lg p-3 transition-colors active:cursor-grabbing ${
                        isCurrent
                          ? "bg-white/15"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {/* Track artwork placeholder */}
                      <div
                        className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-violet-600 to-indigo-900 overflow-hidden"
                        onClick={() => onTrackSelect(index)}
                      >
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-white rounded-full"
                                animate={{
                                  height: ["30%", "100%", "50%", "80%", "30%"],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white/80">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Track info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onTrackSelect(index)}
                      >
                        <p
                          className={`truncate text-sm font-medium ${
                            isCurrent ? "text-white" : "text-white/80"
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {track.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-white/30 font-mono">
                        {formatDuration(track.duration)}
                      </span>

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrack(track.id);
                        }}
                        className="rounded p-1 text-white/0 group-hover:text-white/30 hover:!text-white/70 transition-colors"
                        aria-label="Remove track"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
