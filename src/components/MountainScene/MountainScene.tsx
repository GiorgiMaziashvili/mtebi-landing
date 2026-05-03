import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, Vignette, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Suspense, useMemo, useEffect, useRef } from 'react'
import {
  FogExp2, Mesh, MeshStandardMaterial, DirectionalLight,
  PerspectiveCamera, Color,
} from 'three'
import gsap from 'gsap'
import styles from './MountainScene.module.css'

const SKY = '#c8d4e0'
const SKY_COLOR = new Color(SKY)
const BASE_FOV = 52
const CAMERA_START = { x: -200, y: 900, z: 1500 }

const SCROLL_KF = [
  { p: 0,    x: 0,   y: 280, z: 680 },
  { p: 0.4,  x: 180, y: 140, z: 380 },
  { p: 0.75, x: -60, y: 55,  z: 160 },
  { p: 1.0,  x: 0,   y: 18,  z: 40  },
]

function scrollCam(t: number) {
  let a = SCROLL_KF[0], b = SCROLL_KF[SCROLL_KF.length - 1]
  for (let i = 0; i < SCROLL_KF.length - 1; i++) {
    if (t >= SCROLL_KF[i].p && t <= SCROLL_KF[i + 1].p) {
      a = SCROLL_KF[i]; b = SCROLL_KF[i + 1]; break
    }
  }
  const s = b.p === a.p ? 0 : (t - a.p) / (b.p - a.p)
  return {
    x: a.x + (b.x - a.x) * s,
    y: a.y + (b.y - a.y) * s,
    z: a.z + (b.z - a.z) * s,
  }
}

// Lives under Suspense so it can call useLoader
function SceneContent() {
  const { scene, camera } = useThree()
  const obj = useLoader(OBJLoader, '/models/MountainTerrain.obj')

  const mouse     = useRef({ x: 0, y: 0 })
  const prevMouse = useRef({ x: 0, y: 0 })
  const smooth    = useRef({ x: 0, y: 0 })
  const base      = useRef({ ...CAMERA_START })
  const scrollT   = useRef(0)
  const introOver = useRef(false)
  const vel       = useRef(0)
  const sunRef    = useRef<DirectionalLight>(null!)
  const matRef    = useRef<MeshStandardMaterial | null>(null)

  const mesh = useMemo(() => {
    const clone = obj.clone()
    const mat = new MeshStandardMaterial({ color: '#6b7c63', roughness: 0.9 })
    matRef.current = mat
    clone.traverse(c => { if ((c as Mesh).isMesh) (c as Mesh).material = mat })
    return clone
  }, [obj])

  useEffect(() => {
    scene.fog = new FogExp2(SKY, 0.0025)
    return () => { scene.fog = null }
  }, [scene])

  useEffect(() => {
    gsap.to(base.current, {
      x: SCROLL_KF[0].x, y: SCROLL_KF[0].y, z: SCROLL_KF[0].z,
      duration: 5,
      ease: 'power3.inOut',
      onComplete: () => { introOver.current = true },
    })
  }, [])

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollT.current = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // ── velocity ──────────────────────────────────────────────────────────
    const dvx = mouse.current.x - prevMouse.current.x
    const dvy = mouse.current.y - prevMouse.current.y
    vel.current = vel.current * 0.85 + Math.sqrt(dvx * dvx + dvy * dvy) * 0.15
    prevMouse.current.x = mouse.current.x
    prevMouse.current.y = mouse.current.y

    // ── smooth mouse ──────────────────────────────────────────────────────
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.03
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.03

    const v = vel.current
    const warmth = Math.min(v * 6, 1)

    // ── fog: breathing density + warm color shift on hover ────────────────
    if (scene.fog) {
      const fog = scene.fog as FogExp2
      fog.density = 0.0025 + Math.sin(t * 0.08) * 0.0005 + Math.sin(t * 0.21) * 0.0002
      fog.color.setRGB(
        SKY_COLOR.r + warmth * 0.14,
        SKY_COLOR.g + warmth * 0.02,
        SKY_COLOR.b - warmth * 0.14,
      )
    }

    // ── terrain emissive glow on hover ────────────────────────────────────
    if (matRef.current) {
      matRef.current.emissive.setRGB(warmth * 0.4, warmth * 0.15, 0)
      matRef.current.emissiveIntensity = warmth
    }

    // ── scroll-driven camera base ─────────────────────────────────────────
    if (introOver.current) {
      const kf = scrollCam(scrollT.current)
      base.current.x += (kf.x - base.current.x) * 0.04
      base.current.y += (kf.y - base.current.y) * 0.04
      base.current.z += (kf.z - base.current.z) * 0.04
    }

    // ── FOV warp ──────────────────────────────────────────────────────────
    const pc = camera as PerspectiveCamera
    pc.fov += (BASE_FOV + Math.min(v * 400, 20) - pc.fov) * 0.1
    pc.updateProjectionMatrix()

    // ── camera position + parallax + banking roll ─────────────────────────
    camera.position.set(
      base.current.x + smooth.current.x * 70,
      base.current.y - smooth.current.y * 35,
      base.current.z,
    )
    camera.lookAt(0, 0, 0)
    camera.rotateZ(-smooth.current.x * 0.05)

    // ── sun tracks mouse + flares on hover ────────────────────────────────
    if (sunRef.current) {
      sunRef.current.position.set(
        250 + smooth.current.x * 130,
        450,
        250 - smooth.current.y * 90,
      )
      sunRef.current.intensity = 1.8 + v * 4
    }
  })

  return (
    <>
      <primitive object={mesh} />
      <directionalLight ref={sunRef} position={[250, 450, 250]} intensity={1.8} />
    </>
  )
}

export function MountainScene() {
  return (
    <div className={styles.container}>
      <Canvas camera={{ position: [CAMERA_START.x, CAMERA_START.y, CAMERA_START.z], fov: BASE_FOV }}>
        <color attach="background" args={[SKY]} />
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
        <EffectComposer>
          <Bloom intensity={0.25} luminanceThreshold={0.75} luminanceSmoothing={0.9} />
          <Vignette offset={0.4} darkness={0.6} eskil={false} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
