import { useMemo, useState } from 'react'
import CheckoutControls from '../checkouts/CheckoutControls'
import { ROOMS, roomForSpot } from '../../lib/layout'
import { plural } from '../../lib/planner'
import { availableCount, isLow } from '../../lib/store'
import type { Action } from '../../lib/store'
import { CATEGORY_LABELS } from '../../types/item'
import type { Category, Item } from '../../types/item'
import AddItemForm from './AddItemForm'

type Sort = 'name' | 'spot' | 'category' | 'low'

type Props = {
  items: Item[]
  dispatch: (action: Action) => void
  addToRoom: string | null
  showAddForm: boolean
  onShowAddForm: (show: boolean, room?: string | null) => void
  onOpenMap: (roomId: string) => void
}

export default function ItemsView({
  items,
  dispatch,
  addToRoom,
  showAddForm,
  onShowAddForm,
  onOpenMap,
}: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [area, setArea] = useState('all')
  const [sort, setSort] = useState<Sort>('name')

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = items.filter(
      (item) =>
        (category === 'all' || item.category === category) &&
        (area === 'all' || item.spot.startsWith(area)) &&
        (!query || item.name.toLowerCase().includes(query)),
    )
    const byName = (a: Item, b: Item) => a.name.localeCompare(b.name)
    const compare: Record<Sort, (a: Item, b: Item) => number> = {
      name: byName,
      spot: (a, b) => a.spot.localeCompare(b.spot) || byName(a, b),
      category: (a, b) => a.category.localeCompare(b.category) || byName(a, b),
      low: (a, b) => Number(isLow(b)) - Number(isLow(a)) || byName(a, b),
    }
    return [...filtered].sort(compare[sort])
  }, [items, search, category, area, sort])

  return (
    <div className="stack">
      {showAddForm ? (
        <AddItemForm
          key={addToRoom ?? 'none'}
          initialRoom={addToRoom}
          onAdd={(item) => dispatch({ type: 'addItem', item })}
          onClose={() => onShowAddForm(false)}
        />
      ) : (
        <button
          type="button"
          className="primary add-button"
          onClick={() => onShowAddForm(true, null)}
        >
          Add an item
        </button>
      )}

      <div className="toolbar">
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Coffee, tables…"
          />
        </label>
        <label>
          Tag
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category | 'all')}
          >
            <option value="all">All tags</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Area
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="all">All areas</option>
            {ROOMS.map((room) => (
              <option key={room.id} value={room.id}>
                {room.id}: {room.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="name">Name</option>
            <option value="spot">Spot</option>
            <option value="category">Tag</option>
            <option value="low">Running low first</option>
          </select>
        </label>
      </div>

      <p className="muted small" role="status">
        Showing {visible.length} of {items.length} items
      </p>

      <div className="item-grid">
        {visible.map((item) => {
          const room = roomForSpot(item.spot)
          const consumable = item.category === 'consumable'
          return (
            <article className="card item-card" key={item.id}>
              <div className="item-head">
                {item.photo ? (
                  <img className="item-photo" src={item.photo} alt={item.name} />
                ) : (
                  <div className={`item-photo item-placeholder tag-${item.category}`} aria-hidden="true">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div className="item-title">
                  <h3>{item.name}</h3>
                  <p>
                    <span className={`tag tag-${item.category}`}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    {isLow(item) && <span className="badge badge-low">Running low</span>}
                  </p>
                  <button
                    type="button"
                    className="link"
                    onClick={() => onOpenMap(item.spot.charAt(0))}
                  >
                    {item.spot}, {room?.name ?? 'Unknown area'}
                  </button>
                </div>
              </div>

              {consumable ? (
                <div className="stock-row">
                  <button
                    type="button"
                    aria-label={`Use one ${item.name}`}
                    disabled={item.quantity === 0}
                    onClick={() => dispatch({ type: 'adjustStock', id: item.id, delta: -1 })}
                  >
                    −
                  </button>
                  <span>
                    <b>{item.quantity}</b> {plural(item.quantity, item.unit)} left
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one ${item.name}`}
                    onClick={() => dispatch({ type: 'adjustStock', id: item.id, delta: 1 })}
                  >
                    +
                  </button>
                </div>
              ) : (
                <>
                  <p className="count">
                    <b>{availableCount(item)}</b> of {item.quantity} available
                  </p>
                  <CheckoutControls item={item} dispatch={dispatch} />
                </>
              )}

              <button
                type="button"
                className="link danger"
                onClick={() => {
                  if (window.confirm(`Remove ${item.name} from the inventory?`)) {
                    dispatch({ type: 'removeItem', id: item.id })
                  }
                }}
              >
                Remove
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
