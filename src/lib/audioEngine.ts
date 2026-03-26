import { AudioAnalysis } from "./types";

const FFT_SIZE = 2048;
const NUM_BANDS = 64;
const BEAT_THRESHOLD_MULTIPLIER = 1.3;
const ENERGY_HISTORY_SIZE = 60;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(FFT_SIZE / 2);
  private timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(FFT_SIZE / 2);
  private energyHistory: number[] = [];
  private isMobile: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
  }

  async init(audioElement: HTMLAudioElement): Promise<void> {
    if (this.audioContext) return;

    this.audioElement = audioElement;
    this.audioContext = new AudioContext();

    const fftSize = this.isMobile ? 1024 : FFT_SIZE;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = fftSize;
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioContext.createGain();

    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async resume(): Promise<void> {
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  getAnalysis(): AudioAnalysis {
    if (!this.analyser) {
      return {
        frequencyData: new Uint8Array(FFT_SIZE / 2),
        timeDomainData: new Uint8Array(FFT_SIZE / 2),
        bands: new Array(NUM_BANDS).fill(0),
        bassEnergy: 0,
        midEnergy: 0,
        trebleEnergy: 0,
        averageEnergy: 0,
        isBeat: false,
        beatEnergy: 0,
      };
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    // Divide into 64 frequency bands
    const binCount = this.analyser.frequencyBinCount;
    const bandsPerGroup = Math.floor(binCount / NUM_BANDS);
    const bands: number[] = [];

    for (let i = 0; i < NUM_BANDS; i++) {
      let sum = 0;
      const start = i * bandsPerGroup;
      for (let j = start; j < start + bandsPerGroup && j < binCount; j++) {
        sum += this.frequencyData[j];
      }
      bands.push(sum / bandsPerGroup);
    }

    // Calculate energy for bass (0-21), mid (21-43), treble (43-64) ranges
    const bassEnergy = bands.slice(0, 21).reduce((a, b) => a + b, 0) / 21 / 255;
    const midEnergy = bands.slice(21, 43).reduce((a, b) => a + b, 0) / 22 / 255;
    const trebleEnergy = bands.slice(43, 64).reduce((a, b) => a + b, 0) / 21 / 255;
    const averageEnergy = (bassEnergy + midEnergy + trebleEnergy) / 3;

    // Beat detection using rolling average
    this.energyHistory.push(averageEnergy);
    if (this.energyHistory.length > ENERGY_HISTORY_SIZE) {
      this.energyHistory.shift();
    }

    const rollingAverage =
      this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
    const isBeat = averageEnergy > rollingAverage * BEAT_THRESHOLD_MULTIPLIER && averageEnergy > 0.15;
    const beatEnergy = isBeat ? averageEnergy : 0;

    return {
      frequencyData: this.frequencyData,
      timeDomainData: this.timeDomainData,
      bands,
      bassEnergy,
      midEnergy,
      trebleEnergy,
      averageEnergy,
      isBeat,
      beatEnergy,
    };
  }

  destroy(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.gainNode = null;
    this.sourceNode = null;
  }
}
