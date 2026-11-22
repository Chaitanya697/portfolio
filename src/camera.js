import * as THREE from 'three';
import { clamp, easeInOut, easeOut } from './util.js';

const UP = new THREE.Vector3(0, 1, 0);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const OVERVIEW = { pos: new THREE.Vector3(300, 255, 440), look: new THREE.Vector3(-10, 30, 10) };

export class Director {
  constructor(camera, controls, scene, hooks = {}) {
    this.cam = camera; this.controls = controls; this.hooks = hooks;
    this.baseFov = camera.fov; this.anim = null; this.queue = null;
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4f8ff, transparent: true, opacity: 0.9, fog: false });
    this.line = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 1, 6, 1, true).translate(0, 0.5, 0), lineMat);
    this.line.visible = false; this.line.frustumCulled = false; scene.add(this.line);
    this._a = new THREE.Vector3(); this._b = new THREE.Vector3(); this._c = new THREE.Vector3(); this._d = new THREE.Vector3();
  }

  get busy() { return !!this.anim; }

  // Pick a vantage point that is not inside or behind another landmark, and above nearby roofs.
  focusFor(tower, mobile, panel = true) {
    const [x, z] = tower.pos; const top = tower.top;
    const low = tower.kind === 'arena';
    const D = low ? 125 : top * 0.55 + 78;
    const lookY = low ? 8 : top * 0.5;
    const lots = this.lots || [];
    const roofAt = (px, pz, pad) => { let r = 0; for (const b of lots) if (Math.abs(b.x - px) < b.w / 2 + pad && Math.abs(b.z - pz) < b.d / 2 + pad) r = Math.max(r, b.h); return r; };
    const camYAt = (cx, cz) => Math.max(low ? 110 : top * 0.62 + 14, roofAt(cx, cz, 14) + 20);
    const sightClear = (cx, cy, cz) => {
      for (let s = 0.12; s < 0.9; s += 0.08) {
        const px = cx + (x - cx) * s, pz = cz + (z - cz) * s, py = cy + (lookY - cy) * s;
        if (Math.hypot(px - x, pz - z) < 20) break;
        if (roofAt(px, pz, 2) > py) return false;
      }
      return true;
    };
    const a0 = tower.id === 'hq' ? 0.35 : Math.atan2(x, z + 120);
    const others = (this.obstacles || []).filter((o) => o.id !== tower.id);
    const segDist = (px, pz, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az; const t = clamp(((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(px - ax - vx * t, pz - az - vz * t); };
    let best = null;
    for (let k = 0; k <= 23 && !best; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.2618;
      const cx = x + Math.sin(a) * D, cz = z + Math.cos(a) * D;
      if (Math.hypot(cx, cz) > 470) continue;
      const clear = others.every((o) => Math.hypot(cx - o.x, cz - o.z) > o.r + 22 && segDist(o.x, o.z, cx, cz, x, z) > o.r + 6);
      if (!clear) continue;
      for (const lift of [0, 25, 50, 80]) { const cy = camYAt(cx, cz) + lift; if (sightClear(cx, cy, cz)) { best = [cx, cz, cy]; break; } }
    }
    if (!best) { const cx = x + Math.sin(a0) * D, cz = z + Math.cos(a0) * D; best = [cx, cz, camYAt(cx, cz) + 80]; }
    const pos = new THREE.Vector3(best[0], best[2], best[1]);
    const look = new THREE.Vector3(x, lookY, z);
    if (panel) {
      const fwd = look.clone().sub(pos).normalize();
      const right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
      if (mobile) look.y -= D * 0.28; else look.addScaledVector(right, D * 0.34);
    }
    return { pos, look };
  }

  // Swing (or glide) the camera to a new view. Resolves when it lands.
  travelTo(pos, look, opts = {}) {
    const p0 = this.cam.position.clone();
    const dist = p0.distanceTo(pos);
    const swing = opts.swing !== false && dist > 40;
    const dur = opts.dur ?? (swing ? clamp(1.15 + dist / 430, 1.5, 2.7) : clamp(0.8 + dist / 600, 0.9, 3.4));
    const mid = p0.clone().add(pos).multiplyScalar(0.5);
    const dip = clamp(dist * 0.32, 18, 120);
    const ctrl = mid.clone(); ctrl.y = Math.max(28, Math.min(p0.y, pos.y) - dip);
    const anchor = mid.clone(); anchor.y = Math.max(p0.y, pos.y) + 55;
    const side = Math.sign(new THREE.Vector3().crossVectors(pos.clone().sub(p0), UP).y || 1);
    this.controls.enabled = false;
    this.hooks.onStart?.(swing);
    return new Promise((resolve) => {
      this.anim = { t: 0, dur, p0, p2: pos.clone(), ctrl, anchor, look0: this.controls.target.clone(), look1: look.clone(), swing, side, resolve, shoot: swing ? 0.14 : 0 };
    });
  }

  cancel() { if (this.anim) { const r = this.anim.resolve; this.anim = null; this.line.visible = false; this.cam.fov = this.baseFov; this.cam.updateProjectionMatrix(); this.controls.enabled = true; r(false); } }

  update(dt) {
    const a = this.anim;
    if (!a) { this.controls.update(); return; }
    a.t = Math.min(1, a.t + dt / a.dur);
    const cam = this.cam;
    // phase 1: shoot the line, phase 2: swing
    const tt = a.shoot ? clamp((a.t - a.shoot) / (1 - a.shoot), 0, 1) : a.t;
    const e = a.swing ? easeInOut(tt) : easeOut(tt) * 0.15 + easeInOut(tt) * 0.85;
    const inv = 1 - e;
    const P = this._a.copy(a.p0).multiplyScalar(inv * inv)
      .addScaledVector(a.ctrl, a.swing ? 2 * inv * e : 0)
      .addScaledVector(a.p2, e * e + (a.swing ? 0 : 2 * inv * e));
    cam.position.copy(P);
    // tangent for look-ahead
    const T = this._b.copy(a.ctrl).sub(a.p0).multiplyScalar(2 * inv).addScaledVector(this._c.copy(a.p2).sub(a.ctrl), 2 * e);
    if (!a.swing) T.copy(a.p2).sub(a.p0);
    T.normalize();
    const ahead = this._c.copy(P).addScaledVector(T, 90);
    const w0 = 1 - sstep(0, 0.25, tt), w1 = sstep(0.42, 1, tt), wt = Math.max(0, 1 - w0 - w1);
    const look = this._d.copy(a.look0).multiplyScalar(w0).addScaledVector(ahead, a.swing ? wt : 0).addScaledVector(a.look1, w1 + (a.swing ? 0 : wt));
    look.multiplyScalar(1 / (w0 + w1 + wt));
    cam.up.copy(UP); cam.lookAt(look);
    if (a.swing) cam.rotateZ(Math.sin(Math.PI * tt) * 0.09 * a.side);
    cam.fov = this.baseFov + (a.swing ? 11 : 4) * Math.sin(Math.PI * tt); cam.updateProjectionMatrix();

    // grapple line from just below the camera to the anchor
    if (a.swing && a.t < 0.82) {
      cam.updateMatrixWorld();
      const start = this._b.set(1.1, -1.5, -7).applyMatrix4(cam.matrixWorld);
      const grow = a.shoot ? clamp(a.t / a.shoot, 0, 1) : 1;
      const end = this._c.copy(start).lerp(a.anchor, grow);
      const len = start.distanceTo(end);
      this.line.visible = len > 0.5;
      this.line.position.copy(start); this.line.scale.set(1, len, 1);
      this.line.quaternion.setFromUnitVectors(UP, end.sub(start).normalize());
      this.line.material.opacity = 0.9 * (1 - sstep(0.65, 0.82, a.t));
    } else this.line.visible = false;

    if (a.t >= 1) {
      cam.up.copy(UP); cam.position.copy(a.p2); cam.lookAt(a.look1); cam.fov = this.baseFov; cam.updateProjectionMatrix();
      this.controls.target.copy(a.look1); this.controls.enabled = true; this.controls.update();
      this.line.visible = false; const r = a.resolve; this.anim = null; this.hooks.onLand?.(); r(true);
    }
  }
}
