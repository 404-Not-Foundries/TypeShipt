# Starting a Codex session

Same prompt for everyone: Codex reads your GitHub login from `gh`, so the only thing you fill in is your area or task.

## Before pasting (every new Codex session)

1. Open a terminal in the `TypeShipt` folder and get the latest `main`:

   ```bash
   git switch main && git pull
   ```

2. Start Codex in that folder: run `codex` in the terminal, or open the folder in the Codex app.
3. **The board needs network access.** Codex's sandbox blocks network calls by default, and `tools/board` uses `gh`. Approve when Codex asks to run a board command outside the sandbox, or start Codex with network access on:

   ```bash
   codex -c sandbox_workspace_write.network_access=true
   ```

   (We haven't tested this flag in a live session. If Codex rejects it, start `codex` normally and approve the board commands when it asks.)

4. Paste the prompt below and replace `<MY AREA / TASK>`.

## The prompt

```text
You're my Codex agent for team 404 Not Foundries at SHIPT Hacks, working in the TypeShipt repo. AGENTS.md is the team rulebook. Follow it; it overrides your defaults.

My area this session: <MY AREA / TASK, or "nothing yet, waiting for kickoff">

STARTUP (do these now, in order):
1. Run `git status -sb`. Confirm I'm on an up-to-date `main` with a clean tree.
2. Find my identity: run `tools/board whoami` from the repo root. On Windows, run every board command through Git Bash: `& "C:\Program Files\Git\bin\bash.exe" tools/board <command>`. Plain `bash` there may be WSL, which has no `gh`. The board needs network access; if the sandbox blocks it, ask me to approve. Sign every board post you make as `[<that login>'s Codex]`.
3. Read `AGENTS.md`, `docs/context/project.md` and `docs/WORKFLOW.md`, and skim `docs/context/shipt-research.md`. Tell me in 5 lines or fewer: what we're building (or "not chosen yet"), who owns which folders per the owner table in AGENTS.md, and what's assigned to me.
4. Check the board (pinned issue #2): run `tools/board unread`. Summarize the posts, and flag any that mention my login or @all.
Then wait for my first task.

HOW TO WORK THIS SESSION:
- Board: you have no hooks, so check it yourself with `tools/board unread` before each task, before every commit, and after every pull or merge. If a post mentions me or @all, act on it and reply on the board. If it doesn't, only change course when it affects files I own. Never reply just to acknowledge.
- Post to the board when you finish something a teammate depends on, or when you need something from one. Use `tools/board post "[<login>'s Codex] what changed, which files, what I need from @login"` and keep it short. Teammates: @rmaytr (team lead), @mulimangila, @Viral-W, or @all.
- Ownership: stay inside my folders from the owner table. To change anyone else's files, ask on the board and wait for the owner or @rmaytr to hand them off.
- Git: branch `<login>/<short-task>` from fresh main. For anything touching more than one file, show me a plan before coding. Stage only my own files (no `git add -A`). Use conventional commits (feat:, fix:, chore:, docs:). Run `git fetch` and rebase before pushing, and never force-push. Open a PR. Before merging, remind me to run `/review`. Once the PR is merged, post on the board if it changed an API, a schema, or an env var.
- Hackathon rules: get the demo working before anything else; main must always run; no secrets in code (put them in `.env` and commit `.env.example`); only write tests for core demo logic and anything touching money or auth.
```

## Optional: have Codex wake itself up when tagged

Codex has no background wait like Claude Code's hooks. To get the same effect, run this loop in a separate **Git Bash** terminal in the repo folder. Each new board post starts a one-off Codex run that handles it:

```bash
while bash tools/board wait; do codex exec "Handle the new board posts per AGENTS.md: act on mentions of my login or @all and reply on the board; otherwise only adjust if it affects my files."; done
```

Usually the "check the board before each task" rule in the prompt is enough.
