/**
 * Web Audio API procedural sound engine for Quadrata.
 * Generates tactile glass chimes, snap impacts, and ambient drone loops.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.82; // 82% default as in screenshot
  private currentAmbient: 'rain' | 'synth' | 'silent' = 'rain';

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(volPercent: number) {
    this.volume = Math.max(0, Math.min(1, volPercent / 100));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Tactile click / spring snap when dropping a polyomino
   */
  public playPlace() {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Ascending bell-like pentatonic chimes for line/box clears
   */
  public playClear(streak: number = 1, simultaneousCount: number = 1) {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Pentatonic scale frequencies (C major / A minor)
    const notes = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
      1174.66, // D6
      1318.51, // E6
      1567.98  // G6
    ];

    const baseIndex = Math.min(notes.length - 3, (streak - 1) * 2);
    const chords = [
      notes[baseIndex % notes.length],
      notes[(baseIndex + 2) % notes.length],
      notes[(baseIndex + 4) % notes.length],
    ];

    if (simultaneousCount > 1) {
      chords.push(notes[(baseIndex + 5) % notes.length]);
    }

    const now = ctx.currentTime;

    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.045);

      const noteVolume = this.volume * 0.28;
      gain.gain.setValueAtTime(0.001, now + i * 0.045);
      gain.gain.linearRampToValueAtTime(noteVolume, now + i * 0.045 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.5);
    });
  }

  /**
   * Sound effect for rotating a piece
   */
  public playRotate() {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Bomb / Shatter power-up resonance
   */
  public playShatter() {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Low frequency rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Re-roll whoosh
   */
  public playReroll() {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [300, 450, 600].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(this.volume * 0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.13);
    });
  }

  /**
   * Game Over melancholic cadence
   */
  public playGameOver() {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [400, 360, 320, 240].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(this.volume * 0.25, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.35);
    });
  }

  /**
   * Switch or update ambient focus soundscape
   */
  public setAmbient(type: 'rain' | 'synth' | 'silent') {
    this.currentAmbient = type;
    this.stopAmbient();
    if (type === 'silent' || this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.08, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    if (type === 'synth') {
      // 432Hz deep meditative drone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(108, ctx.currentTime); // Sub-harmonic of 432Hz
      osc.connect(this.ambientGain);
      osc.start();
      this.ambientSource = osc;
    } else if (type === 'rain') {
      // Gentle filtered white noise simulating rain / ocean
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light', enabled: boolean = true) {
    if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      if (type === 'light') {
        navigator.vibrate(15);
      } else if (type === 'medium') {
        navigator.vibrate(35);
      } else if (type === 'heavy') {
        navigator.vibrate([40, 30, 60]);
      }
    } catch {
      // Haptics unsupported or blocked by browser policy
    }
  }

  private stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioScheduledSourceNode).stop?.();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
}

export const sound = new SoundEngine();
