"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { AudioEngine } from "@/lib/audioEngine";
import { AudioAnalysis, PlayerState, Track } from "@/lib/types";

const EMPTY_ANALYSIS: AudioAnalysis = {
  frequencyData: new Uint8Array(1024),
  timeDomainData: new Uint8Array(1024),
  bands: new Array(64).fill(0),
  bassEnergy: 0,
  midEnergy: 0,
  trebleEnergy: 0,
  averageEnergy: 0,
  isBeat: false,
  beatEnergy: 0,
};

export function useAudioEngine(tracks: Track[]) {
  const engineRef = useRef<AudioEngine | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>(0);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const analysisRef = useRef<AudioAnalysis>(EMPTY_ANALYSIS);

  const [uiAnalysis, setUiAnalysis] = useState<AudioAnalysis>(EMPTY_ANALYSIS);
  const uiFrameCount = useRef(0);

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.75,
    isMuted: false,
    currentTrackIndex: 0,
  });

  const playerStateRef = useRef(playerState);
  playerStateRef.current = playerState;

  // Stable refs for callbacks used inside audio event handlers.
  // These avoid re-creating the audio element when callbacks change.
  const loadTrackRef = useRef<(index: number) => Promise<void>>(async () => {});
  const playCurrentAudioRef = useRef<() => Promise<void>>(async () => {});

  const ensureAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audioRef.current = audio;

      // Attach event listeners once, right when the element is created
      audio.addEventListener("timeupdate", () => {
        setPlayerState((prev) => ({
          ...prev,
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
        }));
      });

      audio.addEventListener("loadedmetadata", () => {
        setPlayerState((prev) => ({
          ...prev,
          duration: audio.duration || 0,
        }));
      });

      audio.addEventListener("durationchange", () => {
        if (audio.duration && isFinite(audio.duration)) {
          setPlayerState((prev) => ({
            ...prev,
            duration: audio.duration,
          }));
        }
      });

      audio.addEventListener("ended", async () => {
        const currentTracks = tracksRef.current;
        if (currentTracks.length === 0) return;
        const nextIndex =
          (playerStateRef.current.currentTrackIndex + 1) % currentTracks.length;
        await loadTrackRef.current(nextIndex);
        await playCurrentAudioRef.current();
      });
    }
    return audioRef.current;
  }, []);

  const initEngine = useCallback(async () => {
    const audio = ensureAudioElement();
    if (!engineRef.current) {
      engineRef.current = new AudioEngine();
      await engineRef.current.init(audio);
    }
  }, [ensureAudioElement]);

  const startAnalysisLoop = useCallback(() => {
    cancelAnimationFrame(animationRef.current);

    const loop = () => {
      if (engineRef.current) {
        analysisRef.current = engineRef.current.getAnalysis();

        uiFrameCount.current++;
        if (uiFrameCount.current % 6 === 0) {
          setUiAnalysis(analysisRef.current);
        }
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  const stopAnalysisLoop = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
  }, []);

  const waitForCanPlay = useCallback((audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (audio.readyState >= 3) {
        resolve();
        return;
      }
      const onCanPlay = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(audio.error);
      };
      const cleanup = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
      };
      audio.addEventListener("canplay", onCanPlay, { once: true });
      audio.addEventListener("error", onError, { once: true });
    });
  }, []);

  const loadTrack = useCallback(
    async (index: number) => {
      const audio = ensureAudioElement();
      const currentTracks = tracksRef.current;
      if (index < 0 || index >= currentTracks.length) return;

      const track = currentTracks[index];

      audio.pause();
      audio.src = track.url;
      audio.load();

      setPlayerState((prev) => ({
        ...prev,
        currentTrackIndex: index,
        currentTime: 0,
        duration: 0,
      }));
    },
    [ensureAudioElement]
  );

  const playCurrentAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    await initEngine();
    await engineRef.current?.resume();

    try {
      await waitForCanPlay(audio);
      await audio.play();
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      startAnalysisLoop();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Playback failed:", err);
    }
  }, [initEngine, waitForCanPlay, startAnalysisLoop]);

  // Keep the stable refs up to date so event handlers always call the latest version
  loadTrackRef.current = loadTrack;
  playCurrentAudioRef.current = playCurrentAudio;

  const play = useCallback(async () => {
    const audio = ensureAudioElement();

    if (!audio.src || audio.src === window.location.href) {
      const currentTracks = tracksRef.current;
      if (currentTracks.length === 0) return;
      await loadTrack(playerStateRef.current.currentTrackIndex);
    }

    await playCurrentAudio();
  }, [ensureAudioElement, loadTrack, playCurrentAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      stopAnalysisLoop();
    }
  }, [stopAnalysisLoop]);

  const togglePlay = useCallback(async () => {
    if (playerStateRef.current.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    engineRef.current?.setVolume(volume);
    setPlayerState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setPlayerState((prev) => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : prev.volume;
      }
      engineRef.current?.setVolume(newMuted ? 0 : prev.volume);
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  const loadAndPlay = useCallback(
    async (index: number) => {
      await loadTrack(index);
      await playCurrentAudio();
    },
    [loadTrack, playCurrentAudio]
  );

  const nextTrack = useCallback(async () => {
    const currentTracks = tracksRef.current;
    if (currentTracks.length === 0) return;
    const nextIndex = (playerStateRef.current.currentTrackIndex + 1) % currentTracks.length;
    await loadTrack(nextIndex);
    if (playerStateRef.current.isPlaying) {
      await playCurrentAudio();
    }
  }, [loadTrack, playCurrentAudio]);

  const prevTrack = useCallback(async () => {
    const currentTracks = tracksRef.current;
    if (currentTracks.length === 0) return;
    const prevIndex =
      (playerStateRef.current.currentTrackIndex - 1 + currentTracks.length) % currentTracks.length;
    await loadTrack(prevIndex);
    if (playerStateRef.current.isPlaying) {
      await playCurrentAudio();
    }
  }, [loadTrack, playCurrentAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      engineRef.current?.destroy();
    };
  }, []);

  return {
    analysis: uiAnalysis,
    analysisRef,
    playerState,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    loadTrack,
    loadAndPlay,
  };
}
