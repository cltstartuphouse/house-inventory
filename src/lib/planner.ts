import type { EventSetup, Item } from '../types/item'
import { availableCount } from './store'

export type GetStep = {
  itemId: string
  name: string
  unit: string
  need: number
  spot: string
  placeIn: string
  /** How many short the house is, given what's already checked out. */
  shortBy: number
}

export type StockStep = {
  itemId: string
  name: string
  unit: string
  need: number
  have: number
  spot: string
  /** Enough to cover this event and still sit above the low-stock line. */
  buy: number
}

export type Plan = {
  setupName: string
  guests: number
  get: GetStep[]
  stock: StockStep[]
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
]

/** Finds the headcount in text like "8", "having 8 people over" or "eight guests". */
export function parseGuestCount(text: string): number | null {
  const digits = text.match(/\d+/)
  if (digits) return Number(digits[0])
  const words = text.toLowerCase().match(/[a-z]+/g) ?? []
  for (const word of words) {
    const index = NUMBER_WORDS.indexOf(word)
    if (index > 0) return index
  }
  return null
}

export function buildPlan(
  setup: EventSetup,
  guests: number,
  items: Item[],
): Plan {
  const plan: Plan = { setupName: setup.name, guests, get: [], stock: [] }

  for (const line of setup.lines) {
    const item = items.find((candidate) => candidate.id === line.itemId)
    if (!item) continue

    const need = line.scales
      ? Math.ceil((line.quantity * guests) / setup.baseGuests)
      : line.quantity

    if (item.category === 'consumable') {
      plan.stock.push({
        itemId: item.id,
        name: item.name,
        unit: item.unit,
        need,
        have: item.quantity,
        spot: item.spot,
        buy: Math.max(0, need + (item.lowAt ?? 0) - item.quantity),
      })
    } else {
      plan.get.push({
        itemId: item.id,
        name: item.name,
        unit: item.unit,
        need,
        spot: item.spot,
        placeIn: line.placeIn,
        shortBy: Math.max(0, need - availableCount(item)),
      })
    }
  }

  return plan
}

export function plural(count: number, unit: string): string {
  if (count === 1 || unit.endsWith('s')) return unit
  return /(x|ch|sh)$/.test(unit) ? `${unit}es` : `${unit}s`
}
