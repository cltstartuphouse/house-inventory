import * as THREE from 'three'
import { DOORS, ROOMS } from '../../lib/layout'
import type { Room } from '../../lib/layout'

// Builds the empty house: outside shell, porch, one open floor to look into and
// the basement. No furniture. Room positions come from lib/layout.ts.

const COLORS = {
  siding: '#f4f1e8',
  trim: '#ffffff',
  roof: '#6c737c',
  porchRoof: '#7fa39c',
  shutter: '#23262b',
  glass: '#33454f',
  door: '#5f8f8a',
  brick: '#8a4b3c',
  porchFloor: '#d9d8d0',
  wood: '#b98a5a',
  sunRoom: '#d8c5a2',
  closet: '#9c7a57',
  kitchen: '#c9c2b4',
  concrete: '#a8a59d',
  wall: '#ece8dd',
  grass: '#8aa06f',
  pavement: '#7d7d7a',
  hedge: '#4d6b45',
  selected: '#e0a030',
}

export type HouseParts = {
  root: THREE.Group
  outside: THREE.Object3D[]
  inside: THREE.Object3D[]
  basement: THREE.Object3D[]
  floors: Map<string, THREE.Mesh>
  setSelected: (roomId: string | null) => void
}

function mat(color: string, options: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...options })
}

/** A box given its min and max corners. */
function box(
  x0: number, x1: number,
  y0: number, y1: number,
  z0: number, z1: number,
  material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0),
    material,
  )
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function sidingMaterial() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = COLORS.siding
    context.fillRect(0, 0, 64, 64)
    context.fillStyle = '#d6d2c5'
    for (let y = 0; y < 64; y += 16) context.fillRect(0, y, 64, 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 12)
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 })
}

