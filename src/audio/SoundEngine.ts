/**
 * Zero-latency Procedural Web Audio API Synthesizer
 * Generates hit pings, headshot bells, combo scaling notes, gunshots, and countdown tones
 */
class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  public masterVolume: number = 0.7;
  public gunVolume: number = 0.5;
  public hitVolume: number = 0.8;
  public missVolume: number = 0.3;
  public baseHitFrequency: number = 880; // A5
  public preset: 'aimlab_crystal' | 'kovaak_bell' | 'quake_ding' | 'cyber_plink' = 'aimlab_crystal';
  public comboPitchEscalation: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(master: number, gun: number, hit: number, miss: number) {
    this.masterVolume = master;
    this.gunVolume = gun;
    this.hitVolume = hit;
    this.missVolume = miss;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  /**
   * Crisp Hit Sound with customizable harmonic timbre & optional combo pitch scaling
   */
  public playHitSound(comboStreak: number = 0, isHeadshot: boolean = false) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      let freq = this.baseHitFrequency;

      if (this.comboPitchEscalation && comboStreak > 0) {
        // Semitone pitch step per combo (max 2 octaves up)
        const semitones = Math.min(comboStreak, 24);
        freq = freq * Math.pow(2, semitones / 12);
      }

      if (isHeadshot) {
        freq *= 1.414; // Major 4th / Triton interval boost
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.hitVolume * 0.4, now);

      if (this.preset === 'aimlab_crystal') {
        // High-purity sine crystal ping with fast decay
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.08);

        // Harmonic overtone for crystal sparkle
        const overtone = this.ctx.createOscillator();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2.02, now);

        const overtoneGain = this.ctx.createGain();
        overtoneGain.gain.setValueAtTime(this.hitVolume * 0.15, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + 0.13);
        overtone.stop(now + 0.13);
      } else if (this.preset === 'kovaak_bell') {
        // Metallic bell with multiple harmonics
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2.76, now);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.21);
        osc2.stop(now + 0.21);
      } else if (this.preset === 'quake_ding') {
        // Classic Quake pitch ding
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq * 1.2, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.06);

        gain.gain.setValueAtTime(this.hitVolume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.09);
      } else {
        // Cyber plink
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.8, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.05);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * Continuous tracking tick sound (hum / fast pulse)
   */
  public playTrackingTick(accuracyRatio: number = 1.0) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520 * (0.8 + accuracyRatio * 0.4), now);

      gain.gain.setValueAtTime(this.hitVolume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Procedural Gunshot sound
   */
  public playGunshot(type: 'pistol' | 'rifle' | 'beam' | 'sniper' | 'shotgun' = 'pistol') {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.gunVolume * 0.4, now);

      if (type === 'beam') {
        // Laser charge hum & snap
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        return;
      }

      // Procedural synthetic gunshot using noise burst + low-end thud
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filter noise for punchy weapon pop
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type === 'sniper' ? 600 : 1200, now);
      filter.Q.setValueAtTime(3, now);

      // Low end punch oscillator
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(type === 'sniper' ? 180 : 260, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(this.gunVolume * 0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'sniper' ? 0.15 : 0.08));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      whiteNoise.start(now);
      subOsc.start(now);
      whiteNoise.stop(now + 0.16);
      subOsc.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  /**
   * Miss click / dry fire sound
   */
  public playMissSound() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

      gain.gain.setValueAtTime(this.missVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  /**
   * Countdown beep (3-2-1 low beep, GO high beep)
   */
  public playCountdown(isGo: boolean = false) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGo ? 1046.5 : 523.25, now); // C6 vs C5

      gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.4 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (isGo ? 0.45 : 0.2));
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new ProceduralSoundEngine();
