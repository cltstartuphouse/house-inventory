# Contributing

This repo is built by the people who come to CLT Startup House. Here's how to add your piece without stepping on anyone else's.

## House rules

1. **Build one level up or down.** Pick an issue labeled for your level (`level: beginner`, `level: intermediate` or `level: advanced`), and sit near someone a step ahead of you.
2. **Leave with something shipped.** Small is fine. A merged pull request beats a perfect branch.
3. **Build for the house.** If it makes the house better for the next person, it belongs here.
4. **Be generous.** Explain what you did in your pull request so the next person can learn from it.

## Before you start

- You need a free GitHub account. That's it.
- Look at the open issues, pick one that matches your level, and comment "I'm on this" so two people don't build the same thing.
- If the first issue ("Pick the stack and scaffold") hasn't merged yet, start with a docs or design issue, or pair with the group doing it.

## Path 1: no terminal (good for beginners)

1. Open the repo on GitHub and click **Fork** (top right). This makes your own copy.
2. In your fork, press the `.` key. GitHub opens an editor in your browser.
3. Make your change. Save the file.
4. In the left sidebar, open **Source Control**, write a short message, and click **Commit and Push**. When it asks, create a new branch.
5. Go back to your fork on GitHub. Click **Contribute**, then **Open pull request**.

## Path 2: terminal

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/<repo>.git
cd <repo>

# 2. Make a branch named for your issue
git checkout -b 12-low-stock-flags

# 3. Build, then commit small and often
git add .
git commit -m "Add low-stock flag for consumables"

# 4. Push your branch to your fork
git push -u origin 12-low-stock-flags
```

Then open a pull request from your branch into `main` on this repo.

## What a good pull request has

- What it does, in a sentence or two, and which issue it closes (`Closes #12`).
- How you tested it.
- A screenshot if you changed something people see.
- The checklist in the pull request template, filled in honestly.

## What happens next

- Automated checks run on every pull request. If one fails, it says why. Fix it and push again.
- The first time you contribute, a maintainer approves your checks to run. After that they run on their own.
- A maintainer reviews every pull request and is the only one who merges. You'll get a comment, not a rejection, if something needs to change.

## Ground rules for code

- **Never commit secrets.** API keys, tokens and passwords go in a `.env` file on your machine, which git ignores. If you need to show settings, add a `.env.example` with fake values.
- **No real personal data.** Use made-up sample data. No names, emails, phone numbers or photos of people.
- **No binaries.** Don't commit compiled files, firmware builds, archives or anything over 1 MB.
- **Photos and media only in `docs/` or `public/`**, and only ones you have the right to share.
- **AI-written code is welcome.** You're still the one who reads every line before you open the pull request.
- **Keep it simple.** If a feature needs a meeting to explain, it's too big for one night.

## Licensing

This project is under the [MIT License](LICENSE). By opening a pull request, you agree that your contribution is licensed under the same terms.

## Questions

Ask a host at the house, or open an issue.
