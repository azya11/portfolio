import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// World is sized so the visible height at z=0 is VIS_H units (see camera dist).
const VIS_H = 10
const CELL_PX = 64 // target on-screen cell size
const RADIUS = 2.4 // world radius of cursor influence
const MAX_DEPTH = 1.8 // how far cells press DOWN, away from the viewer
const BASE = 6 // slab thickness below the surface (so pressed walls have height)
const EASE = 0.12 // lower = heavier / slower settle

function GridLines({ grid, z = 0.01 }) {
  const geo = useMemo(() => {
    const { cols, rows, cw, ch } = grid
    const W = cw * cols
    const H = ch * rows
    const pts = []
    for (let i = 0; i <= cols; i++) {
      const x = -W / 2 + cw * i
      pts.push(x, -H / 2, z, x, H / 2, z)
    }
    for (let j = 0; j <= rows; j++) {
      const y = -H / 2 + ch * j
      pts.push(-W / 2, y, z, W / 2, y, z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [grid, z])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#9fb2cc" transparent opacity={0.1} />
    </lineSegments>
  )
}

function Scene() {
  const { size, camera } = useThree()
  const meshRef = useRef()
  const magentaRef = useRef()
  const ptr = useRef({ x: 0, y: 0, on: false })

  const aspect = size.width / size.height
  const VIS_W = VIS_H * aspect

  const grid = useMemo(() => {
    const cols = Math.max(6, Math.round(size.width / CELL_PX))
    const rows = Math.max(6, Math.round(size.height / CELL_PX))
    const cw = VIS_W / cols
    const ch = VIS_H / rows
    const positions = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        positions.push([-VIS_W / 2 + cw * (i + 0.5), -VIS_H / 2 + ch * (j + 0.5)])
      }
    }
    return { cols, rows, cw, ch, positions }
  }, [size.width, size.height, VIS_W])

  const count = grid.positions.length
  const heights = useMemo(() => new Float32Array(count), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])
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
    // Cursor → world point on the z=0 plane.
    if (ptr.current.on) {
      ndc.set((ptr.current.x / size.width) * 2 - 1, -(ptr.current.y / size.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      raycaster.ray.intersectPlane(plane, hit)
    } else {
      hit.set(9999, 9999, 0)
    }

    if (magentaRef.current) {
      magentaRef.current.position.set(hit.x, hit.y, 3.2)
      magentaRef.current.intensity = ptr.current.on ? 16 : 0
    }

    const m = meshRef.current
    if (!m) return
    const R2 = RADIUS * RADIUS
    const { cw, ch } = grid
    for (let k = 0; k < count; k++) {
      const p = grid.positions[k]
      const dx = p[0] - hit.x
      const dy = p[1] - hit.y
      const d2 = dx * dx + dy * dy
      let depth = 0
      if (d2 < R2) {
        const f = 1 - Math.sqrt(d2) / RADIUS
        depth = MAX_DEPTH * (f * f * (3 - 2 * f)) // smoothstep falloff
      }
      let h = heights[k]
      h += (depth - h) * EASE // h = current press depth (0 at rest)
      heights[k] = h
      // Cell fills its full grid square; its top sits at z=-h (pressed down),
      // its body extends to z=-BASE so neighbouring walls have height to show.
      const sz = BASE - h
      dummy.position.set(p[0], p[1], (-h - BASE) / 2)
      dummy.scale.set(cw, ch, sz)
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.2} color="#2b3856" />
      <pointLight ref={magentaRef} color="#ff2e7e" intensity={0} distance={16} decay={1.3} />
      <pointLight
        color="#16e0c8"
        intensity={11}
        distance={22}
        decay={1.2}
        position={[VIS_W * 0.42, VIS_H * 0.12, 3.2]}
      />
      <pointLight
        color="#16e0c8"
        intensity={5}
        distance={22}
        decay={1.3}
        position={[VIS_W * 0.5, -VIS_H * 0.4, 3]}
      />

      <GridLines grid={grid} />

      <instancedMesh ref={meshRef} key={count} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a0e14" roughness={0.5} metalness={0.18} />
      </instancedMesh>
    </>
  )
}

/**
 * WebGL interactive grid. Squares are real extruded boxes that rise toward the
 * viewer near the cursor (showing their side walls), washed by a magenta light
 * that follows the cursor and static teal lights. Sits behind all content.
 * Only mounted on the interactive (non-touch, non-reduced-motion) path by App.
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
