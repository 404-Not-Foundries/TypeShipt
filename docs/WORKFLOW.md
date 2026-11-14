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
**Last ~2 hours:** feature freeze. Only fix bugs, polish the demo, write the README, and rehearse the pitch.

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
Codex reads `AGENTS.md` and has the ECC plugin installed. Good uses:
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