function triangles(points: number[], material: THREE.Material): THREE.Mesh {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** A hipped roof with its ridge running along x. */
function hipRoof(
  width: number, depth: number, height: number, inset: number,
  material: THREE.Material,
): THREE.Mesh {
  const w = width / 2
  const d = depth / 2
  const r = w - inset
  return triangles(
    [
      -w, 0, d, w, 0, d, r, height, 0,
      -w, 0, d, r, height, 0, -r, height, 0,
      w, 0, -d, -w, 0, -d, -r, height, 0,
      w, 0, -d, -r, height, 0, r, height, 0,
      w, 0, d, w, 0, -d, r, height, 0,
      -w, 0, -d, -w, 0, d, -r, height, 0,
    ],
    material,
  )
}

/** A gable roof with its ridge running along z and white triangles on the ends. */
function gableRoof(
  width: number, length: number, height: number,
  roofMaterial: THREE.Material, endMaterial: THREE.Material,
): THREE.Group {
  const w = width / 2
  const l = length / 2
  const group = new THREE.Group()
  group.add(
    triangles(
      [
        -w, 0, l, 0, height, l, 0, height, -l,
        -w, 0, l, 0, height, -l, -w, 0, -l,
        w, 0, -l, 0, height, -l, 0, height, l,
        w, 0, -l, 0, height, l, w, 0, l,
      ],
      roofMaterial,
    ),
  )
  const end = l - 0.3
  const inner = w - 0.3
  const top = height - 0.3
  group.add(
    triangles(
      [
        -inner, 0, end, inner, 0, end, 0, top, end,
        inner, 0, -end, -inner, 0, -end, 0, top, -end,
      ],
      endMaterial,
    ),
  )
  return group
}

type Face = 'front' | 'back' | 'left' | 'right'

function addWindow(
  parent: THREE.Object3D,
  face: Face, along: number, y: number,
  width: number, height: number,
  materials: { trim: THREE.Material; glass: THREE.Material; shutter: THREE.Material },
  shutters = true,
) {
  const group = new THREE.Group()
  const offset = 0.03
  if (face === 'front') group.position.set(along, y, 7 + offset)
  if (face === 'back') {
    group.position.set(along, y, -7 - offset)
    group.rotation.y = Math.PI
  }
  if (face === 'right') {
    group.position.set(8 + offset, y, along)
    group.rotation.y = Math.PI / 2
  }
  if (face === 'left') {
    group.position.set(-8 - offset, y, along)
    group.rotation.y = -Math.PI / 2
  }
  const w = width / 2
  const h = height / 2
  group.add(box(-w - 0.1, w + 0.1, -h - 0.1, h + 0.1, 0, 0.03, materials.trim))
  group.add(box(-w, w, -h, h, 0.03, 0.05, materials.glass))
  group.add(box(-0.03, 0.03, -h, h, 0.05, 0.07, materials.trim))
  group.add(box(-w, w, -0.03, 0.03, 0.05, 0.07, materials.trim))
  if (shutters) {
    group.add(box(-w - 0.55, -w - 0.12, -h, h, 0, 0.06, materials.shutter))
    group.add(box(w + 0.12, w + 0.55, -h, h, 0, 0.06, materials.shutter))
  }
  parent.add(group)
}

/** The porch outline: across the front, around a curved corner, up the left side. */
function porchShape(overhang: number): THREE.Shape {
  const o = overhang
  const shape = new THREE.Shape()
  shape.moveTo(8 + o, -7)
  shape.lineTo(8 + o, -10 - o)
  shape.lineTo(-8, -10 - o)
  shape.absarc(-8, -7, 3 + o, (3 * Math.PI) / 2, Math.PI, true)
  shape.lineTo(-11 - o, 1)
  shape.lineTo(-8, 1)
  shape.lineTo(-8, -7)
  shape.closePath()
  return shape
}

function porchSlab(overhang: number, y: number, thick: number, material: THREE.Material) {
  const geometry = new THREE.ExtrudeGeometry(porchShape(overhang), {
    depth: thick,
    bevelEnabled: false,
    curveSegments: 24,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, y, 0)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Points along the porch's outer edge, used for the railing and columns. */
function porchEdge(): [number, number][] {
  const points: [number, number][] = [[7.85, 9.85]]
  const r = 2.85
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI / 2 + (i / 10) * (Math.PI / 2)
    points.push([-8 + Math.cos(angle) * r, 7 + Math.sin(angle) * r])
  }
  points.push([-10.85, 1])
  return points
}

const STEP_GAP = { x0: 1.1, x1: 3.4 }

function buildPorchDetails(
  parent: THREE.Object3D,
  columnParent: THREE.Object3D,
  trim: THREE.Material,
) {
  const edge = porchEdge()
  const inGap = (x: number, z: number) =>
    z > 9.5 && x > STEP_GAP.x0 && x < STEP_GAP.x1

  // Top and bottom rails.
  const addRail = (ax: number, az: number, bx: number, bz: number) => {
    const length = Math.hypot(bx - ax, bz - az)
    if (length < 0.01) return
    for (const y of [0.25, 1.0]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.07, 0.09), trim)
      rail.position.set((ax + bx) / 2, y, (az + bz) / 2)
      rail.rotation.y = -Math.atan2(bz - az, bx - ax)
      rail.castShadow = true
      parent.add(rail)
    }
  }

  const balusters: [number, number][] = []
  const columns: [number, number][] = []
  let sinceColumn = 0

  edge.slice(0, -1).forEach(([ax, az], index) => {
    const [bx, bz] = edge[index + 1]
    const length = Math.hypot(bx - ax, bz - az)
    const steps = Math.max(1, Math.round(length / 0.22))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = ax + (bx - ax) * t
      const z = az + (bz - az) * t
      if (!inGap(x, z)) balusters.push([x, z])
      sinceColumn += length / steps
      if (sinceColumn > 3.8 && !inGap(x, z)) {
        columns.push([x, z])
        sinceColumn = 0
      }
    }
    if (az > 9.5 && bz > 9.5 && ax > STEP_GAP.x1 && bx < STEP_GAP.x0) {
      addRail(ax, az, STEP_GAP.x1, az)
      addRail(STEP_GAP.x0, az, bx, bz)
    } else {
      addRail(ax, az, bx, bz)
    }
  })
  columns.push(
    [7.85, 9.85],
    [STEP_GAP.x0, 9.85],
    [STEP_GAP.x1, 9.85],
    [-10.85, 1],
  )

  const balusterMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.05, 0.75, 0.05),
    trim,
    balusters.length,
  )
  const matrix = new THREE.Matrix4()
  balusters.forEach(([x, z], i) => {
    matrix.setPosition(x, 0.62, z)
    balusterMesh.setMatrixAt(i, matrix)
  })
  balusterMesh.castShadow = true
  parent.add(balusterMesh)

  for (const [x, z] of columns) {
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 3.2, 12),
      trim,
    )
    column.position.set(x, 1.65, z)
    column.castShadow = true
    columnParent.add(column)
  }
}

