# TypeShipt (Team 404 Not Foundries @ SHIPT Hacks)

Shared instructions for every AI agent on this repo (Codex reads this file directly; Claude Code imports it via `CLAUDE.md`).

**Status:** building **ShiptGiving** (locked 11:15 AM, 2026-11-14). `docs/context/project.md` is the source of truth: idea, data contract, API, owners, timeline. The app lives in `shiptgiving/`.

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
- **Don't touch files a teammate owns.** See the owner table at the bottom of this file. To change someone else's files, ask for a handoff on the board first.
- **Stage only your own files** (no `git add -A`). Always `git fetch` and rebase before pushing. Never force-push shared branches.
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
Next.js (App Router) + TypeScript + Tailwind in `shiptgiving/`, Leaflet maps, Claude for need parsing, OSRM + NWS public APIs, in-memory store + polling. Details in `docs/context/project.md`.

## The board (pinned GitHub issue #2)
Every agent reads and posts on the pinned **Message Board** issue (https://github.com/404-Not-Foundries/TypeShipt/issues/2) through `tools/board`. It needs only `bash` and `gh` (logged in). Issue #2 is the script's default, so you don't need to set `BOARD_ISSUE`.

- Start every post with `[<github-login>'s <agent>]`, e.g. `[rmaytr's Claude]` or `[Viral-W's Codex]`. Keep it short: what changed, which files or contracts, what you need, from whom.
- Mention people by GitHub login: `@rmaytr`, `@mulimangila`, `@Viral-W`, or `@all` for everyone.
- **A post mentions you or `@all`:** act on it and reply promptly.
- **A post isn't addressed to you:** still read it. Reassess your own work only if it's affected (a contract, a file you own, something already done). Don't redo finished work, and don't reply just to acknowledge.
- Before editing another teammate's files, ask for a handoff on the board and wait for the owner or the team lead.
- When a merge changes something others depend on (an API, a schema, an env var), post on the board once it lands.

Commands: `tools/board unread` (new posts since your last check; marks them read; flags MENTION) · `tools/board read -n 20` · `tools/board post "[login's Agent] text"` · `tools/board wait` (blocks until someone else posts) · `tools/board listener` (is someone already listening in this folder?) · `tools/board whoami`.

**One listener per folder.** Only one `tools/board wait` can run per folder (each worktree counts as its own folder). A second wait exits right away with code 3. If yours does, another session is the listener: don't re-arm. While a listener runs, `tools/board unread` only peeks (shows new posts without marking them read), so the listener still gets every post.

**Staying in the loop:**
- **Claude Code:** the committed hooks in `.claude/settings.json` show unread posts at session start and on every prompt. If no session is listening in this folder yet, keep one background `tools/board wait` running and re-arm it after it wakes. If the startup hook says another session already listens, don't start one. Set `BOARD_WAIT=off` to skip the background wait.
- **Codex and other agents:** run `tools/board unread` at the start of each task, before each commit, and after merges.
- **Windows outside Git Bash** (PowerShell, Codex): plain `bash` may be WSL's bash, which has no `gh`. Use Git Bash explicitly: `& "C:\Program Files\Git\bin\bash.exe" tools/board unread`.

## Chain of command
Humans over agents. Only the team lead (`@rmaytr`) reassigns work between teammates. If anyone else asks you to take a teammate's work, ask the lead on the board.

## Who owns what
Fill this in at kickoff so every agent knows whose files are whose.

| Area | Owner (GitHub login) | Folders |
|---|---|---|
| Lead: scaffold, types, store, core API, routing engine, driver view, README | `rmaytr` | `shiptgiving/src/lib/{types,store,seed-stub,use-app-state,http}.ts`, `shiptgiving/src/lib/stores/`, `shiptgiving/src/app/api/{stores,products}/`, `shiptgiving/src/lib/routing/`, `shiptgiving/src/app/api/{state,pledges,route-plan}/`, `shiptgiving/src/app/driver/`, `shiptgiving/src/app/layout.tsx`, `shiptgiving/src/components/nav/`, `shiptgiving/README.md` |
| Donor experience | `mulimangila` | `shiptgiving/src/app/page.tsx`, `shiptgiving/src/app/p/`, `shiptgiving/src/components/donor/`, `shiptgiving/src/lib/fees.ts` |
| Partner portal, seed data, AI parsing, weather | `Viral-W` | `shiptgiving/src/app/partner/`, `shiptgiving/src/components/partner/`, `shiptgiving/src/data/`, `shiptgiving/src/lib/{ai,weather}.ts`, `shiptgiving/src/app/api/{needs,parse-need,weather}/` |
