# Agent Teams — Master Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams (Claude Code docs, accurate as of v2.1.234)
>
> This is a working reference for using Claude Code's **agent teams** feature effectively on this project. It's a condensed, organized rewrite of the official docs — kept here so the reasoning behind team-based workflows doesn't have to be re-derived every time.

## Status: Experimental, opt-in

Agent teams are **disabled by default**. Enable them via `settings.json` (project, user, or local) or an environment variable:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Without this flag: no team directories are created, and Claude never spawns or proposes teammates — a named subagent runs as an ordinary subagent instead.

Requires an **interactive session**. In non-interactive/headless mode (`-p` flag, Agent SDK), teammates are never spawned, even with the flag set — named subagents just run as regular subagents.

To turn it back off without restarting the session, set the var to `"0"` in `settings.json` — Claude Code re-reads it on the next spawn attempt (no restart needed). Watch settings precedence: project/local settings or managed settings can override a user-level `"0"`.

---

## Core concept: teams vs. subagents

Both parallelize work, but the coordination model is fundamentally different.

| | Subagents | Agent teams |
|---|---|---|
| **Context** | Own context window; result returns to caller | Own context window; fully independent, no return value |
| **Communication** | Result handed back to the caller | Teammates message each other directly (`SendMessage`) |
| **Coordination** | Main agent manages everything | Self-coordination via messages + a shared task list |
| **Best for** | Focused task where only the final result matters | Work needing discussion, debate, or ongoing collaboration |
| **Token cost** | Lower — only the summarized result re-enters context | Higher — every teammate is a full separate Claude instance |

**Rule of thumb:** if the task is "go do X and tell me what you found," use a subagent. If the task needs multiple perspectives that argue with or build on each other in real time, use a team.

Note: enabling agent teams changes *ordinary* delegation too — Claude sometimes names subagents on its own (so it can message them later), and while the team flag is on, a *named* subagent launches as a teammate instead of a subagent. This means a team can form even when you didn't explicitly ask for one. See [Troubleshooting](#claude-spawns-teammates-instead-of-subagents-you-wanted) if this causes problems for an orchestration flow expecting subagent-style return values.

---

## Starting a team

Just describe the task and the roles you want, in plain language:

```text
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Spawn three teammates to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```

Claude will:
1. Populate a shared task list
2. Spawn a teammate per requested role
3. Let them explore independently
4. Synthesize findings back to you

