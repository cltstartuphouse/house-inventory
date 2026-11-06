import { useState } from 'react'
import { roomForSpot } from '../../lib/layout'
import { plural } from '../../lib/planner'
import { isLow } from '../../lib/store'
import type { Action } from '../../lib/store'
import type { Item } from '../../types/item'

type Props = {
  items: Item[]
  dispatch: (action: Action) => void
}

export default function LowStockView({ items, dispatch }: Props) {
  const [copied, setCopied] = useState('')
  const consumables = items.filter((item) => item.category === 'consumable')
  const low = consumables.filter(isLow)
  const stocked = consumables.filter((item) => !isLow(item))

  const toBuy = (item: Item) => (item.lowAt ?? 0) + 1 - item.quantity

  const copyList = async () => {
    const text = low
      .map((item) => {
        const count = toBuy(item)
        return `${item.name}: buy at least ${count} ${plural(count, item.unit)}`
      })
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied('Shopping list copied.')
    } catch {
      setCopied("Couldn't copy here. Select the list and copy it by hand.")
    }
  }

  const row = (item: Item) => (
    <li className="stock-line" key={item.id}>
      <div>
        <b>{item.name}</b>
        <span className="muted small">
          {' '}
          {item.spot}, {roomForSpot(item.spot)?.name}. Reminder at {item.lowAt}.
        </span>
      </div>
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
          <b>{item.quantity}</b> {plural(item.quantity, item.unit)}
        </span>
        <button
          type="button"
          aria-label={`Add one ${item.name}`}
          onClick={() => dispatch({ type: 'adjustStock', id: item.id, delta: 1 })}
        >
          +
        </button>
      </div>
    </li>
  )

  return (
    <div className="stack">
      <section className="card">
        <h2>Buy these</h2>
        {low.length ? (
          <>
            <ul className="stock-list">{low.map(row)}</ul>
            <div className="form-actions">
              <button type="button" className="primary" onClick={copyList}>
                Copy shopping list
              </button>
              <span className="muted small" role="status">{copied}</span>
            </div>
          </>
        ) : (
          <p className="muted">Nothing is running low.</p>
        )}
      </section>
      <section className="card">
        <h2>Stocked</h2>
        {stocked.length ? (
          <ul className="stock-list">{stocked.map(row)}</ul>
        ) : (
          <p className="muted">No stocked consumables yet.</p>
        )}
      </section>
    </div>
  )
}
