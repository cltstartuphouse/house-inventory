import { useState } from 'react'
import type { FormEvent } from 'react'
import { getRoom, ROOMS, roomForSpot } from '../../lib/layout'
import { buildPlan, parseGuestCount, plural } from '../../lib/planner'
import type { Plan } from '../../lib/planner'
import { newId } from '../../lib/store'
import type { Action } from '../../lib/store'
import type { EventSetup, Item, SetupLine } from '../../types/item'

type Props = {
  items: Item[]
  setups: EventSetup[]
  dispatch: (action: Action) => void
  onOpenMap: (roomId: string) => void
}

export default function EventsView({ items, setups, dispatch, onOpenMap }: Props) {
  const [request, setRequest] = useState("I'm having 8 people over")
  const [setupId, setSetupId] = useState(setups[0]?.id ?? '')
  const [planInput, setPlanInput] = useState<{ setupId: string; guests: number } | null>(null)
  const [error, setError] = useState('')
  const [checkedOut, setCheckedOut] = useState('')

  const planSetup = setups.find((setup) => setup.id === planInput?.setupId)
  const plan: Plan | null =
    planSetup && planInput ? buildPlan(planSetup, planInput.guests, items) : null

  const makePlan = (event: FormEvent) => {
    event.preventDefault()
    setCheckedOut('')
    const guests = parseGuestCount(request)
    if (!guests || guests > 500) {
      setError('Say how many people are coming, like "8 people".')
      setPlanInput(null)
      return
    }
    if (!setups.some((setup) => setup.id === setupId)) {
      setError('Teach a setup first, then make a plan from it.')
      setPlanInput(null)
      return
    }
    setError('')
    setPlanInput({ setupId, guests })
  }

  const checkOutAll = () => {
    if (!plan) return
    for (const step of plan.get) {
      dispatch({
        type: 'checkOut',
        id: step.itemId,
        event: plan.setupName,
        quantity: step.need,
      })
    }
    setCheckedOut(`Checked out for ${plan.setupName}. Check it all back in from Inventory.`)
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Plan an event</h2>
        <form className="plan-form" onSubmit={makePlan}>
          <label className="grow">
            How many people?
            <input
              value={request}
              onChange={(event) => setRequest(event.target.value)}
            />
          </label>
          <label>
            Setup
            <select value={setupId} onChange={(event) => setSetupId(event.target.value)}>
              {setups.map((setup) => (
                <option key={setup.id} value={setup.id}>{setup.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="primary">Make the plan</button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}

        {plan && (
          <div className="plan" aria-live="polite">
            <h3>{plan.setupName} for {plan.guests}</h3>

            {plan.get.length > 0 && <h4>Go get</h4>}
            <ul className="plan-list">
              {plan.get.map((step) => (
                <li key={step.itemId}>
                  <span>
                    <b>{step.need} {plural(step.need, step.unit)}</b> ({step.name}) from{' '}
                    <button
                      type="button"
                      className="link"
                      onClick={() => onOpenMap(step.spot.charAt(0))}
                    >
                      {step.spot}, {roomForSpot(step.spot)?.name}
                    </button>
                    . Set up in {getRoom(step.placeIn)?.name}.
                  </span>
                  {step.shortBy > 0 && (
                    <span className="badge badge-low">Short by {step.shortBy}</span>
                  )}
                </li>
              ))}
            </ul>

            {plan.stock.length > 0 && <h4>Stock up</h4>}
            <ul className="plan-list">
              {plan.stock.map((step) => (
                <li key={step.itemId}>
                  <span>
                    <b>{step.name}</b>: you need {step.need}, and have {step.have} at {step.spot}.
                  </span>
                  {step.buy > 0 ? (
                    <span className="badge badge-low">
                      Buy {step.buy} {plural(step.buy, step.unit)}
                    </span>
                  ) : (
                    <span className="badge badge-ok">Enough</span>
                  )}
                </li>
              ))}
            </ul>

            {plan.get.length > 0 && (
              <div className="form-actions">
                <button type="button" onClick={checkOutAll}>
                  Check these out for {plan.setupName}
                </button>
                <span className="muted small" role="status">{checkedOut}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <TeachForm
        items={items}
        onSave={(setup) => {
          dispatch({ type: 'addSetup', setup })
          setSetupId(setup.id)
        }}
      />

      <section className="card">
        <h2>Setups you've taught</h2>
        {setups.length === 0 && <p className="muted">None yet.</p>}
        {setups.map((setup) => (
          <details className="setup" key={setup.id}>
            <summary>
              {setup.name} <span className="muted">for {setup.baseGuests}</span>
            </summary>
            <ul>
              {setup.lines.map((line) => {
                const item = items.find((candidate) => candidate.id === line.itemId)
                if (!item) return null
                return (
                  <li key={line.itemId}>
                    {line.quantity} {item.name}, {getRoom(line.placeIn)?.name}
                    {line.scales ? '' : ' (same amount for any headcount)'}
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              className="link danger"
              onClick={() => dispatch({ type: 'removeSetup', id: setup.id })}
            >
              Remove this setup
            </button>
          </details>
        ))}
      </section>
    </div>
  )
}

function TeachForm({
  items,
  onSave,
}: {
  items: Item[]
  onSave: (setup: EventSetup) => void
}) {
  const blankLine = (): SetupLine => ({
    itemId: items[0]?.id ?? '',
    quantity: 1,
    placeIn: 'E',
    scales: true,
  })
  const [name, setName] = useState('')
  const [baseGuests, setBaseGuests] = useState(10)
  const [lines, setLines] = useState<SetupLine[]>([blankLine()])
  const [saved, setSaved] = useState('')

  const changeLine = (index: number, change: Partial<SetupLine>) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...change } : line)))
  }

  const save = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || lines.length === 0) return
    onSave({ id: newId(), name: trimmed, baseGuests, lines })
    setSaved(`Saved ${trimmed}.`)
    setName('')
    setLines([blankLine()])
  }

  return (
    <form className="card" onSubmit={save}>
      <h2>Teach a setup</h2>
      <p className="muted small">
        Say what one event needs. Plans scale these amounts to the headcount.
      </p>
      <div className="form-grid">
        <label>
          Setup name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Board game night"
          />
        </label>
        <label>
          For how many people
          <input
            type="number"
            min={1}
            required
            value={baseGuests}
            onChange={(event) => setBaseGuests(Number(event.target.value))}
          />
        </label>
      </div>

      {lines.map((line, index) => (
        <fieldset className="teach-line" key={index}>
          <legend className="visually-hidden">Item {index + 1}</legend>
          <label>
            Item
            <select
              value={line.itemId}
              onChange={(event) => changeLine(index, { itemId: event.target.value })}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            How many
            <input
              type="number"
              min={1}
              required
              value={line.quantity}
              onChange={(event) => changeLine(index, { quantity: Number(event.target.value) })}
            />
          </label>
          <label>
            Goes in
            <select
              value={line.placeIn}
              onChange={(event) => changeLine(index, { placeIn: event.target.value })}
            >
              {ROOMS.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={line.scales}
              onChange={(event) => changeLine(index, { scales: event.target.checked })}
            />
            Scale with headcount
          </label>
          <button
            type="button"
            className="link danger"
            disabled={lines.length === 1}
            onClick={() => setLines(lines.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </fieldset>
      ))}

      <div className="form-actions">
        <button type="button" onClick={() => setLines([...lines, blankLine()])}>
          Add another item
        </button>
        <button type="submit" className="primary">Save setup</button>
        <span className="muted small" role="status">{saved}</span>
      </div>
    </form>
  )
}
