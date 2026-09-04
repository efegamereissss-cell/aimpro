/**
 * High-Fidelity Tactical Esports Sound Manager
 * Plays authentic, deep, punchy 'TOK' audio samples with multi-voice pooling
 */
class EsportsSoundManager {
  public isMuted: boolean = false;
  public volume: number = 0.85;

  // Multi-voice audio pools for zero latency and rapid spam without cutoff
  private audioPools: Map<string, HTMLAudioElement[]> = new Map();
  private poolIndex: Map<string, number> = new Map();
  private poolSize = 6;

  private soundSources = {
    copy: '/sounds/tok_copy.wav',
    click: '/sounds/tok_click.wav',
    lobby: '/sounds/tok_lobby.wav',
    success: '/sounds/tok_success.wav',
    error: '/sounds/tok_error.wav'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('teamcom_sound_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
        const savedVol = localStorage.getItem('teamcom_sound_volume');
        if (savedVol !== null) {
          this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
        }
      } catch {}

      this.preloadAudioPools();
    }
  }

  private preloadAudioPools() {
    Object.entries(this.soundSources).forEach(([key, src]) => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = this.volume;
        pool.push(audio);
      }
      this.audioPools.set(key, pool);
      this.poolIndex.set(key, 0);
    });
  }

  private playSound(key: keyof typeof this.soundSources, fallbackFreq = 180) {
    if (this.isMuted) return;

    try {
      const pool = this.audioPools.get(key);
      if (pool && pool.length > 0) {
        const idx = this.poolIndex.get(key) || 0;
        const audio = pool[idx];
        this.poolIndex.set(key, (idx + 1) % pool.length);

        audio.volume = this.volume;
        audio.currentTime = 0;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Autoplay policy or fetch error fallback to deep web audio tok
            this.playSyntheticTok(fallbackFreq);
          });
        }
        return;
      }
    } catch {
      this.playSyntheticTok(fallbackFreq);
    }
  }

  /**
   * Deep, tactile sub-bass "TOK" synthesis fallback (Low-pass filtered, punchy mechanical thud)
   */
  private playSyntheticTok(baseFreq = 140) {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Transient mechanical snap
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();
      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime( baseFreq * 2.2, now);
      oscSnap.frequency.exponentialRampToValueAtTime( baseFreq, now + 0.02);
      gainSnap.gain.setValueAtTime(0.3 * this.volume, now);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      oscSnap.connect(gainSnap);
      gainSnap.connect(ctx.destination);
      oscSnap.start(now);
      oscSnap.stop(now + 0.035);

      // 2. Deep acoustic body ("TOK" resonance)
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      oscBody.type = 'sine';
      oscBody.frequency.setValueAtTime(baseFreq, now);
      oscBody.frequency.exponentialRampToValueAtTime(65, now + 0.07);
      gainBody.gain.setValueAtTime(0.55 * this.volume, now);
      gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      oscBody.connect(gainBody);
      gainBody.connect(ctx.destination);
      oscBody.start(now);
      oscBody.stop(now + 0.12);
    } catch {}
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('teamcom_sound_muted', String(this.isMuted));
    } catch {}
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('teamcom_sound_volume', String(this.volume));
    } catch {}
    this.audioPools.forEach(pool => {
      pool.forEach(a => { a.volume = this.volume; });
    });
  }

  /**
   * Signature Deep 'THOCK' Party Code Copied Sound
   */
  public playCodeCopied() {
    this.playSound('copy', 130);
  }

  /**
   * Tactile Mechanical Switch UI Click
   */
  public playClick() {
    this.playSound('click', 200);
  }

  /**
   * Heavy Valorant Lock-in / Lobby Created Impact
   */
  public playLobbyCreated() {
    this.playSound('lobby', 110);
  }

  /**
   * Victory / Correct Guess Sound
   */
  public playGuessCorrect() {
    this.playSound('success', 160);
  }

  /**
   * Low Muted Thud on Incorrect Guess
   */
  public playGuessWrong() {
    this.playSound('error', 85);
  }
}

export const esportsSound = new EsportsSoundManager();

