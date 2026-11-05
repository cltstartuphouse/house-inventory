// Starter shape for the sample data. Issue #2 owns the real data model.
export type Item = {
  id: string
  name: string
  /** Labeled spot where the item lives, like "A1". */
  home: string
  room: string
  quantity: number
  /** Event name only. Never store who checked something out. */
  checkedOutFor: string | null
}