function buildSite(root: THREE.Group, trim: THREE.Material) {
  const site = new THREE.Group()
  const ground = box(-26, 26, -0.72, -0.62, -20, 22, mat(COLORS.grass))
  ground.castShadow = false
  site.add(ground)
  const pavement = mat(COLORS.pavement)
  const lot = box(-26, 26, -0.62, -0.6, -20, -11, pavement)
  lot.castShadow = false
  site.add(lot)
  const street = box(-26, 26, -0.62, -0.6, 15, 22, pavement)
  street.castShadow = false
  site.add(street)
  const walk = box(1.1, 3.4, -0.62, -0.59, 10.8, 15, mat(COLORS.porchFloor))
  walk.castShadow = false
  site.add(walk)

  // Front steps.
  for (let i = 0; i < 3; i++) {
    const front = 10 + (3 - i) * 0.28
    site.add(box(STEP_GAP.x0, STEP_GAP.x1, -0.6, -0.6 + (i + 1) * 0.2, 10, front, trim))
  }

  // Low hedges along the porch.
  const hedge = mat(COLORS.hedge)
  site.add(box(-8, 0.9, -0.6, 0.15, 10.2, 11, hedge))
  site.add(box(3.6, 8, -0.6, 0.15, 10.2, 11, hedge))
  site.add(box(-11.9, -11.2, -0.6, 0.15, 1, 6, hedge))

  root.add(site)
  return site
}

