export type Category = 'furniture' | 'consumable' | 'equipment' | 'cleaning'

export const CATEGORY_LABELS: Record<Category, string> = {
  furniture: 'Furniture',
  consumable: 'Consumable',
  equipment: 'Equipment',
  cleaning: 'Cleaning',
}

export type Checkout = {
  id: string
  /** Event name only. Never store who checked something out. */
  event: string
  quantity: number
  /** ISO date string. */
  at: string
}

export type Item = {
  id: string
  name: string
  category: Category
  /** Labeled spot where the item lives, like "A2". The letter is the area. */
  spot: string
  quantity: number
  /** What one of these is called, like "bag". Used for consumables. */
  unit: string
  /** For consumables: flag it as low at or below this amount. */
  lowAt: number | null
  /** Small re-encoded image data URL, kept on this device. */
  photo: string | null
  checkouts: Checkout[]
}

export type SetupLine = {
  itemId: string
  quantity: number
  /** Area letter where this goes for the event. */
  placeIn: string
  /** True if the amount grows and shrinks with the headcount. */
  scales: boolean
}

export type EventSetup = {
  id: string
  name: string
  /** The headcount the taught quantities are for. */
  baseGuests: number
  lines: SetupLine[]
}
