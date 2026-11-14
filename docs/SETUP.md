# Teammate setup (do this before the hackathon)

Takes about 15 minutes. The "Claude Code setup that won a hackathon" article is a breakdown of Affaan Mustafa's guide, and his configs ship as **ECC (Everything Claude Code)**: https://github.com/affaan-m/ECC. So installing ECC gets you that setup: its agents, skills, hooks and rules.

## 0. Prerequisites
Install these, then check that each command prints a version:

```bash
git --version        # Git
node --version       # Node.js 18+
gh --version         # GitHub CLI
claude --version     # Claude Code 2.1+
codex --version      # Codex CLI
```

Then log in to GitHub (you need push access to `404-Not-Foundries/TypeShipt`):

```bash
gh auth login
```

## 1. Clone the repo

```bash
git clone https://github.com/404-Not-Foundries/TypeShipt.git
```

```bash
cd TypeShipt
```

## 2. ECC for Claude Code (plugin + rules + hooks)

```bash
npx ecc-universal@2.2.3 setup
```

When it asks, choose **Global user** scope and **Standard** hooks. Add the TypeScript and/or Python rule pack if it offers them. This installs the `ecc@ecc` plugin plus the rules in `~/.claude/rules/ecc/` (a plugin alone can't ship rules).

Check it worked:

```bash
claude plugin list
```

`ecc@ecc` should show as enabled.

> Don't also run ECC's `install.sh` / `install.ps1` on top of this. The project recommends one install path only.

## 3. ECC for Codex

```bash
codex plugin marketplace add affaan-m/ECC
```

```bash
codex plugin add ecc@ecc
```

Then run `codex plugin list` and check that `ecc@ecc` shows `installed, enabled`. If `npx ecc-universal setup` already offered to set up Codex and you said yes, skip this step. Don't use the legacy `sync-ecc-to-codex.sh` script.

Codex reads `AGENTS.md` in this repo automatically.

## 4. Open the repo in Claude Code
Start `claude` in the repo folder (or open the folder in the desktop app) and **trust the folder**. Claude Code then offers to install the team plugins from `.claude/settings.json`:

- `ecc@ecc`: the hackathon workflow (agents, skills, hooks)
- `context7@claude-plugins-official`: up-to-date library docs
- `frontend-design@claude-plugins-official`: better UI output

If you don't get the prompt, install them yourself:

```bash
claude plugin install context7@claude-plugins-official
```

```bash
claude plugin install frontend-design@claude-plugins-official
```

## 5. Keep the context window lean (from the article)
In Claude Code, run `/context` and `/mcp`. Keep **10 or fewer MCP servers and about 80 or fewer tools** enabled for this project, and disable plugins you won't use here. Every enabled tool takes up context.

## 6. Optional extras the article recommends
- Language servers, once we pick a stack: `claude plugin install typescript-lsp@claude-plugins-official` or `pyright-lsp@claude-plugins-official`.
- `hookify`: ECC already includes `/ecc:hookify` for creating hooks by describing them.
- `mgrep` (semantic search): `claude plugin marketplace add https://github.com/mixedbread-ai/mgrep`, then install it from `/plugin`. Needs a Mixedbread account.

## Done checklist
- [ ] `claude plugin list` shows `ecc@ecc`, `context7`, `frontend-design`
- [ ] `codex plugin list` shows `ecc@ecc`
- [ ] `~/.claude/rules/ecc/common/` exists
- [ ] `git pull` works in `TypeShipt`
- [ ] Read `docs/WORKFLOW.md`
