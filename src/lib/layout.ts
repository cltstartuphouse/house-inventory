// The house map. Everything is in rough meters: x runs left to right when you
// face the front door, and z runs from the back of the house (-) to the street (+).
//
// PLACEHOLDER: the room positions and doors are a best guess. Nobody has measured
// the house yet. To correct the map, change the numbers here. The 3D model and the
// labels are drawn from this file.

export type Level = 'porch' | 'ground' | 'basement'

export type Room = {
  /** Area letter. Spots in this area are A1, A2 and so on. */
  id: string
  name: string
  level: Level
  x0: number
  x1: number
  z0: number
  z1: number
  spots: number
}

export const ROOMS: Room[] = [
  { id: 'A', name: 'Front Porch', level: 'porch', x0: -8, x1: 8, z0: 7, z1: 10, spots: 2 },
  { id: 'B', name: 'Foyer', level: 'ground', x0: 0.5, x1: 4, z0: -1, z1: 7, spots: 2 },
  { id: 'C', name: 'Parlor', level: 'ground', x0: -4, x1: 0.5, z0: 2, z1: 7, spots: 2 },
  { id: 'D', name: 'Sun Room', level: 'ground', x0: -8, x1: -4, z0: 2, z1: 7, spots: 2 },
  { id: 'E', name: 'Living Room', level: 'ground', x0: -8, x1: -1, z0: -3, z1: 2, spots: 3 },
  { id: 'F', name: 'Cleaning Closet', level: 'ground', x0: -1, x1: 0.5, z0: -1, z1: 2, spots: 1 },
  { id: 'G', name: 'Study', level: 'ground', x0: 4, x1: 8, z0: 1, z1: 7, spots: 2 },
  { id: 'H', name: 'Study Closet', level: 'ground', x0: 4, x1: 8, z0: -1, z1: 1, spots: 2 },
  { id: 'I', name: 'Back Room', level: 'ground', x0: -8, x1: -1, z0: -7, z1: -3, spots: 3 },
  { id: 'J', name: 'Kitchen', level: 'ground', x0: -1, x1: 8, z0: -7, z1: -1, spots: 4 },
  { id: 'K', name: 'Basement', level: 'basement', x0: -6, x1: 6, z0: -6, z1: 3, spots: 3 },
]

export type Door = {
  id: string
  label: string
  x: number
  z: number
  /** The direction the wall runs at this door. */
  along: 'x' | 'z'
}

export const DOORS: Door[] = [
  { id: 'D1', label: 'Front door', x: 2.25, z: 7, along: 'x' },
  { id: 'D2', label: 'Foyer to Parlor', x: 0.5, z: 4.5, along: 'z' },
  { id: 'D3', label: 'Foyer to Study', x: 4, z: 4, along: 'z' },
  { id: 'D4', label: 'Foyer to Kitchen', x: 2.25, z: -1, along: 'x' },
  { id: 'D5', label: 'Parlor to Sun Room', x: -4, z: 4.5, along: 'z' },
  { id: 'D6', label: 'Parlor to Living Room', x: -2.5, z: 2, along: 'x' },
  { id: 'D7', label: 'Living Room to Back Room', x: -4.5, z: -3, along: 'x' },
  { id: 'D8', label: 'Living Room to Cleaning Closet', x: -1, z: 0.5, along: 'z' },
  { id: 'D9', label: 'Study to Study Closet', x: 6, z: 1, along: 'x' },
  { id: 'D10', label: 'Kitchen to Back Room', x: -1, z: -5, along: 'z' },
]

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((room) => room.id === id)
}

export function roomForSpot(spot: string): Room | undefined {
  return getRoom(spot.charAt(0).toUpperCase())
}

export function spotsFor(room: Room): string[] {
  return Array.from({ length: room.spots }, (_, i) => `${room.id}${i + 1}`)
}

export function doorsFor(room: Room): Door[] {
  return DOORS.filter((door) => {
    const onX = door.x >= room.x0 && door.x <= room.x1
    const onZ = door.z >= room.z0 && door.z <= room.z1
    if (!onX || !onZ) return false
    return door.along === 'x'
      ? door.z === room.z0 || door.z === room.z1
      : door.x === room.x0 || door.x === room.x1
  })
}
