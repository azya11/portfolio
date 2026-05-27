import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

/*
  Interactive black hole.
  A full-screen quad runs a raymarching fragment shader that:
   - bends light rays with a Schwarzschild-style relativistic correction (gravitational lensing),
   - renders a turbulent accretion disk (domain-warped fbm, Keplerian differential rotation,
     blackbody temperature ramp, Doppler beaming + gravitational redshift),
   - draws the event-horizon shadow and a bright photon ring,
   - lenses a procedural starfield behind it.
  The shader outputs linear HDR; a Bloom + ACES tone-mapping pass does the glow.
  The camera slowly orbits and tilts toward the pointer.
*/

const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;     // -1..1
uniform float uQuality;   // raymarch step count

#define PI 3.14159265359

// ---------------- hashes / value noise ----------------
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
    f.z);
  return n;
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
  return v;
}

// ---------------- starfield (sampled by ray direction) ----------------
vec3 stars(vec3 dir) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float scale = 110.0 + float(i) * 95.0;
    vec3 q = dir * scale;
    vec3 id = floor(q);
    float h = hash13(id + float(i) * 13.0);
    if (h > 0.985) {
      float bright = pow((h - 0.985) / 0.015, 1.5);
      vec3 cell = fract(q) - 0.5;
      float d = smoothstep(0.5, 0.0, length(cell));
      // slight twinkle
      bright *= 0.6 + 0.4 * sin(uTime * 2.0 + h * 60.0);
      vec3 tint = mix(vec3(0.65, 0.78, 1.0), vec3(1.0, 0.82, 0.6), hash13(id.zxy));
      col += d * bright * tint * 1.4;
    }
  }
  // faint cool nebula wash
  float neb = fbm(dir * 2.5 + 12.0);
  neb = pow(neb, 3.0);
  col += vec3(0.05, 0.04, 0.10) * neb;
  return col;
}

// ---------------- blackbody-ish temperature ramp (t: 0 hot -> 1 cool) ----------------
vec3 blackbody(float t) {
  vec3 c0 = vec3(0.95, 0.97, 1.00); // blue-white core
  vec3 c1 = vec3(1.00, 0.93, 0.70); // warm white
  vec3 c2 = vec3(1.00, 0.62, 0.26); // orange
  vec3 c3 = vec3(0.85, 0.27, 0.08); // deep orange
  vec3 c4 = vec3(0.40, 0.07, 0.02); // dim red
  vec3 c = mix(c0, c1, smoothstep(0.0, 0.25, t));
  c = mix(c, c2, smoothstep(0.20, 0.50, t));
  c = mix(c, c3, smoothstep(0.45, 0.75, t));
  c = mix(c, c4, smoothstep(0.70, 1.00, t));
  return c;
}

const float HORIZON = 1.0;   // event horizon radius
const float PHOTON  = 1.5;   // photon sphere
const float R_IN    = 3.0;   // accretion disk inner radius
const float R_OUT   = 11.0;  // accretion disk outer radius

