// All custom GLSL. Written in GLSL1 style; three.js maps it onto WebGL2.

const COMMON = /* glsl */ `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 applyFog(vec3 col, vec3 wpos, vec3 fogCol, float dens){
  float d = length(wpos - cameraPosition);
  float f = 1.0 - exp(-pow(d * dens, 2.0));
  float low = exp(-max(wpos.y, 0.0) / 60.0) * 0.25;          // denser haze near street level
  return mix(col, fogCol, clamp(f + low * f, 0.0, 1.0));
}`;

export const buildingVert = /* glsl */ `
#ifdef USE_INSTANCING
attribute float aSeed;
#endif
uniform float uSeed;
varying vec3 vWorld; varying vec3 vN; varying float vSeed;
void main(){
  #ifdef USE_INSTANCING
    mat4 m = modelMatrix * instanceMatrix; vSeed = aSeed;
  #else
    mat4 m = modelMatrix; vSeed = uSeed;
  #endif
  vec4 w = m * vec4(position, 1.0);
  vWorld = w.xyz; vN = normalize(mat3(m) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const buildingFrag = /* glsl */ `
uniform float uTime, uLit, uNeon, uFogDens, uCyl, uRadius, uAccentMix, uFlash;
uniform vec3 uBase, uWarm, uCool, uFog, uAccent; uniform vec2 uCenter;
varying vec3 vWorld; varying vec3 vN; varying float vSeed;
${COMMON}
void main(){
  vec3 n = normalize(vN);
  float hgt = vWorld.y;
  vec3 base = mix(uBase, uAccent * 0.22, uAccentMix);
  vec3 col = base * (0.55 + 0.6 * clamp(hgt / 220.0, 0.0, 1.0));
  if (abs(n.y) > 0.6) {
    col = base * 0.55;
  } else {
    float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
    if (uCyl > 0.5) u = atan(vWorld.z - uCenter.y, vWorld.x - uCenter.x) * uRadius;
    vec2 g = vec2(u / 2.6, hgt / 3.4);
    vec2 cell = floor(g); vec2 f = fract(g) - 0.5;
    vec2 fw = fwidth(g);
    float wx = 1.0 - smoothstep(0.30 - fw.x, 0.30 + fw.x, abs(f.x));
    float wy = 1.0 - smoothstep(0.27 - fw.y, 0.27 + fw.y, abs(f.y));
    float faceId = n.x * 7.0 + n.z * 3.0;
    float r = hash12(cell + vSeed * 17.31 + faceId);
    float lit = step(1.0 - uLit, r);
    float flick = step(0.996, hash12(cell + floor(uTime * 0.3) + vSeed));
    lit = abs(lit - flick);
    vec3 wc = mix(uWarm, uCool, step(0.62, hash12(cell * 1.7 + vSeed)));
    wc *= 0.55 + 0.75 * hash12(cell * 3.1 + vSeed);
    wc = mix(wc, uAccent * 1.2, uAccentMix * 0.5);
    vec3 neon = mix(vec3(1.0, 0.18, 0.75), vec3(0.15, 0.9, 1.0), step(0.5, hash12(cell + vSeed * 2.0)));
    wc = mix(wc, neon, uNeon);
    float far = clamp(max(fw.x, fw.y) * 1.6 - 0.25, 0.0, 1.0);   // anti-shimmer at distance
    float m = mix(wx * wy, 0.33, far);
    col = mix(col, wc, m * lit * 0.95);
    col += (1.0 - lit) * m * vec3(0.03, 0.05, 0.09);
    // lobby band
    col += uWarm * 0.35 * (1.0 - smoothstep(0.0, 5.0, hgt)) * step(0.5, hash12(vec2(vSeed)));
  }
  col += vec3(1.0, 0.5, 0.22) * 0.10 * exp(-max(hgt, 0.0) / 16.0);
  col = applyFog(col, vWorld, uFog, uFogDens);
  col += uFlash * vec3(0.35, 0.4, 0.55);
  gl_FragColor = vec4(col, 1.0);
}`;

export const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;

export const skyFrag = /* glsl */ `
uniform vec3 uZenith, uMid, uHorizon, uGlow, uFog; uniform float uTime, uStars, uFlash;
varying vec3 vDir;
float hash13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
void main(){
  float y = vDir.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, y));
  col = mix(col, uZenith, smoothstep(0.2, 0.75, y));
  col += uGlow * exp(-max(y, 0.0) * 9.0) * 0.6;
  col = mix(uFog, col, smoothstep(-0.04, 0.09, y));
  // stars
  vec3 q = floor(vDir * 380.0);
  float s = hash13(q);
  float tw = 0.6 + 0.4 * sin(uTime * (1.0 + s * 3.0) + s * 40.0);
  col += step(0.9975, s) * tw * smoothstep(0.08, 0.5, y) * uStars * vec3(0.85, 0.9, 1.0);
  col += uFlash * vec3(0.55, 0.6, 0.8) * smoothstep(-0.1, 0.6, y);
  gl_FragColor = vec4(col, 1.0);
}`;

export const groundVert = /* glsl */ `
varying vec3 vWorld;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

