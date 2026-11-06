import { Suspense, lazy, useMemo, useState } from 'react'
import { doorsFor, getRoom, ROOMS, spotsFor } from '../../lib/layout'
import { availableCount, isLow } from '../../lib/store'
import { plural } from '../../lib/planner'
import type { Item } from '../../types/item'
import type { ViewMode } from './HouseModel'

const HouseModel = lazy(() => import('./HouseModel'))

const MODES: { id: ViewMode; label: string }[] = [
  { id: 'outside', label: 'Outside' },
  { id: 'inside', label: 'Look inside' },
  { id: 'basement', label: 'Basement' },
]

type Props = {
  items: Item[]
  selectedId: string | null
  onSelect: (roomId: string) => void
  onAddHere: (roomId: string) => void
}

export default function MapView({ items, selectedId, onSelect, onAddHere }: Props) {
  const [mode, setMode] = useState<ViewMode>(() =>
    getRoom(selectedId ?? '')?.level === 'basement'
      ? 'basement'
      : selectedId
        ? 'inside'
        : 'outside',
  )

  const counts = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const item of items) {
      const area = item.spot.charAt(0)
      totals[area] = (totals[area] ?? 0) + 1
    }
    return totals
  }, [items])

  const room = selectedId ? getRoom(selectedId) : undefined

  const pickRoom = (roomId: string) => {
    const level = getRoom(roomId)?.level
    setMode(level === 'basement' ? 'basement' : 'inside')
    onSelect(roomId)
  }

  return (
    <div className="map-layout">
      <section className="map-panel" aria-label="House model">
        <div className="segmented" role="group" aria-label="View">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              onClick={() => setMode(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Suspense fallback={<div className="house-fallback">Loading the house…</div>}>
          <HouseModel
            mode={mode}
            selectedId={selectedId}
            counts={counts}
            onSelect={pickRoom}
          />
        </Suspense>
        <p className="hint">
          Drag to turn the house, and scroll or pinch to zoom. The room layout is a
          placeholder until someone measures the house.
        </p>
      </section>

      <aside className="room-panel" aria-label="Area details">
        {room ? (
          <>
            <p className="eyebrow">Area {room.id}</p>
            <h2>{room.name}</h2>
            {spotsFor(room).map((spot) => {
              const here = items.filter((item) => item.spot === spot)
              return (
                <div className="spot" key={spot}>
                  <h3>{spot}</h3>
                  {here.length ? (
                    <ul>
                      {here.map((item) => (
                        <li key={item.id}>
                          <span>{item.name}</span>
                          <span className={isLow(item) ? 'badge badge-low' : 'muted'}>
                            {item.category === 'consumable'
                              ? `${item.quantity} ${plural(item.quantity, item.unit)}`
                              : `${availableCount(item)} of ${item.quantity} here`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Empty</p>
                  )}
                </div>
              )
            })}
            <button type="button" className="primary" onClick={() => onAddHere(room.id)}>
              Add an item here
            </button>
            {doorsFor(room).length > 0 && (
              <div className="spot">
                <h3>Doors</h3>
                <ul>
                  {doorsFor(room).map((door) => (
                    <li key={door.id}>
                      <span>{door.label}</span>
                      <span className="muted">{door.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">Areas</p>
            <h2>Pick a spot in the house</h2>
          </>
        )}
        <div className="room-list" role="group" aria-label="All areas">
          {ROOMS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === selectedId}
              onClick={() => pickRoom(option.id)}
            >
              <b>{option.id}</b> {option.name}
              <span className="muted"> {counts[option.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
