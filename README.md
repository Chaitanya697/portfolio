# Chaitanya P Desai: Interactive 3D City Portfolio

**Live:** https://chaitanya697.github.io/portfolio/

My portfolio as a night-time city. Every landmark tower is a chapter: click one and the camera swings over to it on a grapple line.

| Tower | Section |
|---|---|
| Chaitanya HQ | About me, summary, résumés |
| The Repository | GitHub & projects |
| Construction Yard | Current projects |
| Research Lab | IEEE publication & research |
| Experience Tower | Internship (ARIEOTECH) |
| The Academy | Education & certifications |
| The Arena | Leadership, hackathons, sports |
| Signal Billboard | Skills |
| Comms Beacon | Contact, freelance services |

A text-only **Recruiter view** (top right) has the same content, and it's used automatically when WebGL isn't available or reduced motion is on. The city also keeps a few secrets.

## Engineering

- **Three.js with custom GLSL, no frameworks.** All the content lives in [`src/data.js`](src/data.js) and feeds both the 3D panels and the recruiter view.
- **The entire skyline is one instanced draw call.** Window lights are generated in the fragment shader, so there are no textures to download.
- **Traffic, aviation lights, rain and fireworks run on the GPU,** with zero per-frame CPU work.
- **No post-processing.** Glow is faked with additive sprites.
- **Quality adapts to the device.** Phones get a lighter city capped at 30 fps; every device drops to 30 fps while a panel is open; the pixel ratio scales down if frames drop.
- **Size:** ~170 KB gzipped JavaScript, self-hosted subset fonts.

## Develop

```bash
npm install
npm run build     # bundles src/ → assets/app.js
npm run serve     # http://localhost:8080
```

Add `?debug` to the URL to expose `window.__city` for testing.
