import { useEffect, useReducer, useState } from 'react'
import sampleItems from '../../data/sample-items.json'
import sampleSetups from '../../data/sample-setups.json'
import type { EventSetup, Item } from '../types/item'

// All data lives in this browser for now. To move to a hosted database, replace
// loadState and saveState, and keep the actions below the same.

export type State = {
  items: Item[]
  setups: EventSetup[]
}

export type Action =
  | { type: 'addItem'; item: Item }
  | { type: 'removeItem'; id: string }
  | { type: 'adjustStock'; id: string; delta: number }
  | { type: 'checkOut'; id: string; event: string; quantity: number }
  | { type: 'checkIn'; id: string; checkoutId: string }
  | { type: 'addSetup'; setup: EventSetup }
  | { type: 'removeSetup'; id: string }
  | { type: 'reset' }

const STORAGE_KEY = 'house-inventory:v1'

function seedState(): State {
  return {
    items: sampleItems as Item[],
    setups: sampleSetups as EventSetup[],
  }
}

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as State
      if (Array.isArray(parsed.items) && Array.isArray(parsed.setups)) {
        return parsed
      }
    }
  } catch {
    // Blocked or corrupted storage: start over from the sample data.
  }
  return seedState()
}

/** Returns false if the browser couldn't save, usually because storage is full. */
function saveState(state: State): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}

export function checkedOutCount(item: Item): number {
  return item.checkouts.reduce((sum, checkout) => sum + checkout.quantity, 0)
}

export function availableCount(item: Item): number {
  return item.quantity - checkedOutCount(item)
}

export function isLow(item: Item): boolean {
  return (
    item.category === 'consumable' &&
    item.lowAt !== null &&
    item.quantity <= item.lowAt
  )
}

function updateItem(
  state: State,
  id: string,
  change: (item: Item) => Item,
): State {
  return {
    ...state,
    items: state.items.map((item) => (item.id === id ? change(item) : item)),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addItem':
      return { ...state, items: [action.item, ...state.items] }
    case 'removeItem':
      return {
        items: state.items.filter((item) => item.id !== action.id),
        setups: state.setups.map((setup) => ({
          ...setup,
          lines: setup.lines.filter((line) => line.itemId !== action.id),
        })),
      }
    case 'adjustStock':
      return updateItem(state, action.id, (item) => ({
        ...item,
        quantity: Math.max(0, item.quantity + action.delta),
      }))
    case 'checkOut':
      return updateItem(state, action.id, (item) => {
        const quantity = Math.min(action.quantity, availableCount(item))
        if (quantity <= 0) return item
        return {
          ...item,
          checkouts: [
            ...item.checkouts,
            {
              id: newId(),
              event: action.event,
              quantity,
              at: new Date().toISOString(),
            },
          ],
        }
      })
    case 'checkIn':
      return updateItem(state, action.id, (item) => ({
        ...item,
        checkouts: item.checkouts.filter(
          (checkout) => checkout.id !== action.checkoutId,
        ),
      }))
    case 'addSetup':
      return { ...state, setups: [...state.setups, action.setup] }
    case 'removeSetup':
      return {
        ...state,
        setups: state.setups.filter((setup) => setup.id !== action.id),
      }
    case 'reset':
      return seedState()
  }
}

export function useInventory() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!saveState(state))
  }, [state])

  return { state, dispatch, saveFailed }
}
