import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { getRoom, ROOMS, spotsFor } from '../../lib/layout'
import { preparePhoto } from '../../lib/photo'
import { newId } from '../../lib/store'
import { CATEGORY_LABELS } from '../../types/item'
import type { Category, Item } from '../../types/item'

type Props = {
  initialRoom: string | null
  onAdd: (item: Item) => void
  onClose: () => void
}

export default function AddItemForm({ initialRoom, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('furniture')
  const [roomId, setRoomId] = useState(initialRoom ?? ROOMS[0].id)
  const [spot, setSpot] = useState(`${initialRoom ?? ROOMS[0].id}1`)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [lowAt, setLowAt] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')

  const room = getRoom(roomId) ?? ROOMS[0]
  const isConsumable = category === 'consumable'

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    try {
      setPhoto(await preparePhoto(file))
    } catch {
      setPhotoError("That photo couldn't be read. Try a JPEG or PNG.")
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({
      id: newId(),
      name: trimmed,
      category,
      spot,
      quantity,
      unit: unit.trim() || 'item',
      lowAt: isConsumable ? lowAt : null,
      photo,
      checkouts: [],
    })
    onClose()
  }

  return (
    <form className="card add-form" onSubmit={handleSubmit}>
      <h2>Add an item</h2>

      <div className="photo-picker">
        {photo ? (
          <img src={photo} alt="Preview of the item" />
        ) : (
          <div className="photo-empty" aria-hidden="true">No photo yet</div>
        )}
        <div className="photo-actions">
          <label className="button">
            Take a photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="visually-hidden"
              onChange={handlePhoto}
            />
          </label>
          <label className="button">
            Upload a photo
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handlePhoto}
            />
          </label>
          {photo && (
            <button type="button" onClick={() => setPhoto(null)}>
              Remove photo
            </button>
          )}
          <p className="muted small">
            Keep people, screens, keys, keypads and alarm panels out of frame. Location
            data is removed, and the photo stays on this device.
          </p>
          {photoError && <p className="error" role="alert">{photoError}</p>}
        </div>
      </div>

      <div className="form-grid">
        <label>
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Folding table"
          />
        </label>
        <label>
          Tag
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Area
          <select
            value={roomId}
            onChange={(event) => {
              setRoomId(event.target.value)
              setSpot(`${event.target.value}1`)
            }}
          >
            {ROOMS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id}: {option.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Spot
          <select value={spot} onChange={(event) => setSpot(event.target.value)}>
            {spotsFor(room).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          How many
          <input
            type="number"
            min={isConsumable ? 0 : 1}
            required
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        {isConsumable && (
          <>
            <label>
              Counted in
              <input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="bag, box, pack"
              />
            </label>
            <label>
              Remind me at
              <input
                type="number"
                min={0}
                required
                value={lowAt}
                onChange={(event) => setLowAt(Number(event.target.value))}
              />
            </label>
          </>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="primary">Save item</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  )
}