function buildOutside(root: THREE.Group, trim: THREE.Material) {
  const outside = new THREE.Group()
  const roof = mat(COLORS.roof)
  const siding = sidingMaterial()
  const windowMaterials = {
    trim,
    glass: mat(COLORS.glass, { roughness: 0.2, metalness: 0.3 }),
    shutter: mat(COLORS.shutter),
  }

  outside.add(box(-8, 8, 0, 7, -7, 7, siding))

  // Main roof with a crossing gable on the front right and one on the left side.
  const main = hipRoof(16.9, 14.9, 4.8, 4, roof)
  main.position.set(0, 7, 0)
  outside.add(main)

  const frontGable = gableRoof(6.4, 9.2, 4.4, roof, siding)
  frontGable.position.set(4.8, 7, 3.2)
  outside.add(frontGable)

  const sideGable = gableRoof(5.6, 9.4, 4, roof, siding)
  sideGable.rotation.y = -Math.PI / 2
  sideGable.position.set(-4, 7, -2.5)
  outside.add(sideGable)

  const brick = mat(COLORS.brick)
  outside.add(box(-1.2, -0.2, 7, 12.8, -1.2, -0.2, brick))
  outside.add(box(2.6, 3.4, 7, 12, -4.5, -3.7, brick))

  // Front door, teal like the real one.
  outside.add(box(1.55, 2.95, 0, 2.85, 7, 7.06, trim))
  outside.add(box(1.7, 2.8, 0, 2.5, 7.06, 7.1, mat(COLORS.door)))

  const w = windowMaterials
  // Lower floor, front. Tall and shuttered, with a glassy Sun Room corner.
  addWindow(outside, 'front', -1.6, 1.6, 1.1, 2.3, w)
  addWindow(outside, 'front', 5.8, 1.6, 1.1, 2.3, w)
  for (const x of [-7.2, -6.2, -5.2, -4.2]) {
    addWindow(outside, 'front', x, 1.6, 0.85, 2.3, w, false)
  }
  // Upper floor, front.
  for (const x of [-5.8, -1.6, 2.25, 5.8]) {
    addWindow(outside, 'front', x, 5.1, 1, 2, w)
  }
  // Left side.
  for (const z of [5.8, 4.8, 3.8, 2.8]) {
    addWindow(outside, 'left', z, 1.6, 0.85, 2.3, w, false)
  }
  for (const z of [-1, -5]) addWindow(outside, 'left', z, 1.6, 1.1, 2.3, w)
  for (const z of [5, 0, -5]) addWindow(outside, 'left', z, 5.1, 1, 2, w)
  // Right side.
  for (const z of [5, 0, -5]) {
    addWindow(outside, 'right', z, 1.6, 1.1, 2.3, w)
    addWindow(outside, 'right', z, 5.1, 1, 2, w)
  }
  // Back.
  for (const x of [-5, 0, 5]) {
    addWindow(outside, 'back', x, 1.6, 1.1, 2.3, w)
    addWindow(outside, 'back', x, 5.1, 1, 2, w)
  }

  outside.add(porchSlab(0.3, 3.25, 0.2, mat(COLORS.porchRoof)))
  root.add(outside)
  return outside
}

function floorColor(room: Room): string {
  if (room.id === 'D') return COLORS.sunRoom
  if (room.id === 'F' || room.id === 'H') return COLORS.closet
  if (room.id === 'J') return COLORS.kitchen
  if (room.level === 'basement') return COLORS.concrete
  return COLORS.wood
}

/** The walls of one room, with gaps wherever a door sits on that wall. */
function addRoomWalls(
  parent: THREE.Object3D, room: Room, y0: number, height: number,
  material: THREE.Material,
) {
  const t = 0.07
  const DOOR_WIDTH = 1

  const run = (along: 'x' | 'z', fixed: number, from: number, to: number, inset: number) => {
    const gaps = DOORS.filter((door) =>
      along === 'x'
        ? door.along === 'x' && door.z === fixed && door.x > from && door.x < to
        : door.along === 'z' && door.x === fixed && door.z > from && door.z < to,
    )
      .map((door) => (along === 'x' ? door.x : door.z))
      .sort((a, b) => a - b)

    let start = from
    const segments: [number, number][] = []
    for (const center of gaps) {
      segments.push([start, center - DOOR_WIDTH / 2])
      start = center + DOOR_WIDTH / 2
    }
    segments.push([start, to])

    const c = fixed + inset
    for (const [a, b] of segments) {
      if (b - a < 0.01) continue
      parent.add(
        along === 'x'
          ? box(a, b, y0, y0 + height, c - t, c + t, material)
          : box(c - t, c + t, y0, y0 + height, a, b, material),
      )
    }
  }

  run('x', room.z0, room.x0, room.x1, t)
  run('x', room.z1, room.x0, room.x1, -t)
  run('z', room.x0, room.z0, room.z1, t)
  run('z', room.x1, room.z0, room.z1, -t)
}

