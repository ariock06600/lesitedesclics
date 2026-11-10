/**
 * Web Audio API procedural sound synthesizer for "L'Odyssée des Petits Explorateurs"
 * No external sound files or network requests required.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound 1: Gentle butterfly hover chime (ascending pentatonic notes)
   */
  public playHoverChime(index: number = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const pentatonic = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = pentatonic[index % pentatonic.length];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Sound 2: Juicy fruit drop pop
   */
  public playFruitPop() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Frequency sweeps down quickly to give a cartoon "plop"
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Sound 2b: Basket catch bounce
   */
  public playBasketCatch() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Sound 3a: Single click tap (first tap on chest)
   */
  public playSingleTap() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sound 3b: Magical chest unlock & star release (Double click reward)
   */
  public playChestUnlock() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  /**
   * Sound 4: Shape snap into silhouette slot
   */
  public playShapeSnap() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Layer 1: low resonant thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 0.14);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Layer 2: high magical ding
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.05);
    gain2.gain.setValueAtTime(0.01, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.36);
  }

  /**
   * Level Complete: Joyful brass / trumpet fanfare
   */
  public playLevelSuccess() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const chords = [
      { f: 523.25, t: 0.00, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.14 }, // G5
      { f: 1046.5, t: 0.38, d: 0.45 }, // C6
    ];

    chords.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const start = this.ctx.currentTime + note.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + note.d + 0.05);
    });
  }

  /**
   * Final Grand Celebration Jingle
   */
  public playVictoryFanfare() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.14 }, // C5
      { f: 523.25, t: 0.16, d: 0.14 }, // C5
      { f: 523.25, t: 0.32, d: 0.14 }, // C5
      { f: 659.25, t: 0.48, d: 0.28 }, // E5
      { f: 587.33, t: 0.78, d: 0.14 }, // D5
      { f: 659.25, t: 0.94, d: 0.18 }, // E5
      { f: 783.99, t: 1.14, d: 0.55 }, // G5
      { f: 1046.5, t: 1.72, d: 0.80 }, // C6
    ];

    fanfare.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const start = this.ctx.currentTime + n.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + n.d + 0.05);
    });
  }

  /**
   * Sound 5: Shimmering right-click shell pearl opening (double bubble-crystal chime)
   */
  public playRightClickPop() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Harmonic sparkle
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.01, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  }

  /**
   * Sound 6: Life lost / error buzz (gentle, friendly cartoon bonk)
   */
  public playLifeLost() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Sound 7: Arcade combo hit
   */
  public playComboBonus(multiplier: number = 1) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const baseFreq = 587.33 + Math.min(6, multiplier) * 80;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Sound 8: Game over jingle
   */
  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [
      { f: 392.0, t: 0.0, d: 0.2 }, // G4
      { f: 349.23, t: 0.22, d: 0.2 }, // F4
      { f: 329.63, t: 0.44, d: 0.2 }, // E4
      { f: 261.63, t: 0.66, d: 0.5 }, // C4
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const start = this.ctx.currentTime + n.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + n.d + 0.05);
    });
  }
}

export const soundManager = new SoundSynthesizer();