// turbulent gas density at a disk hit point (seamless around the ring)
float diskDensity(vec3 hit) {
  float r = length(hit.xz);
  float ang = atan(hit.z, hit.x);
  // Keplerian differential rotation: inner gas orbits faster
  float speed = 7.0 * pow(max(r, 1.0), -1.5);
  float a = ang + uTime * speed;
  float lr = log(r);
  // map angle onto a circle so noise has no seam; radius stretches the pattern
  vec2 sw = vec2(cos(a), sin(a));
  vec3 q = vec3(sw * (2.6 + lr * 1.6), lr * 3.4);
  // domain warp for filament structure
  float w = fbm(q * 0.9 + vec3(0.0, 0.0, uTime * 0.04));
  q += w * 0.9;
  float d = fbm(q * 1.9);
  d = pow(clamp(d, 0.0, 1.0), 2.0);
  // radial envelope: soft inner and outer falloff
  float env = smoothstep(R_IN, R_IN * 1.25, r) * smoothstep(R_OUT, R_OUT * 0.62, r);
  return d * env;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // --- camera: slow orbit + pointer tilt (shallow angle for the iconic arc) ---
  float ang = uTime * 0.04 + uMouse.x * 0.7;
  float dist = 16.0;
  float hgt = 2.6 + uMouse.y * 1.8;
  vec3 ro = vec3(sin(ang) * dist, hgt, cos(ang) * dist);
  vec3 fwd = normalize(vec3(0.0) - ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = cross(fwd, right);
  vec3 rd = normalize(fwd * 1.6 + uv.x * right + uv.y * up);

  // --- raymarch with gravity ---
  vec3 pos = ro;
  vec3 vel = rd;

  vec3 color = vec3(0.0);
  float transmit = 1.0;
  bool captured = false;
  float minR = 1e9;       // closest approach (for photon ring)

  int steps = int(uQuality);
  for (int i = 0; i < 400; i++) {
    if (i >= steps) break;

    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    minR = min(minR, r);

    if (r < HORIZON) { captured = true; break; }

    // adaptive step: smaller near the hole
    float dt = clamp((r - HORIZON) * 0.10, 0.015, 0.45);

    // Schwarzschild-style light bending (relativistic correction term)
    vec3 hvec = cross(pos, vel);
    float h2 = dot(hvec, hvec);
    vec3 acc = -1.5 * h2 * pos / (r2 * r2 * r);
    vec3 npos = pos + vel * dt + 0.5 * acc * dt * dt;
    vel = normalize(vel + acc * dt);

    // disk crossing: equatorial plane y = 0
    if (pos.y * npos.y < 0.0) {
      float tcross = pos.y / (pos.y - npos.y);
      vec3 hit = mix(pos, npos, tcross);
      float rd2 = length(hit.xz);
      if (rd2 > R_IN && rd2 < R_OUT) {
        float dens = diskDensity(hit);
        if (dens > 0.001) {
          float tnorm = (rd2 - R_IN) / (R_OUT - R_IN);

          // Keplerian orbital velocity -> relativistic Doppler beaming
          vec3 orbV = normalize(cross(vec3(0.0, 1.0, 0.0), hit));
          float beta = 0.45 * pow(max(rd2, 1.0), -0.5);
          float mu = dot(orbV, normalize(ro - hit));
          float doppler = 1.0 / (1.0 - beta * mu);   // approaching side brightens/blues
          float boost = pow(doppler, 3.0);

          // gravitational redshift: dimmer + redder near the hole
          float grav = sqrt(max(1.0 - HORIZON / rd2, 0.0));

          vec3 dcol = blackbody(clamp(tnorm * (2.0 - doppler), 0.0, 1.0));
          // bright hot inner lip
          float lip = smoothstep(0.10, 0.0, tnorm);
          float bright = dens * (0.6 + 1.6 * (1.0 - tnorm)) * boost * grav;
          bright += lip * 3.0 * boost;

          float a = clamp(dens * 1.3, 0.0, 1.0);
          color += transmit * dcol * bright * 2.2;
          transmit *= (1.0 - a * 0.85);
        }
      }
    }

    pos = npos;
    if (transmit < 0.02) break;
    if (r > 45.0) break; // escaped to infinity
  }

  // photon ring: rays that grazed the photon sphere pile up into a thin bright ring
  float ring = smoothstep(0.45, 0.0, abs(minR - PHOTON));
  ring *= step(minR, PHOTON + 0.5);
  color += vec3(1.0, 0.78, 0.45) * ring * ring * 3.0 * transmit;

  // lensed background where light survived
  if (!captured) {
    color += transmit * stars(normalize(vel));
  }

  // output linear HDR — Bloom + tone mapping happen in post.
  gl_FragColor = vec4(color, 1.0);
}
`

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

function FullscreenBlackHole({ quality }) {
  const matRef = useRef()
  const { size, gl } = useThree()
  const mouse = useRef(new THREE.Vector2(0, 0))
  const target = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uQuality: { value: quality },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const onMove = (e) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      )
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, delta) => {
    if (!matRef.current) return
    const dpr = gl.getPixelRatio()
    uniforms.uResolution.value.set(size.width * dpr, size.height * dpr)
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uQuality.value = quality
    // ease the pointer influence
    mouse.current.lerp(target.current, Math.min(1, delta * 2.5))
    uniforms.uMouse.value.copy(mouse.current)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function BlackHole() {
  // Lower raymarch quality on small / low-DPR screens for performance.
  const [quality, setQuality] = useState(170)
  const [dpr, setDpr] = useState(1)

  useEffect(() => {
    const small = window.innerWidth < 768
    setQuality(small ? 120 : 200)
    setDpr(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.6))
  }, [])

  return (
    <div className="bh-canvas">
      <Canvas
        flat
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1] }}
      >
        <FullscreenBlackHole quality={quality} />
        <EffectComposer disableNormalPass>
          <Bloom
            mipmapBlur
            intensity={0.9}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.25}
            radius={0.7}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
