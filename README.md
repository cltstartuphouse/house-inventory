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

Chosen by the room in issue #1. Write it here when it lands, along with how to run the app locally.

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
