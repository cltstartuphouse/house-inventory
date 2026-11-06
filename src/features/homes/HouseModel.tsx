import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DOORS, ROOMS } from '../../lib/layout'
import { buildHouse } from './buildHouse'
import type { HouseParts } from './buildHouse'

export type ViewMode = 'outside' | 'inside' | 'basement'

const CAMERAS: Record<ViewMode, { position: [number, number, number]; target: [number, number, number] }> = {
  outside: { position: [-27, 15, 32], target: [-1, 3.5, 1] },
  inside: { position: [-1.5, 31, 13], target: [-1.5, 0, 1.5] },
  basement: { position: [0, 22, 11], target: [0, 0, -1.5] },
}

function labelPosition(id: string): THREE.Vector3 {
  const room = ROOMS.find((candidate) => candidate.id === id)
  if (!room) return new THREE.Vector3()
  if (id === 'A') return new THREE.Vector3(-3, 0.4, 8.6)
  return new THREE.Vector3((room.x0 + room.x1) / 2, 0.4, (room.z0 + room.z1) / 2)
}

function visibleRooms(mode: ViewMode) {
  if (mode === 'outside') return []
  if (mode === 'basement') return ROOMS.filter((room) => room.level === 'basement')
  return ROOMS.filter((room) => room.level !== 'basement')
}

type Props = {
  mode: ViewMode
  selectedId: string | null
  counts: Record<string, number>
  onSelect: (roomId: string) => void
}

export default function HouseModel({ mode, selectedId, counts, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const partsRef = useRef<HouseParts | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const labelRefs = useRef(new Map<string, HTMLElement>())
  const modeRef = useRef(mode)
  const onSelectRef = useRef(onSelect)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'house-canvas'
    container.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 300)
    cameraRef.current = camera

    scene.add(new THREE.HemisphereLight('#ffffff', '#8a8f7a', 1.5))
    const sun = new THREE.DirectionalLight('#fff3df', 2.4)
    sun.position.set(-20, 32, 22)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const reach = 30
    sun.shadow.camera.left = -reach
    sun.shadow.camera.right = reach
    sun.shadow.camera.top = reach
    sun.shadow.camera.bottom = -reach
    sun.shadow.camera.far = 90
    sun.shadow.bias = -0.0005
    scene.add(sun)

    const parts = buildHouse()
    partsRef.current = parts
    scene.add(parts.root)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 14
    controls.maxDistance = 110
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controlsRef.current = controls

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    // A click selects a room's floor, unless the pointer moved to rotate the view.
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downX = 0
    let downY = 0
    const onPointerDown = (event: PointerEvent) => {
      downX = event.clientX
      downY = event.clientY
    }
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return
      const rooms = visibleRooms(modeRef.current)
      const targets = rooms.flatMap((room) => {
        const floor = parts.floors.get(room.id)
        return floor ? [floor] : []
      })
      if (!targets.length) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(targets)[0]
      if (!hit) return
      for (const [id, mesh] of parts.floors) {
        if (mesh === hit.object) onSelectRef.current(id)
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    // Keeps the HTML labels pinned to their spots in the 3D view.
    const point = new THREE.Vector3()
    const placeLabel = (key: string, position: THREE.Vector3) => {
      const element = labelRefs.current.get(key)
      if (!element) return
      point.copy(position).project(camera)
      const x = ((point.x + 1) / 2) * container.clientWidth
      const y = ((1 - point.y) / 2) * container.clientHeight
      element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
    }

    const doorPoints = DOORS.map(
      (door) => [door.id, new THREE.Vector3(door.x, 1.5, door.z)] as const,
    )
    const roomPoints = ROOMS.map((room) => [room.id, labelPosition(room.id)] as const)

    let frame = 0
    const render = () => {
      frame = requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
      for (const [id, position] of roomPoints) placeLabel(id, position)
      for (const [id, position] of doorPoints) placeLabel(id, position)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]
          for (const material of materials) {
            ;(material as THREE.MeshStandardMaterial).map?.dispose()
            material.dispose()
          }
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      partsRef.current = null
    }
  }, [])

  useEffect(() => {
    modeRef.current = mode
    const parts = partsRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!parts || !camera || !controls) return

    const groups = [...parts.outside, ...parts.inside, ...parts.basement]
    for (const group of groups) group.visible = false
    for (const group of parts[mode]) group.visible = true

    // Pull back on narrow screens so the whole house still fits.
    const preset = CAMERAS[mode]
    const pullBack = Math.max(1, 1.15 / camera.aspect)
    controls.target.set(...preset.target)
    camera.position
      .set(...preset.position)
      .sub(controls.target)
      .multiplyScalar(pullBack)
      .add(controls.target)
    controls.update()
  }, [mode, failed])

  useEffect(() => {
    partsRef.current?.setSelected(selectedId)
  }, [selectedId])

  if (failed) {
    return (
      <div className="house-fallback" role="status">
        <p>This browser can't show the 3D model. Pick a room from the list instead.</p>
      </div>
    )
  }

  const rooms = visibleRooms(mode)
  const setLabelRef = (key: string) => (element: HTMLElement | null) => {
    if (element) labelRefs.current.set(key, element)
    else labelRefs.current.delete(key)
  }

  return (
    <div className="house-stage" ref={containerRef}>
      {rooms.map((room) => (
        <button
          key={room.id}
          ref={setLabelRef(room.id)}
          type="button"
          className={`room-tag${selectedId === room.id ? ' is-selected' : ''}${
            (room.x1 - room.x0) * (room.z1 - room.z0) <= 8 ? ' is-small' : ''
          }`}
          title={room.name}
          aria-pressed={selectedId === room.id}
          aria-label={`${room.id}, ${room.name}, ${counts[room.id] ?? 0} items`}
          onClick={() => onSelect(room.id)}
        >
          <b>{room.id}</b>
          <span className="room-tag-name">{room.name}</span>
        </button>
      ))}
      {mode === 'inside' &&
        DOORS.map((door) => (
          <span
            key={door.id}
            ref={setLabelRef(door.id)}
            className="door-tag"
            title={door.label}
          >
            {door.id}
          </span>
        ))}
    </div>
  )
}