If Claude spawns subagents instead of a team (they appear in the same panel, so it's not obvious at a glance), explicitly ask again and say "agent team."

### Specifying teammates and models

Be explicit if you care about count or model:

```text
Spawn 4 teammates to refactor these modules in parallel. Use Sonnet for each teammate.
```

- If no model is named, teammates run on the lead's current model (unless `CLAUDE_CODE_SUBAGENT_MODEL` env var is set).
- Teammates inherit the lead's **effort level**.
- Model choice is checked against any org-level `availableModels` allowlist; blocked values fall back to the lead's model (or, for family aliases like `opus`, to the newest allowlisted version of that family where supported).

### Requiring plan approval

For risky or complex work, force a teammate into read-only plan mode until you (via the lead) approve their approach:

```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

The lead reviews and approves/rejects plans **autonomously** — give it explicit criteria in your prompt if you want to steer that judgment (e.g. "only approve plans that include test coverage").

### Reusable roles via subagent definitions

Reference an existing subagent definition (project, user, plugin, or CLI-defined) by name to reuse a role as both a delegated subagent *and* a team member:

```text
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

The teammate inherits that definition's `tools` allowlist and `model`; the definition body is *appended* to the teammate's system prompt (not a replacement). Caveat: a subagent definition's `skills` and `mcpServers` frontmatter fields are **ignored** when running as a teammate — teammates load skills/MCP servers from project/user settings like a normal session.

---

## Interacting with a running team

### Display modes

- **In-process (default)**: everything in one terminal. Arrow keys to select a teammate in the agent panel, Enter to view/message it, `x` to stop it, Ctrl+T to toggle the task list. Works everywhere.
- **Split panes**: one pane per teammate, all visible at once. Requires **tmux** or **iTerm2** (with the [`it2` CLI](https://github.com/mkusaka/it2) and Python API enabled). Not supported in VS Code's integrated terminal, Windows Terminal, or Ghostty.

Set the default in `~/.claude/settings.json`:

```json
{
  "teammateMode": "auto"
}
```

Or per-session: `claude --teammate-mode auto` (experimental, not in `--help`).

Modes: `"in-process"` (default since v2.1.179), `"auto"` (split panes if already in tmux or iTerm2+it2, else in-process), `"tmux"` (forces split, auto-detects tmux vs iTerm2), `"iterm2"` (forces iTerm2 native panes, v2.1.186+).

### Idle-row behavior in the panel (v2.1.199+)

An idle teammate's row stays visible while *any* agent is still working. Once everyone is idle, rows hide after 30s and reappear on the teammate's next turn — the teammate is still running and addressable while hidden, just send it a message by name. More than 3 idle teammates collapse into a single `N idle agents` row; Enter expands it.

### Talking to a teammate directly

Each teammate is a full independent Claude Code session — message it directly for follow-ups or redirection.

- In-process: select via arrows → Enter → type. Plain text and `/skills` go to the teammate; **built-in commands run in the lead's session**.
- `/model` and `/fast` only ever affect the **lead** (a notice appears as of v2.1.199 when you type them while viewing a teammate). `/effort` *does* apply to the viewed teammate, since teammates follow the lead's effort level.

### Shutting a teammate down

```text
Ask the researcher teammate to shut down
```

The lead sends a shutdown request; the teammate can accept (exits gracefully) or reject with an explanation. Team directories are cleaned up automatically at session end — no manual cleanup step needed.

### Quality gates via hooks

- `TeammateIdle` — fires before a teammate goes idle; exit code 2 sends feedback and keeps it working.
- `TaskCreated` — fires on task creation; exit code 2 blocks creation + sends feedback.
- `TaskCompleted` — fires when a task is marked complete; exit code 2 blocks completion + sends feedback.

Use these to enforce e.g. "don't mark a task done without tests" project-wide.

---

## How it works under the hood

### Architecture

| Component | Role |
|---|---|
| **Team lead** | The main session — spawns teammates, coordinates, synthesizes |
| **Teammates** | Independent Claude Code instances, each with assigned tasks |
| **Task list** | Shared work-item list teammates claim from |
| **Mailbox** | Per-agent JSON file for inter-agent messaging |

- Mailbox path: `~/.claude/teams/{team-name}/inboxes/{agent-name}.json`. Malformed entries are dropped (with an error) but valid ones still deliver (fixed behavior since v2.1.207 — previously one bad entry blocked the whole mailbox).
- A message is reported "sent" only once the write to the recipient's mailbox file succeeds — if the disk is full or the directory isn't writable, the sender gets an error and nothing is sent.
- Team name = `session-` + first 8 chars of the session ID. Config at `~/.claude/teams/{team-name}/config.json` (removed at session end); tasks at `~/.claude/tasks/{team-name}/` (persists locally, never uploaded, survives session resume — governed by `cleanupPeriodDays`).
- **Don't hand-edit `config.json`** — it holds live runtime state (session IDs, tmux pane IDs) and gets overwritten on the next update. There is no project-level equivalent (a `.claude/teams/teams.json` in your repo is just an ordinary file, not config).
- Task dependencies resolve automatically — completing a task unblocks dependents with no manual action.

### Task list mechanics

- Three states: pending → in progress → completed.
- Tasks can depend on other tasks; a pending task with unresolved dependencies can't be claimed yet.
- **Lead assigns** explicitly, or **teammates self-claim** the next unblocked task after finishing their current one.
- Claiming uses file locking to avoid race conditions between teammates grabbing the same task.
- Agents *without* Task tools coordinate purely through messages instead.

### Permissions

- Teammates inherit the **lead's** permission mode at spawn time (including `--dangerously-skip-permissions` if the lead has it). You can change an individual teammate's mode *after* spawn, but not set per-teammate modes at spawn time.
- All teammate permission prompts surface in the **lead's** session — approve them there.
- Plan approval is the one exception: the lead grants teammate plan approvals itself, without prompting you.
- **Messages between agents are never treated as user consent.** A teammate can't approve a permission prompt on your behalf, and can't relay a denied action through another teammate to bypass a check. In auto mode, the classifier treats a relayed "approval" claim as untrusted input and reviews every inter-agent message (plain or structured) before delivery — a blocked message never reaches its recipient.

### Context and communication

- Teammates load the same project context as a fresh session (CLAUDE.md, MCP servers, skills) plus the spawn prompt — they do **not** inherit the lead's conversation history.
- Messages deliver automatically; the lead doesn't poll.
- **Idle notification ≠ result.** When a teammate finishes, it notifies the lead that it stopped — but the notification carries no output. A teammate must actively message the lead or update the task list to share results. (As of v2.1.198, a teammate whose turn ends on an API error explicitly reports failure + the error text, rather than looking like a normal finish.)
- To reach everyone, send one message per recipient — there's no broadcast.
- Names are assigned by the lead at spawn time; tell the lead what to call each teammate up front if you want to reference them predictably later.

### Token cost

Token usage scales roughly linearly with active teammate count — each one is a full separate context window. Worth it for research/review/new-feature work; not for routine tasks.

Cache-TTL detail: an in-process teammate's requests fall outside the main conversation's cache bucket, so they default to a 5-minute cache TTL (even on a subscription plan). Set `subagentPromptCacheTtl` to `1h` to extend it — note the API bills 1-hour cache writes at a higher rate.

---

## When to reach for a team (use cases)

- **Parallel code review** — split review criteria across teammates (security / performance / test coverage) so no single lens dominates:
  ```text
  Spawn three teammates to review PR #142:
  - One focused on security implications
  - One checking performance impact
  - One validating test coverage
  Have them each review and report findings.
  ```
- **Competing-hypothesis debugging** — assign each teammate a theory and have them actively try to *disprove* each other's, converging on the real root cause faster than sequential investigation (which anchors on the first plausible explanation found):
  ```text
  Users report the app exits after one message instead of staying connected.
  Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
  each other to try to disprove each other's theories, like a scientific
  debate. Update the findings doc with whatever consensus emerges.
  ```
- **New modules/features** where teammates each own a separate, non-overlapping piece.
- **Cross-layer coordination** — frontend / backend / tests each owned by a different teammate.

Avoid teams for: sequential tasks, same-file edits, or work with heavy inter-step dependencies — the coordination overhead isn't worth it there. A single session or a plain subagent is more efficient.

---

## Best practices

1. **Give teammates enough context in the spawn prompt.** They don't see your conversation history — be explicit:
   ```text
   Spawn a security reviewer teammate with the prompt: "Review the authentication
   module at src/auth/ for security vulnerabilities. Focus on token handling,
   session management, and input validation. The app uses JWT tokens stored in
   httpOnly cookies. Report any issues with severity ratings."
   ```
2. **Team size: start with 3–5.** Token cost scales linearly, coordination overhead grows with headcount, and returns diminish fast. Three focused teammates usually beat five scattered ones.
3. **Size tasks to be self-contained deliverables** — a function, a test file, a review. Too small → coordination eats the gain. Too large → teammates drift too long between check-ins. Aim for ~5–6 tasks per teammate so the lead can reassign if someone stalls.
4. **Don't let the lead start doing the work itself.** If it jumps in instead of waiting on teammates: `Wait for your teammates to complete their tasks before proceeding`.
5. **Start with research/review tasks**, not parallel implementation, while getting a feel for how teams behave — lower risk of file conflicts, same benefit of parallel exploration.
6. **Avoid file conflicts** — never let two teammates own the same file; partition explicitly.
7. **Monitor and steer actively.** Don't let a team run unattended for long stretches; check progress, redirect dead-end approaches, synthesize as findings arrive.

---

## Troubleshooting

**Teammates not appearing**
- Check the agent panel (arrow keys + Enter) — an idle row may just be hidden (30s after the whole panel goes idle); message it by name to bring it back.
- Claude may have judged the task not complex enough to warrant a team.
- For split-pane mode, verify `tmux` is on PATH (`which tmux`) or, for iTerm2, that `it2` is installed and the Python API is enabled.

**Claude spawns teammates instead of subagents you wanted**
- Since a *named* subagent launches as a teammate whenever the flag is on, an orchestration flow expecting a subagent's direct return value can stall (idle notifications don't carry output). Fix: set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to `"0"` — takes effect on the next subagent spawn, no restart needed. Check settings precedence (project/local/managed settings can override a user-level `"0"`).

**Too many permission prompts**
- All teammate prompts bubble to the lead. Pre-approve common operations in permission settings before spawning a team to cut interruptions.

**Agents stopping early**
- Select the teammate and inspect its output; either give it more instructions directly or spawn a replacement to continue. A message from the lead or another teammate wakes an in-process teammate that's waiting to retry a failed API call.
- The lead itself can also call it quits early — tell it to keep going if the team isn't actually done.

**Orphaned tmux sessions**
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## Known limitations (experimental feature)

- **No session resumption for in-process teammates** — `/resume`/`/rewind` don't restore them; the lead may try to message teammates that no longer exist after resume. Tell it to respawn.
- **Task status can lag** — teammates sometimes fail to mark tasks complete, blocking dependents. Check manually / nudge the teammate if something looks stuck.
- **Shutdown can be slow** — a teammate finishes its current tool call/request before shutting down.
- **One team per session**, scoped to that session — no multiple named teams, no sharing a team across sessions.
- **No nested teams** — only the lead can spawn/manage teammates; teammates can't spawn their own.
- **No background subagents from in-process teammates** — a teammate's own subagent work runs in the foreground only (can't outlive the lead's process); `background: true` definitions and `run_in_background: true` requests fail or silently run in the foreground.
- **Lead is fixed** for the session's lifetime — no promoting a teammate to lead, no leadership transfer.
- **Permissions fixed at spawn** — can change an individual teammate's mode after the fact, but can't set per-teammate modes at spawn time.
- **Split panes need tmux or iTerm2** — unsupported in VS Code's integrated terminal, Windows Terminal, Ghostty (in-process mode always works as a fallback).

---

## Related approaches

- **[Subagents](https://code.claude.com/docs/en/sub-agents)** — lightweight, single-session delegation for research/verification that doesn't need inter-agent coordination. Default choice when only the final result matters.
- **[Git worktrees](https://code.claude.com/docs/en/worktrees)** — manually run multiple Claude Code sessions yourself, without automated team coordination. Useful when you want full manual control over parallelism rather than letting Claude self-coordinate.

---

## Quick-decision checklist for this project

Before spawning a team, ask:

- [ ] Does this genuinely need *multiple simultaneous perspectives* (review, competing hypotheses, independent modules), or would one focused subagent do?
- [ ] Can the work be partitioned so teammates don't touch the same files?
- [ ] Is this an interactive session (teams don't work headless)?
- [ ] Have I given each teammate enough standalone context in its spawn prompt (no shared history)?
- [ ] Am I prepared to actively monitor/steer rather than fire-and-forget?
- [ ] Is the expected token spend justified by the task (research/review/new-feature — yes; routine edit — probably not)?

If most boxes check, request a team explicitly by name/role in your prompt (Claude won't reliably infer "team" vs. "subagent" from context alone).
