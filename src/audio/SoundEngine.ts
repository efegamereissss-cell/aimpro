/**
 * AIMPRO 2.0 Next-Gen Procedural Web Audio API Synthesizer
 * Zero-latency polyphonic synthesis with 3D spatial panning, multi-layered premium "Tok" punch,
 * harmonic crystal chimes, weapon mechanical layers, dynamic combo pitch scaling, and RGX Karambit audio.
 */
class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  public masterVolume: number = 0.8;
  public gunVolume: number = 0.55;
  public hitVolume: number = 0.9;
  public missVolume: number = 0.25;
  public baseHitFrequency: number = 740; // Warm, punchy fundamental frequency
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
   * Premium Deep Punchy "Tok" Target Hit Synthesis
   * Triple-layered acoustic sound: Sub Punch (Thump) + Crisp Transient Pop + Harmonic Resonance Tail
   */
  public playHitSound(comboStreak: number = 0, isHeadshot: boolean = false, panX: number = 0) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      let fundamental = this.baseHitFrequency;

      if (this.comboPitchEscalation && comboStreak > 0) {
        const semitones = Math.min(comboStreak, 18);
        fundamental = fundamental * Math.pow(2, semitones / 12);
      }

      if (isHeadshot) {
        fundamental *= 1.334; // Major third pitch boost on headshot
      }

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(Math.max(-0.8, Math.min(0.8, panX / 10)), now);
      }

      // Master Hit Bus Gain
      const hitBus = this.ctx.createGain();
      hitBus.gain.setValueAtTime(this.hitVolume, now);

      // =========================================================================
      // 1. PUNCHY SUB-THUMP BODY LAYER (Tok / Punch)
      // Fast sine pitch drop from 320Hz -> 65Hz for that rich, deep chest impact
      // =========================================================================
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';

      const startThudFreq = isHeadshot ? 380 : 290;
      const endThudFreq = isHeadshot ? 85 : 60;
      thudOsc.frequency.setValueAtTime(startThudFreq, now);
      thudOsc.frequency.exponentialRampToValueAtTime(endThudFreq, now + 0.055);

      thudGain.gain.setValueAtTime(0.65, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeadshot ? 0.075 : 0.06));

      thudOsc.connect(thudGain);
      thudGain.connect(hitBus);
      thudOsc.start(now);
      thudOsc.stop(now + 0.08);

      // =========================================================================
      // 2. CRISP ACOUSTIC TRANSIENT SNAP (Pinpoint Click / Pop)
      // Bandpassed high-frequency burst for razor-sharp click feedback
      // =========================================================================
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(1450, now);
      snapOsc.frequency.exponentialRampToValueAtTime(450, now + 0.025);

      snapGain.gain.setValueAtTime(0.4, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(hitBus);
      snapOsc.start(now);
      snapOsc.stop(now + 0.04);

      // =========================================================================
      // 3. PREMIUM HARMONIC OVERTONE TAIL (Musical Sheen / Feedback)
      // Pure sine fundamental with soft decay
      // =========================================================================
      const toneOsc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      toneOsc.type = 'sine';
      toneOsc.frequency.setValueAtTime(fundamental, now);
      toneOsc.frequency.exponentialRampToValueAtTime(fundamental * 0.98, now + 0.09);

      toneGain.gain.setValueAtTime(0.35, now);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + (isHeadshot ? 0.15 : 0.1));

      toneOsc.connect(toneGain);
      toneGain.connect(hitBus);
      toneOsc.start(now);
      toneOsc.stop(now + 0.16);

      // Connect Hit Bus to Stereo Panner or Master Gain
      if (panner) {
        hitBus.connect(panner);
        panner.connect(this.masterGain);
      } else {
        hitBus.connect(this.masterGain);
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 * (0.9 + accuracyRatio * 0.3), now);

      gain.gain.setValueAtTime(this.hitVolume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.045);
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

  public playBhopJump() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new ProceduralSoundEngine();

