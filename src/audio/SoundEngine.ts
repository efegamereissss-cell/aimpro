/**
 * AIMPRO 2.0 Next-Gen Procedural Web Audio API Synthesizer
 * Zero-latency polyphonic synthesis with 3D spatial panning, harmonic crystal chimes,
 * weapon mechanical layers, dynamic combo pitch scaling, and RGX Karambit slash audio.
 */
class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  public masterVolume: number = 0.8;
  public gunVolume: number = 0.55;
  public hitVolume: number = 0.85;
  public missVolume: number = 0.25;
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

  public playHitSound(comboStreak: number = 0, isHeadshot: boolean = false, panX: number = 0) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      let freq = this.baseHitFrequency;

      if (this.comboPitchEscalation && comboStreak > 0) {
        const semitones = Math.min(comboStreak, 24);
        freq = freq * Math.pow(2, semitones / 12);
      }

      if (isHeadshot) {
        freq *= 1.498;
      }

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(Math.max(-0.8, Math.min(0.8, panX / 10)), now);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.hitVolume * 0.45, now);

      if (this.preset === 'aimlab_crystal') {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(freq, now);
        osc1.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.09);

        osc2.frequency.setValueAtTime(freq * 2.01, now);
        osc2.frequency.exponentialRampToValueAtTime(freq * 1.95, now + 0.06);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(this.hitVolume * 0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + (isHeadshot ? 0.16 : 0.12));

        osc1.connect(gain);
        osc2.connect(subGain);
        subGain.connect(gain);

        if (panner) {
          gain.connect(panner);
          panner.connect(this.masterGain);
        } else {
          gain.connect(this.masterGain);
        }

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.18);
        osc2.stop(now + 0.18);
      } else if (this.preset === 'kovaak_bell') {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2.76, now);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        if (panner) {
          gain.connect(panner);
          panner.connect(this.masterGain);
        } else {
          gain.connect(this.masterGain);
        }

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.23);
        osc2.stop(now + 0.23);
      } else {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq * 1.15, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.07);

        gain.gain.setValueAtTime(this.hitVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        osc.connect(gain);
        if (panner) {
          gain.connect(panner);
          panner.connect(this.masterGain);
        } else {
          gain.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Audio failsafe
    }
  }

  public playTrackingTick(accuracyRatio: number = 1.0) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560 * (0.85 + accuracyRatio * 0.35), now);

      gain.gain.setValueAtTime(this.hitVolume * 0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public playGunshot(type: 'pistol' | 'rifle' | 'beam' | 'sniper' | 'shotgun' = 'pistol') {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.gunVolume * 0.45, now);

      if (type === 'beam') {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        return;
      }

      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type === 'sniper' ? 550 : 1300, now);
      filter.Q.setValueAtTime(type === 'rifle' ? 2.5 : 3.5, now);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(type === 'sniper' ? 190 : 280, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(this.gunVolume * 0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'sniper' ? 0.18 : 0.09));

      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'sniper' ? 0.2 : 0.1));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      whiteNoise.start(now);
      subOsc.start(now);
      whiteNoise.stop(now + 0.22);
      subOsc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  /**
   * Valorant RGX 11z Pro Blade Knife Slash Sound
   */
  public playKnifeSlash() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

      gain.gain.setValueAtTime(this.gunVolume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  /**
   * Valorant RGX 11z Pro Karambit 360 Spin Whoosh Sound
   */
  public playKarambitSpin() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.18);

      gain.gain.setValueAtTime(this.gunVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  public playWeaponInspect() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);

      gain.gain.setValueAtTime(this.gunVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // ignore
    }
  }

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

  public playCountdown(isGo: boolean = false) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGo ? 1046.5 : 523.25, now);

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
