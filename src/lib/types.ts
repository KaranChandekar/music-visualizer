export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration: number;
}

export type VisualizationMode = "spectrum" | "waveform" | "particles" | "combined";

export interface AudioAnalysis {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bands: number[];
  bassEnergy: number;
  midEnergy: number;
  trebleEnergy: number;
  averageEnergy: number;
  isBeat: boolean;
  beatEnergy: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentTrackIndex: number;
}
