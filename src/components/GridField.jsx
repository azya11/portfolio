import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// World is sized so the visible height at z=0 is VIS_H units (see camera dist).
const VIS_H = 10
const CELL_PX = 64 // target on-screen cell size
const HOLD_MS = 5000 // a pressed cube stays down this long before rising
const EASE = 0.16 // press/release speed (lower = softer)

// 12-edge wireframe of a box (w×h×d), built once and only translated per
// instance, so the edge thickness stays uniform. These are the cube's real
// edges — including the inner/vertical ones — so each cell reads as a 3D cube.
function makeCubeFrame(w, h, d) {
  const t = Math.min(w, h) * 0.03
  const hw = w / 2
  const hh = h / 2
  const hd = d / 2
  const parts = []
  for (const y of [hh, -hh]) for (const z of [hd, -hd]) parts.push(new THREE.BoxGeometry(w, t, t).translate(0, y, z))
  for (const x of [hw, -hw]) for (const z of [hd, -hd]) parts.push(new THREE.BoxGeometry(t, h, t).translate(x, 0, z))
  for (const x of [hw, -hw]) for (const y of [hh, -hh]) parts.push(new THREE.BoxGeometry(t, t, d).translate(x, y, 0))
  return mergeGeometries(parts)
}

function Scene() {
  const { size, camera } = useThree()
  const meshRef = useRef()
  const lineRef = useRef()
  const ptr = useRef({ x: 0, y: 0, on: false })
  const lastCell = useRef(-1)

  const aspect = size.width / size.height
  const VIS_W = VIS_H * aspect

  const grid = useMemo(() => {
    const cols = Math.max(6, Math.round(size.width / CELL_PX))
    const rows = Math.max(6, Math.round(size.height / CELL_PX))
    const cw = VIS_W / cols
    const ch = VIS_H / rows
    const depth = Math.min(cw, ch) // cube depth ≈ footprint → a real cube
    const positions = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        positions.push([-VIS_W / 2 + cw * (i + 0.5), -VIS_H / 2 + ch * (j + 0.5)])
      }
    }
    return { cols, rows, cw, ch, depth, positions }
  }, [size.width, size.height, VIS_W])

  const count = grid.positions.length
  const heights = useMemo(() => new Float32Array(count), [count]) // current press depth
  const pressedAt = useMemo(() => new Float64Array(count), [count]) // 0 = idle
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(grid.cw, grid.ch, grid.depth), [grid])
  // BoxGeometry material order: +X, -X, +Y, -Y, +Z(top/lid), -Z(back).
  // Side walls (revealed when a cube is pressed in) are a soft dark lavender;
  // lid + back stay deep so the resting field reads calm.
  const cubeMats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#2a2740', roughness: 0.6, metalness: 0.1 })
    const lid = new THREE.MeshStandardMaterial({ color: '#16151f', roughness: 0.6, metalness: 0.1 })
    return [side, side, side, side, lid, lid]
  }, [])
  const frameGeo = useMemo(() => makeCubeFrame(grid.cw, grid.ch, grid.depth), [grid])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  // edge colours: soft lavender at rest → bright pale lavender when pressed in
  const edgeIdle = useMemo(() => new THREE.Color('#7c6cff').multiplyScalar(0.42), [])
  const edgeHot = useMemo(() => new THREE.Color('#ffe0f5'), [])
  const edgeTmp = useMemo(() => new THREE.Color(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const hit = useMemo(() => new THREE.Vector3(9999, 9999, 0), [])

  useEffect(() => {
    const move = (e) => {
      ptr.current.x = e.clientX
      ptr.current.y = e.clientY
      ptr.current.on = true
    }
    const leave = () => {
      ptr.current.on = false
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [])

  useFrame(() => {
    const now = performance.now()
    const { cw, ch, cols, rows, depth } = grid
    const hd = depth / 2

    // Cursor → world point on the z=0 plane → which single cube it's over.
    let cell = -1
    if (ptr.current.on) {
      ndc.set((ptr.current.x / size.width) * 2 - 1, -(ptr.current.y / size.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      raycaster.ray.intersectPlane(plane, hit)
      const gx = hit.x + VIS_W / 2
      const gy = hit.y + VIS_H / 2
      if (gx >= 0 && gy >= 0 && gx < VIS_W && gy < VIS_H) {
        cell = Math.floor(gy / ch) * cols + Math.floor(gx / cw)
      }
    } else {
      hit.set(9999, 9999, 0)
    }

    // Touch = entering a NEW cube. Triggers it only if it's currently idle, so a
    // re-press needs the cursor to leave and come back (it won't retrigger while
    // the cursor simply rests on it).
    if (cell !== lastCell.current) {
      if (cell >= 0 && cell < count && pressedAt[cell] === 0) pressedAt[cell] = now
      lastCell.current = cell
    }

    const m = meshRef.current
    const l = lineRef.current
    if (!m || !l) return
    for (let k = 0; k < count; k++) {
      // target depth: down while within the 5s window, otherwise back up
      let target = 0
      if (pressedAt[k] !== 0) {
        if (now - pressedAt[k] < HOLD_MS) target = depth
        else if (heights[k] < 0.01) pressedAt[k] = 0 // fully risen → idle again
      }
      let h = heights[k]
      h += (target - h) * EASE
      if (h < 0.0005) h = 0
      heights[k] = h

      const p = grid.positions[k]
      dummy.position.set(p[0], p[1], -h - hd) // top face sits at z = -h
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
      l.setMatrixAt(k, dummy.matrix)

      // brighten the cyan edges in proportion to how far the cube is pressed
      const t = depth > 0 ? Math.min(1, h / depth) : 0
      edgeTmp.copy(edgeIdle).lerp(edgeHot, t)
      l.setColorAt(k, edgeTmp)
    }
    m.instanceMatrix.needsUpdate = true
    l.instanceMatrix.needsUpdate = true
    if (l.instanceColor) l.instanceColor.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#3a3550" />
      <pointLight
        color="#8f7dff"
        intensity={10}
        distance={24}
        decay={1.1}
        position={[VIS_W * 0.42, VIS_H * 0.12, 3.2]}
      />
      <pointLight
        color="#ff8fd0"
        intensity={6}
        distance={24}
        decay={1.2}
        position={[VIS_W * 0.5, -VIS_H * 0.4, 3]}
      />

      <instancedMesh
        ref={meshRef}
        key={`box-${count}`}
        args={[cubeGeo, cubeMats, count]}
        frustumCulled={false}
      />

      <instancedMesh ref={lineRef} key={`edge-${count}`} args={[frameGeo, undefined, count]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
      </instancedMesh>
    </>
  )
}

/**
 * WebGL interactive grid of real 3D cubes. The cube directly under the cursor
 * acts like a button: touch it and it presses DOWN, holds for 5s, then rises on
 * its own — even if the cursor stays. Neighbours never move. Each cube shows its
 * full 12-edge outline. Sits behind all content; interactive path only.
 */
export default function GridField() {
  return (
    <div className="grid-field" aria-hidden="true">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 12.07], fov: 45, near: 0.1, far: 100 }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
