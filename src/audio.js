// Tiny synthesized sound effects: no audio files to download. Off by default.
export class Audio {
  constructor() { this.on = false; this.ctx = null; }
  enable(on) {
    this.on = on;
    if (on && !this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.on = false; } }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.on;
  }
  _noise(dur) {
    const c = this.ctx, b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; return s;
  }
  whoosh(dur = 1.6) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, t = c.currentTime, n = this._noise(dur), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.5); f.frequency.exponentialRampToValueAtTime(260, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + dur * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + dur);
    this.zip();
  }
  zip() {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(380, t + 0.16);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.2);
  }
  chime(n = 1) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    [660, 880, 1320].slice(0, n + 1).forEach((fr, i) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = fr;
      g.gain.setValueAtTime(0.0001, t + i * 0.09); g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.6);
      o.connect(g).connect(c.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.65);
    });
  }
  click() {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.frequency.value = 520; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.08);
  }
}
