# TypeShipt (Team 404 Not Foundries @ SHIPT Hacks)

Shared instructions for every AI agent on this repo (Codex reads this file directly; Claude Code imports it via `CLAUDE.md`).

**Status:** pre-hackathon. The project topic is not chosen yet. When it is, `docs/context/project.md` is the source of truth.

## Read before planning anything
- `docs/context/project.md`: what we are building, scope, stack, demo plan, who owns what.
- `docs/context/`: research on Shipt and the hackathon.
- `docs/context/shipt-research.md`: Shipt company, products, tech, what's known about SHIPT Hacks, and predicted tracks with project ideas.
- `docs/WORKFLOW.md`: how the team works with Claude Code + Codex.

## Team
Three UAB students. GitHub: `rmaytr`, `mulimangila`, `Viral-W`.

## Hackathon rules (these override generic defaults)
- **The demo matters more than completeness.** Get one working end-to-end slice first, then widen it, then polish.
- **`main` must always run.** Merge only code that starts and gets through the demo path.
- **One branch per task:** `<github-login>/<short-task>` (e.g. `rmaytr/checkout-ui`). Small PRs, merged often. Self-merging is fine once it runs.
- **Don't touch files a teammate is working on.** Claim areas in `docs/context/project.md` (Owners section).
- **Testing:** TDD and the 80% coverage target from the ECC rules do **not** apply during the hackathon. Write tests only for core logic the demo depends on, plus anything involving money or auth.
- **Secrets** go in `.env` (gitignored). Commit `.env.example` with placeholder values. Never hardcode keys.
- **Stack decisions** go in `docs/context/project.md` so every agent and teammate sees the same thing. Don't add a dependency when a few lines will do.
- **Commits:** conventional format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## Agent conventions
- Plan before coding anything that touches more than one file (Claude: `/ecc:plan`; Codex: ask for a plan first).
- After writing code, run a review pass (Claude: `/code-review` or the `code-reviewer` agent; Codex: `/review`).
- Keep files small and focused. No debug `console.log` / `print` in committed code.
- If something in this file conflicts with `docs/context/project.md`, the project file wins.

## Stack
TBD on hackathon day. Record it in `docs/context/project.md`.
