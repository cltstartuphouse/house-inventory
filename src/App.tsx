import { useState } from 'react'
import EventsView from './features/events/EventsView'
import MapView from './features/homes/MapView'
import ItemsView from './features/items/ItemsView'
import LowStockView from './features/low-stock/LowStockView'
import { isLow, useInventory } from './lib/store'

type Tab = 'map' | 'items' | 'low' | 'events'

const TABS: { id: Tab; label: string }[] = [
  { id: 'map', label: 'House' },
  { id: 'items', label: 'Inventory' },
  { id: 'low', label: 'Low stock' },
  { id: 'events', label: 'Events' },
]

function App() {
  const { state, dispatch, saveFailed } = useInventory()
  const [tab, setTab] = useState<Tab>('map')
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addToRoom, setAddToRoom] = useState<string | null>(null)

  const lowCount = state.items.filter(isLow).length

  const openMap = (roomId: string) => {
    setSelectedRoom(roomId)
    setTab('map')
  }

  const addHere = (roomId: string) => {
    setAddToRoom(roomId)
    setShowAddForm(true)
    setTab('items')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>House Inventory</h1>
          <p className="muted small">Mockup with made-up sample data</p>
        </div>
        <nav aria-label="Main">
          {TABS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-current={tab === option.id ? 'page' : undefined}
              onClick={() => setTab(option.id)}
            >
              {option.label}
              {option.id === 'low' && lowCount > 0 && (
                <span className="nav-count">{lowCount}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {saveFailed && (
          <p className="banner banner-error" role="alert">
            This browser's storage is full, so new changes won't be saved. Remove some
            photos to free up space.
          </p>
        )}
        {lowCount > 0 && tab !== 'low' && (
          <button type="button" className="banner" onClick={() => setTab('low')}>
            Reminder: {lowCount} {lowCount === 1 ? 'item is' : 'items are'} running low. See
            what to buy.
          </button>
        )}

        {tab === 'map' && (
          <MapView
            items={state.items}
            selectedId={selectedRoom}
            onSelect={setSelectedRoom}
            onAddHere={addHere}
          />
        )}
        {tab === 'items' && (
          <ItemsView
            items={state.items}
            dispatch={dispatch}
            addToRoom={addToRoom}
            showAddForm={showAddForm}
            onShowAddForm={(show, room) => {
              setShowAddForm(show)
              if (room !== undefined) setAddToRoom(room)
            }}
            onOpenMap={openMap}
          />
        )}
        {tab === 'low' && <LowStockView items={state.items} dispatch={dispatch} />}
        {tab === 'events' && (
          <EventsView
            items={state.items}
            setups={state.setups}
            dispatch={dispatch}
            onOpenMap={openMap}
          />
        )}
      </main>

      <footer className="app-footer">
        <span className="muted small">
          Changes are saved in this browser only.
        </span>
        <button
          type="button"
          className="link"
          onClick={() => {
            if (window.confirm('Erase your changes and go back to the sample data?')) {
              dispatch({ type: 'reset' })
            }
          }}
        >
          Reset sample data
        </button>
      </footer>
    </div>
  )
}

export default App
