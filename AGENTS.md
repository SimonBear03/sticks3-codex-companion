# M5Stack Codex Companion Agent Guide

This repository owns the M5Stack Codex Companion firmware, Python bridge, and
native macOS companion controller. It is portable and can be opened on its own.

## Start Here

1. Read `README.md` for the current product scope, setup, and validation path.
2. Read `docs/architecture.md` for current system boundaries and owners.
3. Read `planning/current-state.md` for the current implementation state and
   next hardware-validation work.
4. Read only the relevant file under `docs/` before changing the BLE protocol,
   distribution flow, Cardputer behavior, or Mac Codex bridge.
5. Before a durable decision or substantial implementation, follow
   `agent_notes/README.md`.
6. Run `git status --short --branch` before meaningful edits.

## Development Governance

- Before creating an Agent Note, search scoped existing notes and record whether
  the decision extends, partially or fully supersedes, or is independent from
  them.
- Archived Agent Note triplets are sealed. Never edit or delete them; follow the
  archive manifest workflow in `agent_notes/README.md`.

- Before substantial implementation, clarify the problem, observable outcome,
  constraints, non-goals, genuine alternatives, acceptance criteria, and risks.
- Discuss unresolved semantics before code commits the decision. Do not use SPEC
  tiers or require fixed requirements/design/tasks files.
- Add or update an Agent Note for durable changes to behavior, architecture,
  shared contracts, process or tooling, testing strategy, configuration, or
  wire and persistence formats.
- Keep current behavior in README/current docs, live implementation handoff in
  `planning/current-state.md`, and durable rationale in Agent Notes.
- Every abstraction, state mechanism, public interface, configuration option,
  compatibility path, and package needs a current owner and consumer.
- Prefer the smallest architecture that preserves required behavior. Remove
  dead layers, duplicate paths, speculative compatibility, and abstractions
  without current consumers when evidence makes that safe.
- Keep implementation, tests, current docs, and the owning Agent Note coherent.
- Tests follow repository conventions and need not move into a universal test
  folder. Write a postmortem only for subtle, systemic, costly-to-rediscover
  incidents.

## Workspace Memory Bridge

When a containing Simon workspace provides `system/pkm_memory_bridge.md` and
`9_pkm/`:

- Follow the bridge after meaningful project work.
- Read `9_pkm/AGENTS.md` before writing to the vault.
- Keep project and PKM Git changes separate; report pending memory handoffs.

When opened independently, follow this repo guide only.

## Work Mode

- Use the current branch for small documentation, narrow bug-fix, and focused
  validation work.
- Use a short-lived branch for larger firmware behavior, protocol, desktop
  integration, packaging, or multi-file experimental changes.
- Inspect and preserve existing work when the checkout is dirty.

## Project Boundaries

- `src/main.cpp` owns the StickS3 and Cardputer ADV firmware behavior.
- `bridge/sticks3_bridge/` owns the Python Desktop observer and App Server
  bridge.
- `scripts/` owns the macOS bridge supervisor and companion build helpers.
- `macos/` owns the native menu bar companion.
- `docs/` owns protocol, distribution, hardware-reference, and bridge details.
- `planning/current-state.md` owns the concise current implementation handoff.

## Validation

- For Python bridge changes, run the relevant tests under `tests/`; use
  `.bridge-venv/bin/python -m unittest discover -s tests` when that environment
  is available.
- For firmware changes, run the relevant PlatformIO build for `sticks3` and/or
  `cardputer_adv` using the available repo-local or system PlatformIO command.
- For macOS companion changes, use `scripts/build-macos-companion` and the
  documented manual validation path when running on a Mac.
- For documentation-only changes, review the Markdown and run
  `git diff --check`.
- For governance documents, also run:

  ```bash
  node tools/governance/verify_agent_notes.mjs
  node tools/governance/verify_bilingual_docs.mjs
  ```

- Report any hardware or platform validation that remains pending on the
  current machine.

## Git

- Check `git status --short --branch` before and after meaningful edits.
- Pull with `git pull --ff-only` when the checkout is clean and staying current
  matters.
- Keep commits focused, reviewed, and supported by the relevant validation.
- Push changes that are ready to share under the active branch policy.

## Secrets And Runtime

Keep credentials, local pairing data, runtime status, logs, virtual
environments, PlatformIO output, generated apps, caches, and machine-local
launch configuration in their documented ignored locations.

## Reporting

Report the target hardware or bridge mode, validation performed, Git state,
and any remaining physical-device or macOS-only checks.