function buildDoors(parent: THREE.Object3D) {
  const panel = mat(COLORS.door)
  const inner = mat('#c9b99f')
  for (const door of DOORS) {
    const material = door.id === 'D1' ? panel : inner
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.05), material)
    const hinge = new THREE.Group()
    leaf.position.set(0.45, 0.6, 0)
    leaf.castShadow = true
    hinge.add(leaf)
    if (door.along === 'x') {
      hinge.position.set(door.x - 0.5, 0.05, door.z)
      hinge.rotation.y = -1.2
    } else {
      hinge.position.set(door.x, 0.05, door.z - 0.5)
      hinge.rotation.y = -Math.PI / 2 + 1.2
    }
    parent.add(hinge)
  }
}

function buildInside(root: THREE.Group, floors: Map<string, THREE.Mesh>) {
  const inside = new THREE.Group()
  const walls = mat(COLORS.wall)
  inside.add(box(-8, 8, -0.6, -0.02, -7, 7, mat(COLORS.concrete)))

  for (const room of ROOMS.filter((candidate) => candidate.level === 'ground')) {
    const floor = box(room.x0, room.x1, -0.02, 0.05, room.z0, room.z1, mat(floorColor(room)))
    floor.castShadow = false
    floors.set(room.id, floor)
    inside.add(floor)
    addRoomWalls(inside, room, 0.05, 1.3, walls)
  }
  buildDoors(inside)

  // Fixed features that help people get their bearings: the foyer stairs and the mantel.
  for (let i = 0; i < 11; i++) {
    const z = 2.2 + i * 0.28
    inside.add(box(2.6, 3.8, 0.05, 0.05 + (11 - i) * 0.12, z, z + 0.28, mat('#8b5a33')))
  }
  inside.add(box(-1.45, -1.13, 0.05, 1.1, -1, 0, mat(COLORS.shutter)))

  root.add(inside)
  return inside
}

function buildBasement(root: THREE.Group, floors: Map<string, THREE.Mesh>) {
  const basement = new THREE.Group()
  const room = ROOMS.find((candidate) => candidate.level === 'basement')
  if (room) {
    const floor = box(room.x0, room.x1, -0.1, 0.05, room.z0, room.z1, mat(floorColor(room)))
    floor.castShadow = false
    floors.set(room.id, floor)
    basement.add(floor)
    addRoomWalls(basement, room, 0.05, 1.3, mat('#c4c0b5'))
    for (let i = 0; i < 9; i++) {
      const x = room.x1 - 1.5 - i * 0.28
      basement.add(box(x, x + 0.28, 0.05, 0.05 + (i + 1) * 0.13, room.z0 + 0.2, room.z0 + 1.2, mat('#8b8476')))
    }
  }
  root.add(basement)
  return basement
}

export function buildHouse(): HouseParts {
  const root = new THREE.Group()
  const floors = new Map<string, THREE.Mesh>()
  const trim = mat(COLORS.trim)

  const site = buildSite(root, trim)
  const outside = buildOutside(root, trim)
  const inside = buildInside(root, floors)
  const basement = buildBasement(root, floors)

  // The porch shows from outside and in the look-inside view.
  const porch = new THREE.Group()
  const porchFloor = porchSlab(0, -0.25, 0.3, mat(COLORS.porchFloor))
  floors.set('A', porchFloor)
  porch.add(porchFloor)
  porch.add(porchSlab(0, -0.6, 0.35, mat('#c8c5ba')))
  buildPorchDetails(porch, outside, trim)
  root.add(porch)

  const baseColors = new Map<string, THREE.Color>()
  floors.forEach((mesh, id) => {
    baseColors.set(id, (mesh.material as THREE.MeshStandardMaterial).color.clone())
  })
  const highlight = new THREE.Color(COLORS.selected)

  return {
    root,
    outside: [site, outside, porch],
    inside: [site, inside, porch],
    basement: [basement],
    floors,
    setSelected(roomId) {
      floors.forEach((mesh, id) => {
        const color = (mesh.material as THREE.MeshStandardMaterial).color
        color.copy(id === roomId ? highlight : (baseColors.get(id) as THREE.Color))
      })
    },
  }
}
