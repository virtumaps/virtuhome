# VirtuHome: notes for coding agents

Read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) (how work flows, the definition of done, the rules)
and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (the performance rules) before changing anything.

## The user guide stays true

[docs/GUIDE.md](docs/GUIDE.md) is the user guide. **Every change that adds, removes, renames or
changes something a user sees or does updates the guide in the same pull request.** That covers a
feature, a button, an option or its default, a gesture, a panel, a supported device, a limit, and a
fix that changes how something is used.

- Name buttons and options exactly as the source names them. Check the source, not your memory.
- Put a new feature where a user would look for it, and take out what no longer exists.
- Card option changes go into the guide's options table and the README's card options.
- Extension changes (made in the private extensions repository) go into the guide's Extensions
  section, without prices.
- The pull request says which guide sections changed, or why none needed to.
- The guide is also a website (virtumaps.github.io/virtuhome, built by `frontend/dev/guide-site.mjs`),
  a page per `##` part, its addresses made from the headings. Help links in the app use
  `guideLink("<anchor>")` from `frontend/src/ui/guide.ts`; `npm test` checks that they and the
  guide's own links lead somewhere.

A change worth a line under `## Unreleased` in CHANGELOG.md is nearly always worth a guide change.

## Checks

```bash
cd frontend && npm ci && npm run typecheck && npm test && npm run build   # commit the build
pip install cryptography pytest voluptuous && pytest -q tests             # if Python changed
```
