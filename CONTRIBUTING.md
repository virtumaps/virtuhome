# Contributing to VirtuHome

Thank you for helping. VirtuHome is free to use and its source is open to read and improve; bug
reports, ideas, furniture models, translations and pull requests are all welcome.

Questions and ideas go to [Discussions](https://github.com/virtumaps/virtuhome/discussions), and
[SUPPORT.md](SUPPORT.md) says where everything else goes. Issues labelled
[`good first issue`](https://github.com/virtumaps/virtuhome/labels/good%20first%20issue) are a good
place to start.

## Getting set up

```bash
cd frontend
npm install
npm run dev -- --fast     # dev harness on http://127.0.0.1:5173 with the demo house and pretend states
npm test                  # unit tests (vitest)
npm run typecheck
```

To see your own home in the dev harness, start it with your Home Assistant in the environment
(`HA_URL=http://homeassistant.local:8123 HA_TOKEN=<long-lived token> npm run dev -- --fast`) and open
`?hass=live`. Put your own plan files in `frontend/dev/plans/` and scans in `frontend/dev/scans/`
(both git-ignored) and open `?plan=<name>` or `?scan=<folder>`.

Python: `pip install cryptography pytest && pytest tests`.

## How work flows

Issues, labels, branches, the definition of done and the release steps are in
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Ground rules

- **Performance first.** VirtuHome runs on cheap wall tablets. Read the performance rules in
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): no per-pixel lighting, no extra draw calls per device,
  nothing that renders while nothing changes. Say in your pull request how you checked it.
- Keep the plan format backwards compatible: old plans must keep loading (`normalizePlan`).
- Keep the [user guide](docs/GUIDE.md) true: a change to what users see or do updates it in the same
  pull request.
- Run `npm run build` in `frontend/` and commit the result in `custom_components/virtuhome/frontend`:
  HACS installs straight from the repository.
- Code style: follow the surrounding code; comments explain why, not what.
- Commits: one topic each, an imperative subject line, the reasoning in the body.

## Licence of contributions

VirtuHome is licensed under the [GNU General Public License v3.0](LICENSE). By opening a pull request
you confirm that you wrote the contribution (or have the right to submit it), that it is offered under
the same licence, and that VirtuMaps may also use, change and license it as part of VirtuHome and its
extensions, including under other licences. If you cannot agree to that, open an issue describing the
change instead.

## Extensions

Paid extensions (for example Wall Tablet) are separate and not part of this repository. The core
loads them through the extension API in `frontend/src/ext/api.ts`; changes to that API need a bump of
`EXT_API_VERSION` when they break existing extensions.
