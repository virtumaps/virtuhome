## What and why

<!-- What changed for users, and why. Link the issue it closes. -->

## How it was checked

<!-- Tests, the dev harness, a real Home Assistant, a tablet. -->

## Checklist

- [ ] `cd frontend && npm run typecheck && npm test && npm run build` passes, and the build is committed
- [ ] Old plans still load (plan format changes go through `normalizePlan`)
- [ ] A line in `CHANGELOG.md` under `## Unreleased` for anything a user notices
- [ ] `docs/GUIDE.md` updated for anything a user sees or does differently, with buttons and options named as in the source. Sections changed: … (or not needed, because …)
