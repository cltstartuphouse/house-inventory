import sampleItems from '../data/sample-items.json'
import type { Item } from './types/item'

const items: Item[] = sampleItems

function App() {
  const homes = [...new Set(items.map((item) => item.home))].sort()

  return (
    <main>
      <h1>House Inventory</h1>
      <p>Sample data only. Everything here is made up.</p>

      {homes.map((home) => {
        const itemsInHome = items.filter((item) => item.home === home)

        return (
          <section key={home}>
            <h2>
              {home} <small>{itemsInHome[0].room}</small>
            </h2>
            <ul>
              {itemsInHome.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity}
                  {item.checkedOutFor && (
                    <em> (checked out for {item.checkedOutFor})</em>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </main>
  )
}

export default App