export const groundFrag = /* glsl */ `
uniform vec3 uFog, uRoad, uWalk, uLamp; uniform float uFogDens, uTime, uCity, uFlash;
varying vec3 vWorld;
${COMMON}
float roadMask(float c){ float d = abs(mod(c - 24.0, 48.0) - 24.0); return d; }
void main(){
  vec2 p = vWorld.xz;
  float dx = roadMask(p.x), dz = roadMask(p.y);
  float d = min(dx, dz);
  vec2 fw = vec2(fwidth(d));
  float road = 1.0 - smoothstep(6.0 - fw.x, 6.0 + fw.x, d);
  float walk = 1.0 - smoothstep(8.0 - fw.x, 8.0 + fw.x, d);
  vec3 col = mix(vec3(0.02, 0.025, 0.035), uWalk, walk);
  col = mix(col, uRoad, road);
  // dashed centre lines
  float along = dx < dz ? p.y : p.x;
  float centre = 1.0 - smoothstep(0.12, 0.12 + fwidth(d) * 1.5, d);
  float dash = step(0.5, fract(along / 6.0));
  col += vec3(0.9, 0.7, 0.25) * centre * dash * 0.35 * road;
  // street-lamp pools along kerbs
  vec2 lp = mod(p - 12.0, 24.0) - 12.0;
  float pool = exp(-dot(lp, lp) / 28.0) * walk;
  col += uLamp * pool * 0.55;
  // wet sheen
  col += uLamp * 0.04 * road * (0.5 + 0.5 * sin(p.x * 0.05 + p.y * 0.07));
  float edge = smoothstep(uCity, uCity + 220.0, length(p));
  col = mix(col, vec3(0.01, 0.012, 0.02), edge);
  col = applyFog(col, vWorld, uFog, uFogDens);
  col += uFlash * vec3(0.15, 0.17, 0.25);
  gl_FragColor = vec4(col, 1.0);
}`;

export const trafficVert = /* glsl */ `
attribute float aAxis, aCoord, aSpeed, aOffset; attribute vec3 aColor;
uniform float uTime, uSpan, uSize, uPR;
varying vec3 vColor; varying float vFade;
void main(){
  float along = mod(aOffset + uTime * aSpeed, uSpan * 2.0) - uSpan;
  vec3 p = aAxis < 0.5 ? vec3(along, 0.8, aCoord) : vec3(aCoord, 0.8, along);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPR * (260.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vColor = aColor; vFade = 1.0 - smoothstep(uSpan * 0.7, uSpan, abs(along));
}`;

export const glowFrag = /* glsl */ `
varying vec3 vColor; varying float vFade;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  float a = smoothstep(0.5, 0.0, d); a = a * a;
  gl_FragColor = vec4(vColor * a * vFade, a * vFade);
}`;

export const beaconVert = /* glsl */ `
attribute float aPhase; uniform float uTime, uSize, uPR;
varying vec3 vColor; varying float vFade;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float blink = step(0.55, fract(uTime * 0.7 + aPhase));
  gl_PointSize = uSize * uPR * (300.0 / -mv.z) * (0.4 + blink);
  gl_Position = projectionMatrix * mv;
  vColor = vec3(1.0, 0.15, 0.1) * (0.3 + blink); vFade = 1.0;
}`;

export const rainVert = /* glsl */ `
attribute vec3 aSeed; uniform float uTime, uOn; uniform vec3 uCam;
varying float vA;
void main(){
  vec3 box = vec3(240.0, 200.0, 240.0);
  vec3 p = aSeed * box;
  p.y = mod(p.y - uTime * 140.0, box.y);
  p.x += uTime * 8.0;
  p = mod(p - uCam - box * 0.5, box) + uCam - box * 0.5;
  // position is a 2-vertex streak: .y offset baked into "position.y"
  p.y += position.y * 4.0; p.x += position.y * 0.25;
  vA = uOn * (0.25 + 0.35 * aSeed.z);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;

export const rainFrag = /* glsl */ `
varying float vA;
void main(){ gl_FragColor = vec4(vec3(0.6, 0.7, 0.9) * vA, vA); }`;

export const fireworkVert = /* glsl */ `
attribute vec3 aDir; attribute float aBurst; attribute vec3 aColor;
uniform float uTime, uStart, uPR; uniform vec3 uOrigins[6];
varying vec3 vColor; varying float vFade;
void main(){
  float t = uTime - uStart - aBurst * 0.9;
  vec3 o = uOrigins[int(aBurst)];
  float alive = step(0.0, t) * (1.0 - step(2.6, t));
  vec3 p = o + aDir * (1.0 - exp(-t * 2.2)) * 42.0 - vec3(0.0, 1.0, 0.0) * t * t * 4.0;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = 7.0 * uPR * (300.0 / -mv.z) * alive;
  gl_Position = projectionMatrix * mv;
  vColor = aColor * 1.4; vFade = alive * (1.0 - clamp(t / 2.6, 0.0, 1.0));
}`;

export const beamVert = /* glsl */ `
varying float vY; varying vec3 vN; varying vec3 vView; varying float vDist;
void main(){
  vY = uv.y;
  vec4 w = modelMatrix * vec4(position, 1.0); vDist = distance(cameraPosition, w.xyz);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const beamFrag = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity, uDir;
varying float vY; varying vec3 vN; varying vec3 vView; varying float vDist;
void main(){
  float fade = pow(mix(vY, 1.0 - vY, uDir), 1.6);
  float a = uOpacity * fade * (0.35 + 0.65 * (1.0 - abs(dot(normalize(vN), vView)))) * smoothstep(25.0, 170.0, vDist);
  gl_FragColor = vec4(uColor * a, a);
}`;
