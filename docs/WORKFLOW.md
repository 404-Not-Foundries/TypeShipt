# How we work on hackathon day

## Kickoff (first ~45 minutes)
1. **The main session** (on `rmaytr`'s laptop) gets the official prompt, tracks and judging criteria pasted in.
2. Brainstorm 2–3 ideas against the judging criteria and the Shipt research in `docs/context/`. Pick one together.
3. Fill in `docs/context/project.md`: idea, demo script, scope, stack, owners. Merge it to `main`.
4. Everyone runs `git pull`. From then on, every Claude/Codex session on every laptop starts with the same context.

## Split the work
Typical split for 3 people: **frontend/demo UI**, **backend/API/data**, **AI feature + pitch deck**. Each person works on their own branch:

```bash
git switch -c <github-login>/<task>
```

To run several agents on one laptop without them colliding, give each task its own worktree:

```bash
git worktree add ../TypeShipt-<task> -b <github-login>/<task>
```

Then start `claude` (or `codex`) inside that folder. The Claude desktop app can also create a worktree per session for you. Use `/fork` only for side tasks that won't edit the same files.

**Every ~2 hours:** merge to `main`, everyone pulls, and someone runs the demo end-to-end.
**Last ~2 hours:** keep `main` runnable; the team decides together when to stop adding features and switch to polish, README and rehearsal.

## The agent board (how agents hand off work without us texting)
Based on the "Hackathon Agent Board" setup from Knight Hacks and Cal Hacks (https://github.com/azizu06/hackathon-agent-board). Pinned issue [#2](https://github.com/404-Not-Foundries/TypeShipt/issues/2) is where every agent posts when it **finishes something** or **needs something**, tagging whoever it needs:

```text
[rmaytr's Claude] Checkout page is merged. @Viral-W the frontend calls POST /api/orders now, can your agent add that route?
[Viral-W's Codex] @rmaytr the route is up on main. It returns the order id and an ETA.
```

- **At kickoff:** fill in the owner table at the bottom of `AGENTS.md` (area → login → folders). Agents never edit another owner's folders without asking on the board first.
- **Claude Code:** the session-start hook shows unread posts and tells Claude to keep a background `tools/board wait` running, so it wakes up when someone posts and acts when it's tagged. The prompt hook shows new posts on every message.
- **Codex:** has no hooks. Start each task with "check the board first" (it runs `tools/board unread`). To have Codex wake up on its own, run this in Git Bash: `while bash tools/board wait; do codex exec "Handle the new board posts per AGENTS.md"; done`.
- **Humans can post too:** comment on the issue from the GitHub web or mobile app. You can steer every agent from your phone.
- **Limit with one account across many sessions:** the script hides posts made by your own GitHub login, so two of *your* sessions don't see each other's posts. The board is for handoffs **between teammates**. To coordinate your own parallel sessions, use the desktop app's linked sessions, or have them talk through a teammate's tag.
- **One listener per folder, enforced by a lock.** The first Claude session in a folder becomes the board listener. Any later session there is told not to start its own; `tools/board wait` refuses with exit code 3 if it tries. Other sessions still see new posts (through the prompt hook or `tools/board unread`), but they only peek and don't mark posts read, so the listener never misses a tagged post. If the listener's session closes, its lock is released (a stale lock from a crashed session is detected and cleared), and the next session to start becomes the listener. Run `tools/board listener` to see who's listening. Each worktree has its own lock and read marker (`.board/`, gitignored).

## The per-feature loop (Claude Code + ECC)
| Step | Command / agent | What it does |
|------|-----------------|--------------|
| 1. Plan | `/ecc:plan <feature>` | The `planner` agent writes a step-by-step plan and waits for your OK |
| 2. Build | normal prompting, or `/ecc:feature-dev` | Implements it. ECC hooks run format/type checks after edits |
| 3. Broken build | `/ecc:build-fix` | The `build-error-resolver` agent fixes errors with minimal diffs |
| 4. Review | `/code-review` or "use the code-reviewer agent" | Catches bugs before merging |
| 5. Clean up | `/ecc:refactor-clean` | Removes dead code and loose files after a long session |
| 6. Ship | commit (conventional), then `/ecc:pr` | Opens the PR |
| Security pass | `/ecc:security-scan` or the `security-reviewer` agent | Before the final demo, anything with auth, keys or user input |
| Fast MVP scaffold | `/ecc:orch-build-mvp` | Orchestrated MVP build, useful in the first hours |
| Long session | `/ecc:save-session` / `/ecc:resume-session`, `/compact` | Keeps context fresh |

Other useful ECC agents (ask by name): `architect` (system design), `e2e-runner` (Playwright flows for the demo path), `doc-updater` (README).

## Codex
Codex reads `AGENTS.md` and has the ECC plugin installed. To start a session, paste the prompt in [`docs/CODEX_START.md`](CODEX_START.md). Good uses:
- A **second opinion**: run `/review` in Codex on a branch Claude wrote, before merging.
- **Parallel grunt work** in its own worktree: seed data, fixtures, a README section, a pitch-deck outline.
Give Codex and Claude different worktrees or branches. Never point both at the same files at the same time.

## Claude Code shortcuts (from the article)
- `Esc Esc`: interrupt, or rewind to an earlier state (`/rewind`)
- `!`: run a shell command inline · `@`: reference a file · `Shift+Enter`: new line
- `/compact`: compact the context manually at a natural break
- `/context`, `/mcp`: see what's taking up the context window. Keep MCPs to 10 or fewer.

## Principles (Affaan's five takeaways)
1. Don't overcomplicate the setup. Treat config like fine-tuning, not architecture.
2. The context window is precious. Disable unused MCPs and plugins.
3. Work in parallel: fork conversations, use git worktrees.
4. Automate repetitive work with hooks (formatting, linting, reminders).
5. Scope subagents: give each a few tools for its specific job.
