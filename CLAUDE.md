@AGENTS.md

## Claude Code specifics
- Team plugins are declared in `.claude/settings.json` (ECC, context7, frontend-design). When you trust this folder, Claude Code offers to install them. Accept.
- Keep context lean: at most ~10 MCP servers enabled (`/mcp`), and turn off plugins that are unrelated to this project. Too many tools shrink the usable context window.
- Parallel work: `/fork` for non-overlapping tasks; a git worktree per task for overlapping work (see `docs/WORKFLOW.md`).
- Before stopping a long session: `/ecc:save-session`. To pick up again: `/ecc:resume-session`.
