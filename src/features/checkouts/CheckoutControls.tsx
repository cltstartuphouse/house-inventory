import { useState } from 'react'
import type { FormEvent } from 'react'
import { availableCount } from '../../lib/store'
import type { Action } from '../../lib/store'
import type { Item } from '../../types/item'

type Props = {
  item: Item
  dispatch: (action: Action) => void
}

export default function CheckoutControls({ item, dispatch }: Props) {
  const [open, setOpen] = useState(false)
  const [event, setEvent] = useState('')
  const available = availableCount(item)
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (submit: FormEvent) => {
    submit.preventDefault()
    const name = event.trim()
    if (!name) return
    dispatch({
      type: 'checkOut',
      id: item.id,
      event: name,
      quantity: Math.min(quantity, available),
    })
    setOpen(false)
    setEvent('')
    setQuantity(1)
  }

  return (
    <div className="checkout">
      {item.checkouts.map((checkout) => (
        <div className="checkout-row" key={checkout.id}>
          <span>
            {checkout.quantity} out for <b>{checkout.event}</b>
          </span>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: 'checkIn', id: item.id, checkoutId: checkout.id })
            }
          >
            Check in
          </button>
        </div>
      ))}

      {open ? (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Event name
            <input
              required
              autoFocus
              value={event}
              onChange={(change) => setEvent(change.target.value)}
              placeholder="Friday demo night"
            />
          </label>
          <label>
            How many
            <input
              type="number"
              min={1}
              max={available}
              required
              value={quantity}
              onChange={(change) => setQuantity(Number(change.target.value))}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary">Check out</button>
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" disabled={available === 0} onClick={() => setOpen(true)}>
          {available === 0 ? 'All checked out' : 'Check out'}
        </button>
      )}
    </div>
  )
}
