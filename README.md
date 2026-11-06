# house-inventory

Track everything CLT Startup House owns, where it lives and when we're running low.

The first version gets built by the room at House Jam Nº 6 on Thursday, November 5, 2026, at CLT Startup House in Charlotte. It's open source, and the house keeps using it after tonight.

## The problem

Two coolers, a yellow bin, the canopy, speakers, mics, cables, banners, folding tables, plates and coffee. Right now all of it lives in our heads, and we restock with last-minute store runs. Whoever runs an event should be able to find what they need, put it back where it goes, and know what's running low before it runs out.

## What it needs to do

| Need | What that means |
| --- | --- |
| Every item has a home | A labeled spot like A1 or A2, a photo, and the room or closet it lives in |
| Check out, check in | Whoever books the house sees what's available and shows it's back, with a photo |
| Know when we're low | Coffee, tea, paper goods, forks. Flag it before it runs out |
| Run the checklists | Morning rounds, the Friday reset, pre-event and post-event |

**Done for tonight** is the smallest thing that runs end to end: add an item with its home, list what's in each spot, and mark something checked out and back in.

## Start here

1. Read [CONTRIBUTING.md](CONTRIBUTING.md). It has a no-terminal path if you've never used git.
2. Pick an issue labeled for your level and comment "I'm on this":
   - [`level: beginner`](https://github.com/cltstartuphouse/house-inventory/issues?q=is%3Aissue+is%3Aopen+label%3A%22level%3A+beginner%22): checklists, label scheme, sample data, docs
   - [`level: intermediate`](https://github.com/cltstartuphouse/house-inventory/issues?q=is%3Aissue+is%3Aopen+label%3A%22level%3A+intermediate%22): screens and features
   - [`level: advanced`](https://github.com/cltstartuphouse/house-inventory/issues?q=is%3Aissue+is%3Aopen+label%3A%22level%3A+advanced%22): the stack, data model and photo check-in
3. Issue #1, "Pick the stack and scaffold the app," merges first. Until it does, work on docs and design issues or pair with that group.

## Stack

[React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev) and [three.js](https://threejs.org) for the 3D house. Data starts from JSON sample files and saves in the browser, with no hosted database.

### What the mockup does

| Tab | What you can do |
| --- | --- |
| House | Turn an empty 3D model of the house, look inside, and pick a labeled area to see what's in each spot |
| Inventory | Take or upload a photo, name it, tag it, then search, filter and sort. Check things out to an event and back in |
| Low stock | See consumables at or below their reminder level, and copy a shopping list |
| Events | Teach a setup, then type "I'm having 8 people over" to get what to fetch, from where, and what to buy |

The reminder is a banner in the app. Sending email or text reminders needs a backend.

**The room layout is a placeholder.** The outside is based on an aerial view, but nobody has measured the inside. Fix room positions and doors in `src/lib/layout.ts`, and the model and labels follow.

**Moving to a hosted database:** the data layer is `src/lib/store.ts`. Replace `loadState` and `saveState`, and keep the actions the same. Photos are small data URLs for now, so they stay on one device until then.

### Run it locally

You need [Node.js](https://nodejs.org) 22.12 or newer.

```bash
npm install
npm run dev
```

Then open the URL it prints, usually http://localhost:5173.

### Where things go

| Folder | What goes there |
| --- | --- |
| `src/features/` | One folder per feature: homes (the 3D house), items, checkouts, low stock, events, checklists |
| `src/components/` | UI shared between features |
| `src/lib/` | The house layout, data store, event planner and photo handling |
| `src/types/` | Shared TypeScript types |
| `data/` | Made-up sample data |
| `docs/` | Written docs, including `docs/checklists/` |
| `public/` | Static files served as they are |

Run `npm run build` and `npm run lint` before you open a pull request.

## Rules for this repo

- **Sample data only.** Use made-up items in files under `data/`. Nothing about real people.
- **Who checked something out is personal data.** Keep it out of the repo. An event name is fine.
- **Photos stay local.** Don't commit photos of the real house. If your demo uses photos, store them on your machine, strip location data, and keep people, screens, keypads, keys and alarm panels out of frame.
- **No keys in code.** Anything secret goes in a `.env` file, which git ignores. No hosted database credentials tonight: start with local storage or a local file.

## How changes land

Fork the repo, make your change on a branch and open a pull request into `main`. Automated checks run on every pull request, and a maintainer reviews and merges. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). By contributing, you agree your work is licensed the same way.

Proximity creates collisions. Collisions create breakthroughs.
