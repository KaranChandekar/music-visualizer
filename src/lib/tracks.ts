import { Track } from "./types";

// Default tracks using free Pixabay-style audio
// Users can replace these URLs with their own audio files
export const defaultTracks: Track[] = [
  {
    id: "1",
    title: "Spirited Away",
    artist: "Lexin Music",
    url: "/audio/track1.mp3",
    artwork: undefined,
    duration: 0,
  },
  {
    id: "2",
    title: "Electronic Future",
    artist: "QubeSounds",
    url: "/audio/track2.mp3",
    artwork: undefined,
    duration: 0,
  },
  {
    id: "3",
    title: "Deep Chill",
    artist: "SoulProdMusic",
    url: "/audio/track3.mp3",
    artwork: undefined,
    duration: 0,
  },
];
